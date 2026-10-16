import { Capacitor } from '@capacitor/core';
import { openExternal } from './externalLink';

export interface AppUpdateInfo {
  versionCode: number;
  versionName: string;
  apkUrl: string;
  changelog: string;
}

const UPDATE_CHECK_URL = 'https://cdn.jsdelivr.net/gh/rezagazi-code/padel@apk-releases/releases/latest.json';
// Current version - must match android/app/build.gradle
export const CURRENT_VERSION_CODE = 81;
export const CURRENT_VERSION_NAME = '3.15.28';

export async function checkForAppUpdate(): Promise<AppUpdateInfo | null> {
  const r = await checkForAppUpdateDetailed();
  return r.status === 'update' ? r.info : null;
}

/**
 * Detailed update check that distinguishes "up to date" from "check failed"
 * (network error, timeout, bad JSON, non-OK response). checkForAppUpdate
 * intentionally swallows failures to null; callers that need retry/failure
 * UI (App.tsx) use this instead.
 */
export type UpdateCheckResult =
  | { status: 'update'; info: AppUpdateInfo }
  | { status: 'up-to-date' }
  | { status: 'failed' };

export async function checkForAppUpdateDetailed(): Promise<UpdateCheckResult> {
  // Only check in native app — on web there is nothing to check, which is
  // "up to date", never a failure (no failure banner on web).
  if (!Capacitor.isNativePlatform()) return { status: 'up-to-date' };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(UPDATE_CHECK_URL + '?t=' + Date.now(), {
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) return { status: 'failed' };
    let info: AppUpdateInfo;
    try {
      info = await res.json();
    } catch {
      return { status: 'failed' };
    }
    if (info.versionCode > CURRENT_VERSION_CODE) {
      return { status: 'update', info };
    }
    return { status: 'up-to-date' };
  } catch {
    // Abort, network error: the check failed (distinct from "no update").
    return { status: 'failed' };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * HEAD probe of the update endpoint. checkForAppUpdate intentionally swallows
 * failures and returns null, which is indistinguishable from "up to date".
 * AuthModal uses this on native to tell "check failed" (offline/jsDelivr
 * down) apart from "no newer version" so it can offer retry/explicit-continue.
 */
export async function isUpdateEndpointReachable(timeoutMs = 8000): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(UPDATE_CHECK_URL, {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export function openApkDownload(url: string) {
  // Open in system browser - user will get install prompt after download
  void openExternal(url);
}
// retrigger 3.15.5 build (infra flake retry)

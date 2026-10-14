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
export const CURRENT_VERSION_CODE = 76;
export const CURRENT_VERSION_NAME = '3.15.23';

export async function checkForAppUpdate(): Promise<AppUpdateInfo | null> {
  // Only check in native app
  if (!Capacitor.isNativePlatform()) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(UPDATE_CHECK_URL + '?t=' + Date.now(), {
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const info: AppUpdateInfo = await res.json();
    if (info.versionCode > CURRENT_VERSION_CODE) {
      return info;
    }
    return null;
  } catch {
    // Abort, network error, or bad JSON: fail silent (null = no update).
    return null;
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

import { Capacitor, CapacitorHttp, registerPlugin } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

interface ApkInstallerPlugin {
  installApk(options: { path: string }): Promise<{ launched: boolean }>;
}
const ApkInstaller = registerPlugin<ApkInstallerPlugin>('ApkInstaller');

export interface DownloadProgress {
  /** 0..1 while downloading, 1 when done */
  progress: number;
  /** Human-readable status for the UI */
  status: 'downloading' | 'installing' | 'done' | 'error';
  error?: string;
}

/**
 * Download the APK natively (bypassing the browser, which gets stuck on a
 * black screen for APK URLs on some devices) and launch the Android package
 * installer via FileProvider. On failure the caller is told via
 * report({status:'error'}) — the UI offers a retry and an explicit
 * "download with browser" button; we deliberately do NOT auto-open the
 * browser here (that was the 2026-10-17 black-screen incident).
 */
export async function downloadAndInstallApk(
  url: string,
  onProgress?: (p: DownloadProgress) => void
): Promise<void> {
  const report = (p: DownloadProgress) => onProgress?.(p);
  try {
    report({ progress: 0, status: 'downloading' });
    // CapacitorHttp gives us raw bytes without CORS issues on native
    const res = await CapacitorHttp.get({
      url,
      responseType: 'arraybuffer',
      connectTimeout: 20000,
      readTimeout: 120000,
    });
    if (res.status < 200 || res.status >= 300 || !res.data) {
      throw new Error(`HTTP ${res.status}`);
    }
    // res.data is an ArrayBuffer — convert to base64 for Filesystem
    const bytes = new Uint8Array(res.data as ArrayBuffer);
    // Collect chunks first and join once: string += in a loop over ~17MB
    // is O(n²) and stalls the main thread.
    const parts: string[] = [];
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      parts.push(String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK) as unknown as number[]));
    }
    const binary = parts.join('');
    const base64 = btoa(binary);
    report({ progress: 0.9, status: 'downloading' });

    const fileName = 'padelpro-update.apk';
    await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Cache,
    });
    const uri = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });
    // uri.uri is like file:///data/user/0/ir.padelpro.arena/cache/padelpro-update.apk
    // Strip the file:// prefix for the native File constructor
    const filePath = uri.uri.replace(/^file:\/\//, '');

    report({ progress: 1, status: 'installing' });
    await ApkInstaller.installApk({ path: filePath });
    report({ progress: 1, status: 'done' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    report({ progress: 0, status: 'error', error: msg });
  }
}

// retrigger 3.15.5 build (infra flake retry)

export interface AppUpdateInfo {
  versionCode: number;
  versionName: string;
  apkUrl: string;
  changelog: string;
}

const UPDATE_CHECK_URL = 'https://cdn.jsdelivr.net/gh/rezagazi-code/padel@apk-releases/releases/latest.json';
// Current version - must match android/app/build.gradle
export const CURRENT_VERSION_CODE = 89;
export const CURRENT_VERSION_NAME = '3.15.36';

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
// retrigger 3.15.5 build (infra flake retry)

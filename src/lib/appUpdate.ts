import { Capacitor, registerPlugin } from '@capacitor/core';
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
 * Resolve the final download URL before handing it to the native
 * downloader. CDN/jsDelivr URLs 302-redirect to edge nodes; the native
 * download stack does not reliably follow those, which left users staring
 * at 0% forever (2026-10-22: dialog appeared, download never started).
 * HEAD with redirect:follow first; if the server refuses HEAD, fall back
 * to a 1-byte Range GET (the 206 response carries the final URL).
 * Never throws — worst case returns the original URL.
 */
async function resolveFinalUrl(url: string, timeoutMs = 10000): Promise<string> {
  const once = async (init: RequestInit): Promise<string | null> => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, redirect: 'follow', signal: controller.signal });
      if (res.url && res.url !== url) return res.url;
      if (res.ok) return url;
      return null;
    } catch {
      return null;
    } finally {
      clearTimeout(t);
    }
  };
  return (await once({ method: 'HEAD' }))
      ?? (await once({ headers: { Range: 'bytes=0-0' } }))
      ?? url;
}

/**
 * Download the APK natively (bypassing the browser, which gets stuck on a
 * black screen for APK URLs on some devices) and launch the Android package
 * installer via FileProvider. Uses Filesystem.downloadFile with REAL
 * progress events (the old CapacitorHttp.get approach reported 0% for the
 * whole download, so on slow networks it looked like the download never
 * started). On failure the caller is told via report({status:'error'}) —
 * the UI offers a retry and an explicit "download with browser" button;
 * we deliberately do NOT auto-open the browser here (that was the
 * 2026-10-17 black-screen incident).
 */
export async function downloadAndInstallApk(
  url: string,
  onProgress?: (p: DownloadProgress) => void
): Promise<void> {
  const report = (p: DownloadProgress) => onProgress?.(p);
  // APK install is Android-only: on iOS there is no package installer, so
  // refuse immediately instead of downloading an APK that can never install.
  if (Capacitor.getPlatform() !== 'android') {
    report({ progress: 0, status: 'error', error: 'APK install is Android-only' });
    return;
  }
  const fileName = 'padelpro-update.apk';
  try {
    report({ progress: 0, status: 'downloading' });
    // 0. Wipe any stale APK from a previous attempt FIRST: the 1MB size
    // gate below must only ever see bytes from THIS download. Without this,
    // a failed download (DNS/404/abort before anything is written) leaves
    // the old file in place, the gate passes on the STALE file, and
    // installApk launches the old build while the UI reports success.
    await Filesystem.deleteFile({ path: fileName, directory: Directory.Cache }).catch(() => {});
    // 1. Pre-resolve CDN redirects to a direct file URL.
    const finalUrl = await resolveFinalUrl(url);
    // 2. Download with real progress events.
    const handle = await Filesystem.addListener('progress', (status: { bytes?: number; contentLength?: number }) => {
      const bytes = Number(status?.bytes) || 0;
      const total = Number(status?.contentLength) || 0;
      if (total > 0 && bytes >= 0) {
        report({ progress: Math.min(0.99, bytes / total), status: 'downloading' });
      }
    });
    try {
      await Filesystem.downloadFile({
        url: finalUrl,
        path: fileName,
        directory: Directory.Cache,
        progress: true,
      });
    } finally {
      await handle.remove();
    }
    // 3. Sanity gate: refuse to install a truncated/HTML error page.
    const stat = await Filesystem.stat({ path: fileName, directory: Directory.Cache });
    if (!stat || Number(stat.size) < 1024 * 1024) {
      throw new Error(`incomplete download (${stat ? stat.size : 0} bytes)`);
    }
    report({ progress: 1, status: 'downloading' });
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
export const CURRENT_VERSION_CODE = 101;
export const CURRENT_VERSION_NAME = '3.15.48';

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
  // Android-only: the updater downloads + installs an APK, which is
  // meaningless on iOS. On iOS (and web) there is nothing to check, which is
  // "up to date", never a failure (no failure banner on iOS).
  if (Capacitor.getPlatform() !== 'android') return { status: 'up-to-date' };
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
  // Android-only probe (see checkForAppUpdateDetailed): on iOS the updater
  // never runs, so the endpoint is trivially "reachable" — no retry UI.
  if (Capacitor.getPlatform() !== 'android') return true;
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

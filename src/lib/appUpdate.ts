import { Capacitor } from '@capacitor/core';

export interface AppUpdateInfo {
  versionCode: number;
  versionName: string;
  apkUrl: string;
  changelog: string;
}

const UPDATE_CHECK_URL = 'https://cdn.jsdelivr.net/gh/rezagazi-code/padel@apk-releases/releases/latest.json';
// Current version - must match android/app/build.gradle
export const CURRENT_VERSION_CODE = 15;
export const CURRENT_VERSION_NAME = '2.5';

export async function checkForAppUpdate(): Promise<AppUpdateInfo | null> {
  // Only check in native app
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const res = await fetch(UPDATE_CHECK_URL + '?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) return null;
    const info: AppUpdateInfo = await res.json();
    if (info.versionCode > CURRENT_VERSION_CODE) {
      return info;
    }
    return null;
  } catch {
    return null;
  }
}

export function openApkDownload(url: string) {
  // Open in system browser - user will get install prompt after download
  window.open(url, '_system');
}

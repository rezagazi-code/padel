import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

/**
 * Open an external URL reliably on every platform.
 * On the native APK, `window.open(url, '_system')` is silently dead
 * (bundled @capacitor/android 8.x has no onCreateWindow/_system handling),
 * so we use the Capacitor Browser plugin there. On web, a normal
 * `_blank` tab is used.
 */
export async function openExternal(url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await Browser.open({ url });
      return;
    } catch {
      // fall through to window.open below
    }
  }
  window.open(url, '_blank', 'noopener');
}

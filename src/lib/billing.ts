// In-app billing for the native Android build via Cafe Bazaar (Poolakey).
// Web builds: every function degrades gracefully (available === false).
//
// Setup needed in the Bazaar developer panel (Lucka's part):
//   1. Register the app with the same package name as the APK.
//   2. Create the subscription products below (SKUs must match exactly).
//   3. Copy the app's RSA public key into VITE_BAZAAR_RSA_KEY at build time.
import { CafebazaarPoolakey } from '@salarizadi/capacitor-cafebazaar-poolakey';
import type { ProductDetails, PurchaseInfo } from '@salarizadi/capacitor-cafebazaar-poolakey';

export const isNativeApp = (): boolean =>
  typeof window !== 'undefined' &&
  Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.());

// Subscription SKUs — override with VITE_BAZAAR_SUB_SKUS="sku1,sku2" at build time.
export const SUBSCRIPTION_SKUS: string[] = (
  (import.meta.env.VITE_BAZAAR_SUB_SKUS as string | undefined) || 'club_pro_monthly,club_pro_yearly'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export interface BillingStatus {
  available: boolean;
  reason: string;
}

let initialized = false;

export async function getBillingStatus(): Promise<BillingStatus> {
  if (!isNativeApp()) {
    return { available: false, reason: 'billing_unavailable_web' };
  }
  const rsaKey = (import.meta.env.VITE_BAZAAR_RSA_KEY as string | undefined) || '';
  if (!rsaKey) {
    return { available: false, reason: 'billing_no_rsa_key' };
  }
  return { available: true, reason: 'ok' };
}

export async function initBilling(): Promise<boolean> {
  const status = await getBillingStatus();
  if (!status.available || initialized) return status.available && initialized;
  try {
    const rsaKey = (import.meta.env.VITE_BAZAAR_RSA_KEY as string | undefined) || '';
    const res = await CafebazaarPoolakey.initialize({ rsaPublicKey: rsaKey });
    initialized = res.connected;
    return initialized;
  } catch {
    return false;
  }
}

export async function fetchSubscriptionProducts(): Promise<ProductDetails[]> {
  if (!(await initBilling())) return [];
  try {
    const res = await CafebazaarPoolakey.getProducts({ skus: SUBSCRIPTION_SKUS });
    return res.products ?? [];
  } catch {
    return [];
  }
}

export interface PurchaseResult {
  ok: boolean;
  purchase?: PurchaseInfo;
  error?: string;
}

// Starts the Bazaar purchase flow for a subscription SKU.
// NOTE: subscriptions are NOT consumed — the purchase stays active and is
// verified on every app start via restorePurchases().
export async function buySubscription(sku: string, payload?: string): Promise<PurchaseResult> {
  if (!(await initBilling())) {
    return { ok: false, error: 'billing_not_available' };
  }
  try {
    const res = await CafebazaarPoolakey.purchaseProduct({ productId: sku, payload });
    if (res.state === 'PURCHASED' && res.purchase) {
      return { ok: true, purchase: res.purchase };
    }
    return { ok: false, error: res.state };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'purchase_failed' };
  }
}

// Returns active (non-consumed) purchases — used to restore subscriptions.
export async function restorePurchases(): Promise<PurchaseInfo[]> {
  if (!(await initBilling())) return [];
  try {
    const res = await CafebazaarPoolakey.getPurchaseInfo();
    return res.purchases ?? [];
  } catch {
    return [];
  }
}

export async function disconnectBilling(): Promise<void> {
  if (!isNativeApp() || !initialized) return;
  try {
    await CafebazaarPoolakey.disconnect();
  } catch {
    /* ignore */
  }
  initialized = false;
}

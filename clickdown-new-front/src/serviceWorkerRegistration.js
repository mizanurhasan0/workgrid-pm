/**
 * Push notification registration. Registers the push service worker (public/notify.js),
 * subscribes this browser with the VAPID public key and returns the subscription.
 */

/**
 * Converts a base64url VAPID public key to the Uint8Array that pushManager expects.
 * @param {string} base64String The key as stored in VITE_PUBLIC_VAPID.
 * @returns {Uint8Array}
 */
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Asks for notification permission, registers the push worker and subscribes.
 * Never throws: failures are logged and reported as null.
 * @returns {Promise<Object|null>} The PushSubscription as JSON, or null when push is not
 * available, permission was refused or any step failed.
 */
export async function registerPushNotifications() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      return null;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {return null;}

    const registration = await navigator.serviceWorker.register(
      `${import.meta.env.VITE_BASE_URL ?? ''}/notify.js`,
      { scope: '/' },
    );

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const publicKey = import.meta.env.VITE_PUBLIC_VAPID;
      if (!publicKey) {
        console.warn('Push subscription skipped: VITE_PUBLIC_VAPID is not set.');
        return null;
      }
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }
    return subscription ? subscription.toJSON() : null;
  } catch (error) {
    console.error('Push notification registration failed:', error);
    return null;
  }
}

export default registerPushNotifications;

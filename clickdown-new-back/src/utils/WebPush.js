/**
 * Sends a web push notification to one user, if that user has a push subscription.
 * Never throws: push failures must not break the request that triggered them.
 */
function WebPush({ pushObj, membs = [], mId, title, body, icon }) {
  try {
    const usr = membs.find((m) => String(m?.id ?? m?._id) === String(mId));
    const subscription = usr?.push;
    if (subscription && Object.keys(subscription).length > 1) {
      const payload = JSON.stringify({ title, body, icon });
      pushObj.sendNotification(subscription, payload).catch(() => console.log({ error: 'webpush error found' }));
    }
  } catch (error) {
    console.error(error);
  }
}
export default WebPush;

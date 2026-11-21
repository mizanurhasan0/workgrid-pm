// Push-notification service worker. Registered by src/serviceWorkerRegistration.js
// Shows a browser notification for every push message sent by the Workgrid backend.
// Payload: JSON { title, body?, icon? }.
/* eslint-disable no-restricted-globals */
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    data = { title: 'Workgrid', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'Workgrid';
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/logo192.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    const client = clients.find((c) => 'focus' in c);
    if (client) return client.focus();
    return self.clients.openWindow('/');
  }));
});

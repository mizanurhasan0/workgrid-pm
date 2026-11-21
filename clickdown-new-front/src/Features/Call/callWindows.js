/**
 * Records the popup opened for a chat's call, keyed by chat id.
 * The map is shared through GlobalProvider; writes go through this helper.
 * @param {Object} windows the shared map of chat id to window
 * @param {string} chatId chat the call belongs to
 * @param {Window} win the popup returned by window.open
 */
export default function rememberCallWindow(windows, chatId, win) {
  windows[chatId] = win;
}

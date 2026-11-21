import React from 'react';
import { useChatCtx } from '../Context/ChatProvider';

/**
 * Join button while a call is live in this chat; otherwise audio and video call buttons.
 * @param {Object} chat the open chat
 * @param {Component} AudioIcon icon for the audio call button
 * @param {Component} VideoIcon icon for the video call button
 * @param {string} iconClass classes for both icons
 * @param {string} buttonClass classes for both call buttons
 * @param {string} joinClass classes for the join button
 */
export default function CallActions({
  chat, AudioIcon, VideoIcon, iconClass = '', buttonClass = 'shrink-0', joinClass,
}) {
  const { call, join } = useChatCtx();

  if (chat?.call?.onair) {
    return (
      <button
        type="button"
        aria-label="Join ongoing call"
        className={joinClass}
        onClick={() => join(chat.id, chat.call)}
      >
        Join
      </button>
    );
  }

  return (
    <>
      <button type="button" aria-label="Start audio call" className={buttonClass} onClick={() => call({ mode: 'audio' })}>
        <AudioIcon className={iconClass} />
      </button>
      <button type="button" aria-label="Start video call" className={buttonClass} onClick={() => call({ mode: 'video' })}>
        <VideoIcon className={iconClass} />
      </button>
    </>
  );
}

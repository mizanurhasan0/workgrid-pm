import React from 'react';
import { useGlobalCtx } from '../../Context/GlobalProvider';
import Image from '../Image';
import AlertToster from '../AlertToster';
import rememberCallWindow from '../../Features/Call/callWindows';
import CallBtn from './CallBtn';

export function Caller({
  name,
  avatar,
  mode,
  onDecline,
  onAccept,
}) {
  return (
    <div className="flex w-full flex-col gap-4 rounded-xl border border-border bg-raised p-4 text-text shadow-elevated sm:w-80">
      <div className="flex min-w-0 items-center gap-3">
        <Image src={avatar} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">
            {name}
          </h2>
          <span className="text-sm text-success">
            {`Incoming ${mode ? `${mode} ` : ''}call...`}
          </span>
        </div>
      </div>
      {/* Footer */}
      <div className="flex gap-3">
        <CallBtn title="Decline" onClick={onDecline} />
        <CallBtn title="Accept" onClick={onAccept} />
      </div>
    </div>
  );
}

export default function IncommingCall() {
  const { callerOP, setCallerOP, callWindows } = useGlobalCtx();

  const decline = (chatId) => {
    setCallerOP((prev) => prev.filter((d) => d.chatId !== chatId));
  };

  const accept = (chatId, mode) => {
    const win = window.open(`/call/${mode}/${chatId}`, '_blank', 'width=auto, height=auto');
    if (!win) {
      AlertToster('Allow pop-ups for this site to join the call.', 'warning');
      return;
    }
    rememberCallWindow(callWindows, chatId, win);
    setCallerOP((prev) => prev.filter((d) => d.chatId !== chatId));
  };

  if (!callerOP?.length) {return null;}

  return (
    <div
      role="alert"
      aria-label="Incoming calls"
      className="fixed inset-x-3 bottom-20 z-popover flex max-h-[70dvh] flex-col gap-2 overflow-y-auto sm:inset-x-auto sm:bottom-6 sm:right-6 md:bottom-6"
    >
      {callerOP.map((data) => (
        <div key={data.chatId}>
          <Caller
            name={data.user?.name || 'Someone'}
            avatar={data.user?.avatar}
            mode={data.mode}
            onDecline={() => decline(data.chatId)}
            onAccept={() => accept(data.chatId, data.mode)}
          />
        </div>
      ))}
    </div>
  );
}

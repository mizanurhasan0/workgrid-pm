import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import CallBoard from './CallBoard/CallBoard';
import Controls from './Controls/Controls';
import Skeleton from './Skeleton/Skeleton';
import { useCallCtx } from '../Context/CallProvider';

const MISSING = {
  camera: 'Camera access is blocked or no camera was found. You joined with audio only.',
  microphone: 'Microphone access is blocked or no microphone was found. You can still listen in.',
  both: 'Camera and microphone access is blocked or no devices were found. You can still watch and listen.',
};

export default function Wrapper() {
  const loading = useSelector((state) => state.call.loading, shallowEqual);
  const { mediaIssue, retryMedia, endCall } = useCallCtx();

  return (
    <main className="flex h-dvh w-full min-w-0 flex-col gap-3 bg-app p-3 md:p-6">
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          onClick={endCall}
          className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-text hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Back to chats
        </button>
      </div>
      {!loading && mediaIssue ? (
        <div role="alert" className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-lg border border-warning/40 bg-warning-soft px-4 py-3 text-sm text-text">
          <p className="min-w-0 flex-1">
            {MISSING[mediaIssue]}
            {' '}
            Allow access in your browser&apos;s site settings, then try again.
          </p>
          <button
            type="button"
            onClick={retryMedia}
            className="min-h-11 rounded-md bg-warning px-4 text-sm font-semibold text-surface hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          >
            Try again
          </button>
        </div>
      ) : null}
      {loading ? <Skeleton /> : (
        <>
          <div className="min-h-0 flex-1">
            <CallBoard />
          </div>
          <div className="shrink-0 pb-[env(safe-area-inset-bottom)]">
            <Controls />
          </div>
        </>
      )}
    </main>
  );
}

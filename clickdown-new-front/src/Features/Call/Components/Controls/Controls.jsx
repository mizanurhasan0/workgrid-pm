import React from 'react';
import { Maximize } from 'lucide-react';
import { useSelector } from 'react-redux';
import {
  Decline, Mick, MickOff, Screen, Video3, VideoCancel,
} from '../../../../assets';
import { useCallCtx } from '../../Context/CallProvider';
import CtrlFooters from './CtrlFooters';
import { useAuth } from '../../../../Context/AuthProvider';
import checkEqual from '../../../../Utils/checkEqual';

export default function Controls() {
  const { toggle, shareScreen, endCall } = useCallCtx();
  const { user } = useAuth();
  const media = useSelector((state) => state.call.users?.[user?.id]?.media, checkEqual) ?? {};

  const toggleFullScreen = () => {
    const focused = document.getElementById('focused-user');
    if (!focused) {return;}
    if (document.fullscreenElement) {document.exitFullscreen?.();}
    else {focused.requestFullscreen?.().catch(() => {});}
  };

  return (
    <div role="toolbar" aria-label="Call controls" className="flex w-full flex-wrap items-center justify-center gap-3">
      <CtrlFooters
        icon={media.audio ? Mick : MickOff}
        label={media.audio ? 'Mute microphone' : 'Unmute microphone'}
        pressed={!media.audio}
        onClick={() => toggle('Audio')}
      />
      <CtrlFooters
        icon={media.video ? Video3 : VideoCancel}
        label={media.video ? 'Turn off camera' : 'Turn on camera'}
        pressed={!media.video}
        onClick={() => toggle('Video')}
      />
      <CtrlFooters
        icon={Screen}
        label={media.screen ? 'Stop sharing screen' : 'Share screen'}
        pressed={!!media.screen}
        onClick={() => shareScreen()}
      />
      <CtrlFooters icon={Maximize} label="Toggle full screen" onClick={toggleFullScreen} />
      <CtrlFooters icon={Decline} label="End call" danger onClick={endCall} />
    </div>
  );
}

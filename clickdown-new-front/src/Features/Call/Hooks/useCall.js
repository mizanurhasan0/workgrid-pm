import Peer from 'peerjs';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthProvider';
import { useGlobalCtx } from '../../../Context/GlobalProvider';
import AlertToster from '../../../Components/AlertToster';
import stuns from '../../../data/stuns';
import {
  addUsers,
  removeUser,
  setFocused,
  setLoading,
  setMedia,
} from '../callReducers';

// A call window closes itself when nobody answers within this time.
const REJECT_TIMEOUT_MS = 60000;

const stopTracks = (stream) => stream?.getTracks().forEach((track) => track.stop());

const mediaOf = (stream) => ({
  audio: !!stream?.getAudioTracks().length,
  video: !!stream?.getVideoTracks().length,
  screen: false,
});

const peerEndpoint = () => {
  const url = new URL(import.meta.env.VITE_SOCKET_URL || 'http://localhost:9998');
  const secure = url.protocol === 'https:';
  return {
    host: url.hostname,
    port: Number(url.port) || (secure ? 443 : 80),
    secure,
  };
};

// Asks for camera and microphone. Falls back to audio only, and to no media at all,
// so the user can still listen in when a device is missing or blocked.
const acquireLocalStream = async (video) => {
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true, video });
  } catch {
    if (video) {
      try {
        AlertToster('Camera is not available. Joined with audio only.', 'warning');
        return await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch {
        // fall through to the no-media warning below
      }
    }
    AlertToster('Microphone is not available. You can still listen in.', 'warning');
    return null;
  }
};

// What is missing after asking for devices: '' (everything works), 'camera', 'microphone' or 'both'.
const issueOf = (stream, video) => {
  const noAudio = !stream?.getAudioTracks().length;
  const noVideo = video && !stream?.getVideoTracks().length;
  if (noAudio && noVideo) {return 'both';}
  if (noAudio) {return 'microphone';}
  return noVideo ? 'camera' : '';
};

export default function useCall() {
  const dispatch = useDispatch();
  const { user, profile } = useAuth();
  const { socket } = useGlobalCtx();
  const { id, method } = useParams();
  const userId = user?.id;
  const streamsRef = useRef({});
  const peersRef = useRef({});
  // Read by the call board while it renders; every change is followed by a store update.
  const getStream = (key) => streamsRef.current[key];
  const screenRef = useRef(null);
  const releaseRef = useRef(null);
  const [mediaIssue, setMediaIssue] = useState('');

  // Swaps the tracks sent to every connected peer. A null track removes that kind.
  const replaceOutgoingTracks = (stream) => {
    Object.values(peersRef.current).forEach((call) => {
      call.peerConnection?.getTransceivers().forEach((transceiver) => {
        if (!transceiver.sender) {return;}
        const kind = transceiver.receiver.track.kind;
        const track = stream?.getTracks().find((t) => t.kind === kind) ?? null;
        transceiver.sender.replaceTrack(track).catch(() => {});
      });
    });
  };

  const setOnFocusUser = (target) => {
    dispatch((innerDispatch, getState) => {
      const currentFocus = getState().call.focused;
      innerDispatch(setFocused(target.id === currentFocus ? null : target.id));
    });
  };

  const toggle = (which) => {
    const kind = which.toLowerCase();
    dispatch(async (innerDispatch, getState) => {
      const media = getState().call.users[userId]?.media ?? {};
      if (kind === 'video' && media.screen) {
        AlertToster('Stop screen sharing before changing the camera.', 'warning');
        return;
      }
      const enabling = !media[kind];
      const current = streamsRef.current[userId];
      // Keep the other kind of track; this kind is replaced or stopped below.
      let tracks = current ? current.getTracks().filter((t) => t.kind !== kind) : [];
      try {
        if (enabling) {
          const fresh = await navigator.mediaDevices.getUserMedia({ [kind]: true });
          tracks = [...tracks, ...fresh.getTracks()];
        } else {
          current?.getTracks().filter((t) => t.kind === kind).forEach((t) => t.stop());
        }
      } catch {
        AlertToster(`Could not access your ${kind === 'audio' ? 'microphone' : 'camera'}.`, 'error');
        return;
      }
      // A new MediaStream object lets the Video component pick up the change.
      const next = new MediaStream(tracks);
      streamsRef.current[userId] = next;
      replaceOutgoingTracks(next);
      innerDispatch(setMedia({ user: userId, value: { [kind]: enabling } }));
      socket.emit('callMediaUpdate', { chatId: id, media: { ...media, [kind]: enabling } });
    });
  };

  const endScreenShare = () => dispatch(async (innerDispatch, getState) => {
    const shared = screenRef.current;
    if (!shared) {return;}
    screenRef.current = null;
    const media = getState().call.users[userId]?.media ?? {};
    const displayIds = new Set(shared.display.getTracks().map((t) => t.id));
    stopTracks(shared.display);
    // Keep the microphone; the camera is restarted only if it was on before sharing.
    let tracks = (streamsRef.current[userId]?.getTracks() ?? [])
      .filter((t) => t.kind === 'audio' && !displayIds.has(t.id));
    let cameraOn = false;
    if (shared.cameraOn) {
      try {
        const camera = await navigator.mediaDevices.getUserMedia({ video: true });
        tracks = [...tracks, ...camera.getVideoTracks()];
        cameraOn = true;
      } catch {
        AlertToster('Could not restart your camera.', 'warning');
      }
    }
    const next = new MediaStream(tracks);
    streamsRef.current[userId] = next;
    replaceOutgoingTracks(next);
    const value = { screen: false, video: cameraOn };
    innerDispatch(setMedia({ user: userId, value }));
    socket.emit('callMediaUpdate', { chatId: id, media: { ...media, ...value } });
  });

  const startScreenShare = () => dispatch(async (innerDispatch, getState) => {
    const media = getState().call.users[userId]?.media ?? {};
    let display;
    try {
      display = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
    } catch (e) {
      if (e?.name !== 'NotAllowedError' && e?.name !== 'AbortError') {
        AlertToster('Screen sharing could not start.', 'error');
      }
      return;
    }
    const current = streamsRef.current[userId];
    // The camera is stopped while sharing; the microphone keeps running.
    current?.getVideoTracks().forEach((t) => t.stop());
    screenRef.current = { display, cameraOn: !!media.video };
    const next = new MediaStream([...(current?.getAudioTracks() ?? []), ...display.getTracks()]);
    // Browser "Stop sharing" ends the track; go back to the camera then.
    display.getVideoTracks()[0]?.addEventListener('ended', () => endScreenShare());
    streamsRef.current[userId] = next;
    replaceOutgoingTracks(next);
    const value = { screen: true, video: true };
    innerDispatch(setMedia({ user: userId, value }));
    innerDispatch(setFocused(userId));
    socket.emit('callMediaUpdate', { chatId: id, media: { ...media, ...value } });
  });

  const shareScreen = () => (screenRef.current ? endScreenShare() : startScreenShare());

  // Asks for the devices again after the user allowed them in the browser settings.
  const retryMedia = async () => {
    const video = method === 'video';
    const stream = await acquireLocalStream(video);
    if (!stream) {return;}
    stopTracks(streamsRef.current[userId]);
    streamsRef.current[userId] = stream;
    replaceOutgoingTracks(stream);
    const media = mediaOf(stream);
    dispatch(setMedia({ user: userId, value: media }));
    socket.emit('callMediaUpdate', { chatId: id, media });
    setMediaIssue(issueOf(stream, video));
  };

  const endCall = () => {
    releaseRef.current?.();
    window.close();
    // A page that was not opened by a script (for example after a refresh) cannot close itself.
    setTimeout(() => {
      if (!window.closed) {window.location.assign('/chat/create');}
    }, 200);
  };

  useEffect(() => {
    if (!userId) {return undefined;}
    const streamsMap = streamsRef.current;
    const peersMap = peersRef.current;
    const session = { disposed: false, joined: false, released: false, peer: null };
    const rejectTimer = setTimeout(() => window.close(), REJECT_TIMEOUT_MS);

    const localStream = () => streamsMap[userId] ?? new MediaStream();

    const watchRemote = (call) => {
      call.on('stream', (remote) => {
        clearTimeout(rejectTimer);
        streamsMap[call.peer] = remote;
        peersMap[call.peer] = call;
        profile(call.peer)
          .then(({ data }) => {
            if (session.disposed) {return;}
            dispatch(addUsers({
              [data.id]: { ...data, media: { audio: true, video: method === 'video', screen: false } },
            }));
            dispatch(setFocused(data.id));
          })
          .catch(() => AlertToster('Could not load a participant.', 'error'));
      });
      call.on('close', () => {
        delete peersMap[call.peer];
      });
      call.on('error', () => AlertToster('Connection to a participant failed.', 'error'));
    };

    const onJoinCall = (data) => {
      if (data?.id && data.id !== userId) {session.peer?.connect(data.id);}
    };
    const onLeaveCall = (data = {}) => {
      if (!data.id || data.id === userId) {return;}
      peersMap[data.id]?.close();
      delete peersMap[data.id];
      stopTracks(streamsMap[data.id]);
      delete streamsMap[data.id];
      dispatch(removeUser(data.id));
      dispatch((innerDispatch, getState) => {
        if (getState().call.focused === data.id) {innerDispatch(setFocused(null));}
      });
    };
    const onCallMediaUpdate = ({ userId: from, media } = {}) => {
      if (from && from !== userId && media) {dispatch(setMedia({ user: from, value: media }));}
    };
    const onEndCall = (data) => {
      if (data?.chatId === id) {window.close();}
    };

    // Listeners are attached before the media is ready so no event is missed.
    socket.on('joinCall', onJoinCall);
    socket.on('leaveCall', onLeaveCall);
    socket.on('callMediaUpdate', onCallMediaUpdate);
    socket.on('endCall', onEndCall);

    const release = () => {
      if (session.released) {return;}
      session.released = true;
      session.disposed = true;
      clearTimeout(rejectTimer);
      if (session.joined) {socket.emit('entry', { method: 'leave', chat: id, call: true });}
      socket.off('joinCall', onJoinCall);
      socket.off('leaveCall', onLeaveCall);
      socket.off('callMediaUpdate', onCallMediaUpdate);
      socket.off('endCall', onEndCall);
      window.removeEventListener('pagehide', release);
      Object.keys(peersMap).forEach((key) => {
        peersMap[key]?.close();
        delete peersMap[key];
      });
      Object.keys(streamsMap).forEach((key) => {
        stopTracks(streamsMap[key]);
        delete streamsMap[key];
      });
      stopTracks(screenRef.current?.display);
      screenRef.current = null;
      session.peer?.destroy();
      session.peer = null;
    };
    releaseRef.current = release;
    window.addEventListener('pagehide', release);

    const start = async () => {
      dispatch(setLoading(true));
      const video = method === 'video';
      const stream = await acquireLocalStream(video);
      if (session.disposed) {
        stopTracks(stream);
        return;
      }
      if (stream) {streamsMap[userId] = stream;}
      setMediaIssue(issueOf(stream, video));
      dispatch(addUsers({ [userId]: { ...user, media: mediaOf(stream) } }));
      if (video) {dispatch(setFocused(userId));}
      dispatch(setLoading(false));

      session.peer = new Peer(userId, { ...peerEndpoint(), path: '/peerserver', config: stuns });
      session.peer.on('open', () => {
        session.joined = true;
        socket.emit('entry', { method: 'join', chat: id, call: true });
      });
      session.peer.on('call', (call) => {
        call.answer(localStream());
        watchRemote(call);
      });
      session.peer.on('connection', (conn) => {
        conn.on('open', () => {
          watchRemote(session.peer.call(conn.peer, localStream()));
        });
      });
      session.peer.on('error', (err) => {
        // peer-unavailable means the other person already left; that is not an error for us.
        if (err?.type !== 'peer-unavailable') {AlertToster('Call connection error.', 'error');}
      });
    };

    start().catch(() => {
      AlertToster('Could not start the call.', 'error');
      dispatch(setLoading(false));
    });

    return release;
    // The call page connects once per call. `profile` and `user` change identity on
    // every render, so they are read from the render that started the call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, method, userId]);

  return {
    setOnFocusUser,
    getStream,
    toggle,
    shareScreen,
    endCall,
    mediaIssue,
    retryMedia,
  };
}

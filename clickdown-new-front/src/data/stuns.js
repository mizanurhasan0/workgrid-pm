/**
 * Public STUN servers used for WebRTC calls (PeerJS config). Only plain stun: URLs are
 * listed here; no TURN servers and no credentials belong in this file.
 */
const stuns = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.ekiga.net' },
    { urls: 'stun:stun.iptel.org' },
    { urls: 'stun:stunserver.org' },
    { urls: 'stun:stun.voipbuster.com' },
    { urls: 'stun:stun.voxgratia.org' },
    { urls: 'stun:stun.xten.com' },
  ],
};

export default stuns;

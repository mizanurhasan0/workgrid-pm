import { ExpressPeerServer } from 'peer';
import { WebSocketServer } from 'ws';

// WebSocket paths PeerJS clients use (with and without the /peerserver mount prefix)
const PEER_WS_PATHS = ['/peerjs', '/peerserver/peerjs'];

/**
 * Mounts the PeerJS signalling server at /peerserver.
 *
 * PeerJS would otherwise attach a WebSocket server to the HTTP server that rejects every
 * upgrade request outside its own path with 400, which breaks Socket.IO websockets.
 * Here the WebSocket server is created in noServer mode and only handles PeerJS paths.
 */
export default function () {
  this.peer = ExpressPeerServer(this.server, {
    ssl: this.ssl,
    debug: false,
    path: '/',
    proxied: true,
    createWebSocketServer: () => {
      const wss = new WebSocketServer({ noServer: true });
      this.server.on('upgrade', (req, socket, head) => {
        const { pathname } = new URL(req.url || '/', 'http://localhost');
        if (!PEER_WS_PATHS.includes(pathname)) return;
        wss.handleUpgrade(req, socket, head, (client) => wss.emit('connection', client, req));
      });
      return wss;
    },
  });

  this.express.use('/peerserver', this.peer);

  console.log('=> Peer Server Started!');
}

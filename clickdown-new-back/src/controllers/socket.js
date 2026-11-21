import { Server } from 'socket.io';
import decodeAuthToken from '../utils/decodeAuthToken';

const readCookie = (cookieHeader, name) => {
  const pair = (cookieHeader || '').split(';').map((s) => s.trim()).find((s) => s.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : null;
};

/**
 * Socket authentication. Accepts the auth cookie (set at login) or, in development only,
 * an "Authorization: Bearer <token>" header.
 * @param {Object} socket The socket object.
 * @param {Function} next Function to move forward
 */
async function socketAuth(socket, next) {
  try {
    const bearer = process.env.NODE_ENV === 'development' ? socket.handshake?.headers?.authorization?.replace('Bearer ', '') : null;
    const token = readCookie(socket.handshake?.headers?.cookie, process.env.COOKIE_KEY) || bearer;
    if (!token) throw new Error('Invalid token.');
    const user = await decodeAuthToken(token);
    if (!user) throw new Error('User not found with the provided token.');
    socket.token = token;
    socket.user = user;
    socket.join(user.id);
    next();
  }
  catch (e) {
    next(new Error('unauthorized'));
  }
}

/**
 * Creates the Socket.IO server attached to the HTTP(S) server.
 * @param {http.Server} server The HTTP server instance.
 * @param {Object} options Options; `origin` is the allowed CORS origin list.
 * @returns {Server} The Socket.IO server instance.
 */
export default function start(server, options) {
  const io = new Server(server, {
    cors: {
      origin: options.origin,
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  console.log('=> Socket.io initialized');
  return io;
}

/**
 * Registers the authentication middleware and dispatches every client event to its registered handler.
 * @param {Server} io The Socket.IO server instance.
 * @param {Object} events Map of event name -> { method, props }.
 */
export function listen(io, events) {
  io.use(socketAuth);
  io.on('connection', (ws) => {
    console.log('Connected =>', ws.id);
    ws.on('disconnect', () => console.log('Disconnected =>', ws.id));

    ws.onAny((event, ...args) => {
      const handler = events[event];
      if (!handler) return;
      Promise.resolve(handler.method({ data: args[0], session: ws, ...handler.props })).catch((err) => {
        console.error(`Socket event "${event}" failed:`, err);
        ws.emit('error', { message: 'Something went wrong' });
      });
    });
  });

  console.log('=> Registered all event handlers');
}

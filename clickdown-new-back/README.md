# Workgrid Backend

REST API, Socket.IO realtime server and peer-to-peer signalling for Workgrid.
Built with Express 5, Socket.IO 4, Mongoose 9 (MongoDB) and Node.js 24.

## Requirements

- Node.js 24 or newer (`node -v`)
- npm 10 or newer
- A MongoDB database (local `mongod`, Docker, or MongoDB Atlas)
- OpenSSL, only if you run with HTTPS (`USE_HTTPS=true`, the default)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file and fill in the values:

   ```bash
   cp .env.example .env
   ```

   At minimum set `MONGODB_URL`, `SECRET`, `COOKIE_KEY` and `DEFAULT_ROLE`.
   Generate a strong `SECRET` with `node -p "require('crypto').randomBytes(48).toString('base64url')"`.

3. Create the roles. The API stores users with a role reference, so the roles collection must contain
   documents named `owner`, `admin` and `member` before you register anyone. Using `mongosh`:

   ```js
   db.roles.insertMany([
     { name: 'owner', department: 'management' },
     { name: 'admin', department: 'management' },
     { name: 'member', department: 'general' }
   ]);
   db.roles.findOne({ name: 'member' })._id; // copy this value into DEFAULT_ROLE in .env
   ```

   To make a user an owner, set their `role` field to the `owner` role id.

4. Run in development (restarts on change):

   ```bash
   npm run dev
   ```

   The server listens on `PORT` (default `9998`). Check it with `curl http://localhost:9998/health`.

## HTTPS (optional, recommended for production)

`USE_HTTPS=true` serves HTTPS using the certificate in `SSL_CERT_PATH` and key in `SSL_KEY_PATH`.
(`USE_HTTP2` is accepted as a legacy alias.) For local testing, create a self-signed certificate:

```bash
mkdir -p ssl
openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
  -keyout ssl/privatekey.pem -out ssl/certificate.pem -subj "/CN=localhost"
```

For plain HTTP during local development set `USE_HTTPS=false`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the server from `src/` with Babel and restarts on change |
| `npm run build` | Compiles `src/` to `dist/` (copies the email template too) |
| `npm start` | Runs the compiled server from `dist/` (run `npm run build` first) |
| `npm run lint` | Lints `src/` with ESLint |
| `npm run lint:fix` | Lints and auto-fixes what it can |
| `npm run migrate:priority` | Renames the stored task priorities "Immidate" -> "Immediate" and "Tomorow" -> "Tomorrow" (idempotent) |
| `npm run migrate:reactions` | Backfills the `message` reference of reactions created before reactions recorded their author (idempotent) |

Environment files: the server loads `.env` from the project folder. Set `ENV_FILE=config/dev.env` to use
another file. Real environment variables always win.

## API

- Base path: `/api` (for example `POST /api/user/login`, `GET /api/project`).
- Authentication: the login response sets an HTTP-only cookie named by `COOKIE_KEY`.
  For tooling in development (`NODE_ENV=development`) you can send `Authorization: Bearer <token>` instead.
- Errors are JSON: `{ "status": 400, "message": "..." }`.
- Health: `GET /health`. Uploaded files are served from `GET /api/images/<file>`.
- Realtime: Socket.IO on the same origin. Connect with the auth cookie (or a Bearer token in development).

### Sessions and passwords

- The login token (JWT and cookie) lasts 7 days, or 30 days with `rememberMe: true`. An expired token answers `401 { "message": "Please authenticate" }`.
- Passwords must have at least 8 characters (register, `PATCH /user/setpassword/:id`, `POST /user/change/password`); otherwise `400 { "message": "Password must be at least 8 characters long" }`.
- Chat messages are sanitised on write (HTML allow-list, see `src/utils/sanitizeMessage.js`).
- Task `priority` accepts the legacy spellings "Immidate" / "Tomorow" and stores "Immediate" / "Tomorrow".

### Message reactions

Each reaction is one `Reaction` document per (message, user, emoji); `Message.reactions` keeps the ids.
Every message payload (REST and socket) returns `reactions: [{ id, emoji, name?, user }]`
(`user` is missing on reactions created before this change).

| Endpoint / event | Purpose |
| --- | --- |
| `PUT /api/message/:id/reaction` `{ "emoji": "👍" }` | Adds the current user's reaction (idempotent). Chat members only. Returns `{ id, chat, reactions }` |
| `DELETE /api/message/:id/reaction?emoji=👍` | Removes the current user's reaction (idempotent). Returns `{ id, chat, reactions }` |
| socket `messageReaction` `{ id, emoji, action: "add" \| "remove" \| "toggle" }` | Same through the socket (default `toggle`); errors come back as `error` |
| socket `messageReaction` (server -> every chat member) | `{ id, chat, reactions }` after any change |

Errors: `400` invalid emoji or id, `403` not a chat member, `404` unknown message, `409` deleted message.

### Notification read / archive state

State is stored per user in the `notificationstates` collection (no document = unread, not archived).
`GET /api/task/notify/:userId` (own id only) now returns `read` and `archived` on every notification and accepts
`?archived=true|false` to list only archived / non archived ones.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/notification/unread-count` | `{ count }` of notifications that are neither read nor archived |
| `PATCH /api/notification/:id/read` `{ "read": true }` | Marks read (or unread with `false`). Returns `{ id, read, archived }` |
| `PATCH /api/notification/read-all` | Marks every notification of the user as read. Returns `{ updated }` |
| `PATCH /api/notification/:id/archive` | Archives (and marks as read) |
| `PATCH /api/notification/:id/restore` | Restores an archived notification (stays read) |
| `POST /api/notification/import` `{ "read": [ids], "archived": [ids] }` | One-time import of flags a browser kept in localStorage. Returns `{ imported }` |

A notification the user is not a recipient of answers `403`; an unknown one `404`.

## Project layout

```
src/
  index.js            entry point (connects to MongoDB, starts the server)
  app.js              Express + Socket.IO + HTTP/2 setup and error handling
  settings.js         runtime settings read from environment variables
  controllers/        database helpers, sockets, email, uploads, search
  hooks/              optional server hooks (peer signalling)
  services/           one folder per resource: route file, entity (handlers), schema
  utils/              shared helpers
client/               static files served at /
images/               uploaded files (created at runtime; defaults are tracked)
search/               search index snapshots (created at runtime)
```

## Troubleshooting

- `Missing environment variables: ...` - copy `.env.example` to `.env` and fill in the listed values.
- `ENOENT ... ssl/privatekey.pem` - create the certificate (see HTTPS above) or set `USE_HTTPS=false`.
- `Failed to start the server: ... ECONNREFUSED` or server selection timeout - check `MONGODB_URL` and that MongoDB is running.
- Invitations and password-reset emails need the `SMTP_*` and `EMAIL_FROM` values.

## License

MIT. See [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md).

## Demo accounts (local development)

Create the roles and one demo account per role (owner, admin, member) in your local database:

```bash
npm run seed
```

The seed is idempotent and refuses to run when `NODE_ENV=production`. The sign-in page shows these accounts with click-to-fill in development only.

## Sample data (local development)

After `npm run seed`, add projects, tasks, bugs, sprints, custom fields, chats, messages, comments, reactions, attachments, invitations and notifications:

```bash
npm run seed:data           # skips if the sample data already exists
npm run seed:data -- --reset  # wipes the sample collections and seeds again
```

Team accounts created by the seed (password is the name followed by `@12345`, e.g. `priya@workgrid.test` / `Priya@12345`): priya, rafi, nadia.

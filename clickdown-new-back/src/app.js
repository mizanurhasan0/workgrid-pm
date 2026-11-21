import express, { json, urlencoded, Router } from 'express';
import cookieParser from 'cookie-parser';
import form from 'express-form-data';
import https from 'node:https';
import http from 'node:http';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import morgan from 'morgan';
import actuator from 'express-actuator';
import cors from 'cors';
import webpush from 'web-push';
// Local Services
import { hooks } from './hooks';
import { services } from './services';
import socket, { listen as wsListen } from './controllers/socket';
import SearchCtrl from './controllers/search/search';
import NewMailer from './controllers/email';
import * as operations from './controllers/operations';
import { imageUp } from './controllers/imageUp';
import settings from './settings';
import { sendFailure, fail } from './utils/httpError';

const clientDir = path.resolve(__dirname, '..', 'client');

export default class App {
  constructor() {
    this.express = express();
    this.router = new Router();
    this.config = settings;
    this.search = new SearchCtrl();
    this.mail = NewMailer(this.config);
    this.imageUp = imageUp;
    this.db = operations;
    this.events = {};
    this.webpush = webpush;
    if (process.env.PUBLICVAPKEY && process.env.PRIVATEVPKEY) {
      webpush.setVapidDetails(this.config.vapidSubject, process.env.PUBLICVAPKEY, process.env.PRIVATEVPKEY);
    } else {
      console.log('=> Web push disabled (PUBLICVAPKEY / PRIVATEVPKEY not set)');
    }
    // Boot Up the server & services
    this.init();
  }

  async start() {
    await this.search.start();
    this.listen();
  }

  init() {
    const { parse } = form;

    this.express.enable('trust proxy');
    this.express.disable('x-powered-by');

    // Load the middlewares
    this.express.use(
      cors({
        origin: this.config.origin,
        credentials: true,
      }));
    this.express.use(morgan('common')); // Logger
    this.express.use(actuator({ infoGitMode: 'simple' })); // Health Checker
    this.express.use(json()); // Parse JSON body
    this.express.use(urlencoded({ extended: false })); // Legacy URL encoding
    this.express.use(cookieParser()); // Parse cookies
    this.express.use(parse()); // Parse multipart form data (files are written to the OS temp dir)
    this.express.use(express.static(clientDir)); // Static client files
    this.express.use('/api', this.router); // All the API routes

    if (this.config.useHTTPS) {
      // TLS configuration (paths come from SSL_KEY_PATH / SSL_CERT_PATH)
      this.ssl = {
        key: readFileSync(path.resolve(this.config.sslKeyPath)),
        cert: readFileSync(path.resolve(this.config.sslCertPath)),
      };
      // HTTPS (HTTP/1.1). HTTP/2 with HTTP/1.1 fallback (node:http2 allowHTTP1) crashes on Express 5 under Node 24.10, see README.
      this.server = https.createServer(this.ssl, this.express);
    } else {
      this.server = http.createServer(this.express);
    }

    // Load the Hooks (PeerJS signalling server) in both HTTP and HTTPS mode
    hooks(this);

    // Socket Server
    this.socket = socket(this.server, { origin: this.config.origin });
    // Load the Services
    services(this);

    // Listen for events
    wsListen(this.socket, this.events);
  }

  listen() {
    // Single-page app fallback: non-API GET requests get the client index.html
    this.express.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/peerserver')) return next();
      return res.sendFile(path.join(clientDir, 'index.html'), (err) => err && next());
    });

    // JSON 404 for anything that is not handled
    this.express.use((req, res) => fail(res, 404, `Route not found: ${req.method} ${req.path}`));

    // Central error handler: JSON responses, never stack traces
    // eslint-disable-next-line no-unused-vars
    this.express.use((err, req, res, next) => sendFailure(res, err));

    // Boot the server
    this.server.on('error', (err) => {
      console.error(err.code === 'EADDRINUSE' ? `Port ${this.config.port} is already in use.` : err);
      process.exit(1);
    });
    this.server.listen(this.config.port, () => {
      console.log(`=> Listening on ${this.config.port}`);
    });
  }

  // Register Hooks
  hook(callback) {
    callback.call({ ...this });
  }

  // configure service with api
  configure(callback) {
    callback.call({
      ...this.express,
      route: this.router,
      ws: this.socket,
      imageUp: this.imageUp,
      lyra: this.search,
      db: this.db,
      mail: this.mail,
      webpush: this.webpush,
    });
  }

  // register events for ws with service
  register(event, callback) {
    this.events[event] = {
      method: callback,
      props: { ws: this.socket, lyra: this.search, db: this.db, mail: this.mail, webpush: this.webpush },
    };
  }
}

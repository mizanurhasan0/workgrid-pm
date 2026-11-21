import './controllers/envController';

const toBool = (value, fallback) => {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const toList = (value, fallback) => {
  if (!value) return fallback;
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

/**
 * Runtime settings. Everything here comes from environment variables (see .env.example).
 * No secrets are stored in the source tree.
 */
const settings = {
  port: Number(process.env.PORT) || 9998,
  origin: toList(process.env.CORS_ORIGINS, ['http://localhost:3000']),
  // HTTPS when true, plain HTTP when false. USE_HTTP2 is accepted as a legacy alias.
  useHTTPS: toBool(process.env.USE_HTTPS ?? process.env.USE_HTTP2, true),
  sslKeyPath: process.env.SSL_KEY_PATH || 'ssl/privatekey.pem',
  sslCertPath: process.env.SSL_CERT_PATH || 'ssl/certificate.pem',
  vapidSubject: process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
  },
  emailName: process.env.EMAIL_NAME || 'Workgrid',
  emailFrom: process.env.EMAIL_FROM,
};

export default settings;

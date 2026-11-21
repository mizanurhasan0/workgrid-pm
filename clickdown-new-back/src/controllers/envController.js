import path from 'path';
import dotenv from 'dotenv';

// Load the env file (default ".env" in the project root, override with ENV_FILE=config/dev.env).
// Real environment variables always win over values in the file.
dotenv.config({ path: path.resolve(process.env.ENV_FILE || '.env'), quiet: true });

const required = ['SECRET', 'COOKIE_KEY', 'MONGODB_URL', 'DEFAULT_ROLE'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill them in.`);
  process.exit(1);
}

// Sensible defaults for optional values
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || '9998';
process.env.SERVER_URL = process.env.SERVER_URL || `http://localhost:${process.env.PORT}`;
process.env.SERVER_API = process.env.SERVER_API || `${process.env.SERVER_URL}/api`;
process.env.DEFAULT_IMAGE = process.env.DEFAULT_IMAGE || 'images/avatar.svg';

console.log('=> Environment variables loaded!');

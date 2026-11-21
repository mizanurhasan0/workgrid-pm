// Copies the production build into the backend's static client folder.
// The backend serves ../clickdown-new-back/client, so this replaces the old `cp -r build/* ...` step.
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'build');
const target = resolve(root, '..', 'clickdown-new-back', 'client');

if (!existsSync(source)) {
  console.error('build/ does not exist. Run `npm run build` first.');
  process.exit(1);
}

mkdirSync(target, { recursive: true });
rmSync(resolve(target, 'assets'), { recursive: true, force: true });
cpSync(source, target, { recursive: true });
console.log(`Copied ${source} -> ${target}`);

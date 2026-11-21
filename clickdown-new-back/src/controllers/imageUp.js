import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import Project from '../services/project/project.schema';
import User from '../services/user/user.schema';

const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg', 'gif', 'avif', 'webp', 'pdf'];
const imagesDir = path.resolve('images');
// Shared default assets must never be deleted
const DEFAULT_ASSETS = ['images/avatar.svg', 'images/project.svg', 'images/project.png', process.env.DEFAULT_IMAGE].filter(Boolean);

/**
 * Copies an uploaded file (from the form-data temp dir) into the images folder under a random name.
 * @param {string} link Path of the uploaded temp file.
 * @returns {Promise<string|null>} The stored path relative to the project, e.g. "images/<name>.png".
 */
export const imageUp = async (link) => {
  try {
    if (!link) return null;
    const extIndex = link.lastIndexOf('.');
    if (extIndex === -1) throw new Error('Link does not contain a file extension.');
    const ext = link.substring(extIndex + 1).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) throw new Error('Invalid file extension.');
    const fileName = `${randomBytes(16).toString('hex')}.${ext}`;
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
    const buffer = await fs.promises.readFile(link);
    await fs.promises.writeFile(path.join(imagesDir, fileName), buffer);
    return `images/${fileName}`;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to save image.', { cause: e });
  }
};

/**
 * Deletes a previously stored upload, but only when it is inside images/, is not a shared
 * default asset, and is not used as a project icon or user avatar. Never throws.
 * @param {string} relPath Stored path such as "images/<name>.png".
 */
export const removeUpload = async (relPath) => {
  try {
    if (!relPath || !relPath.startsWith('images/')) return false;
    const target = path.resolve(relPath);
    if (path.dirname(target) !== imagesDir) return false;
    if (DEFAULT_ASSETS.includes(relPath)) return false;
    if (await Project.exists({ icon: relPath }) || await User.exists({ avatar: relPath })) return false;
    await fs.promises.unlink(target);
    return true;
  } catch (e) {
    return false;
  }
};

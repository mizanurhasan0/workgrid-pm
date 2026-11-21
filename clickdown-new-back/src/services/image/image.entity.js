import path from 'node:path';
import { fail } from '../../utils/httpError';

const imagesDir = path.resolve('images');

/**
 * Serves a stored upload from the images/ folder only.
 * The file name is resolved inside images/ and anything outside it (or dotfiles) is refused.
 */
export const getImage = () => (req, res) => {
  const fileName = req.params.path;
  if (!fileName) return fail(res, 400, 'Please provide the path');
  return res.sendFile(fileName, { root: imagesDir, dotfiles: 'deny' }, (err) => {
    if (err) fail(res, err.status === 404 || err.status === 403 ? 404 : 500, 'Image not found');
  });
};

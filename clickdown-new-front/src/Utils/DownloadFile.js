import { toast } from 'react-toastify';

const fileNameFrom = (link) => {
  try {
    const { pathname } = new URL(link, window.location.href);
    const name = pathname.split('/').pop();
    return name || 'download';
  } catch {
    return 'download';
  }
};

/**
 * Downloads a remote file through a temporary object URL. The object URL is always
 * revoked, and a failure shows an error toast.
 * @param {string} link Absolute URL of the file.
 * @returns {Promise<boolean>} true when the download was started.
 */
export default async function downloadFile(link) {
  if (!link) {return false;}
  let objectUrl = null;
  try {
    const response = await fetch(link, { credentials: 'include' });
    if (!response.ok) {throw new Error(`Download failed with status ${response.status}`);}
    const blob = await response.blob();
    objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileNameFrom(link);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return true;
  } catch {
    toast.error('Could not download this file.');
    return false;
  } finally {
    if (objectUrl) {setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);}
  }
}

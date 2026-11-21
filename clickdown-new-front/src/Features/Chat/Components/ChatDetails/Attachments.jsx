import React from 'react';
import { useDispatch } from 'react-redux';
import { Download } from '../../../../assets';
import Icons from '../Icons';
import CustomTruncate from '../../../../Utils/CustomTruncate';
import DateFormate from '../../../../Utils/DateFormat';
import downloadFile from '../../../../Utils/DownloadFile';
import { setPreviewData } from '../../ChatReducer';

const fileUrl = (location) => `${import.meta.env.VITE_SERVER_URL}/${location}`;

export default function Attachments({ files = [], id, hidden = false }) {
  const dispatch = useDispatch();
  return (
    <ul id={id} hidden={hidden} className="max-h-72 min-h-0 overflow-y-auto">
      {files.length === 0 && <li className="py-2 text-center text-sm text-text-muted">No attachments.</li>}
      {files.map((att) => {
        const location = att.location || '';
        const name = location.substring(location.lastIndexOf('/') + 1);
        return (
          <li key={att.id} className="flex items-center justify-between gap-2 rounded-lg hover:bg-text/10">
            <button
              type="button"
              aria-label={`Preview ${name}`}
              title="Preview"
              onClick={() => dispatch(setPreviewData(att))}
              className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-lg px-2 text-left focus-visible:outline-2 focus-visible:outline-focus-ring"
            >
              <Icons location={location} className="h-6 w-6 shrink-0 text-text-muted" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-text">{CustomTruncate(name)}</span>
                <span className="block text-xs tabular-nums text-text-muted">{att.createdAt && DateFormate(att.createdAt)}</span>
              </span>
            </button>
            <button
              type="button"
              aria-label={`Download ${name}`}
              title="Download"
              onClick={() => downloadFile(fileUrl(location))}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-text-muted focus-visible:outline-2 focus-visible:outline-focus-ring"
            >
              <Download className="h-5 w-5" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

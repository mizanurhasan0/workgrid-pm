import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Download } from '../../../../assets';
import Image from '../../../../Components/Image';
import downloadFile from '../../../../Utils/DownloadFile';
import { setPreviewData } from '../../ChatReducer';

export default function Preview() {
  const { previewData } = useSelector((state) => state.chatsStore);
  const dispatch = useDispatch();
  const closeRef = useRef(null);
  const isImage = previewData?.type === 'image';
  const fileName = (previewData?.location || '').split('/').pop();
  const url = `${import.meta.env.VITE_SERVER_URL}/${previewData?.location}`;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {dispatch(setPreviewData({}));}
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [dispatch]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${fileName}`}
      className="fixed inset-0 z-modal flex h-dvh flex-col bg-black/80"
    >
      <div className="flex min-h-14 shrink-0 items-center justify-between gap-2 px-4 text-white">
        <h2 className="min-w-0 truncate text-base font-semibold">{fileName}</h2>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={`Download ${fileName}`}
            onClick={() => downloadFile(url)}
            className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            type="button"
            ref={closeRef}
            onClick={() => dispatch(setPreviewData({}))}
            className="h-11 rounded-lg border border-white/60 px-4 text-sm font-semibold hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
          >
            Close
          </button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center p-4 pt-0">
        {isImage
          ? <Image src={previewData.location} alt={fileName} className="max-h-full max-w-full rounded-lg bg-white object-contain" />
          : <iframe src={url} title={fileName} className="h-full w-full rounded-lg bg-white" />}
      </div>
    </div>
  );
}

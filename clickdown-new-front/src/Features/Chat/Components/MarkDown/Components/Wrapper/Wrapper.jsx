import React from 'react';
import Preview from '../Preview/Preview';
import Write from '../Write';
import { useChatCtx } from '../../../../Context/ChatProvider';

const tabClass = (active) => `h-9 rounded-md px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-focus-ring ${active
  ? 'bg-brand-solid/10 text-brand'
  : 'text-text-muted'}`;

export default function Wrapper({ placeholder }) {
  const { editorType, setEditorType, sizeWrite } = useChatCtx();
  // The compact composer has no tabs, so the preview is only shown when the tabs are.
  const showPreview = !sizeWrite && editorType === 'preview';
  return (
    <>
      <div className={`${sizeWrite ? 'hidden' : 'flex'} gap-1 pb-1`}>
        <button type="button" aria-pressed={!showPreview} className={tabClass(!showPreview)} onClick={() => setEditorType('write')}>
          Write
        </button>
        <button type="button" aria-pressed={showPreview} className={tabClass(showPreview)} onClick={() => setEditorType('preview')}>
          Preview
        </button>
      </div>
      {/* The preview stays mounted: sending reads its rendered HTML. */}
      <div hidden={showPreview}>
        <Write placeholder={placeholder} />
      </div>
      <div hidden={!showPreview}>
        <Preview />
      </div>
    </>
  );
}

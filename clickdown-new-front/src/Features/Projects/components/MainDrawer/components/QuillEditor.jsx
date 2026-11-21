import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import { Edit, ReturnHisto, Selected } from '../../../../../assets';
import Loading3 from '../../../../../Components/Loading3';
import { buildStorePayload } from '../Handler';
import './quillEditor.css';

const EMPTY_HTML = ['', '<p><br></p>', '<br>', null, undefined];
const MODULES = {
  toolbar: {
    container: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  },
};

const normalize = (html) => (EMPTY_HTML.includes(html) ? '' : html || '');

// Descriptions are authored by other members and rendered as HTML, so strip active content.
const BLOCKED_TAGS = 'script, style, iframe, object, embed, link, meta, form, input, button';
function sanitizeHtml(html) {
  if (!html || typeof DOMParser === 'undefined') {return '';}
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll(BLOCKED_TAGS).forEach((el) => el.remove());
  doc.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith('on')) {el.removeAttribute(attr.name);}
      else if (['href', 'src', 'xlink:href', 'formaction'].includes(name) && value.startsWith('javascript:')) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return doc.body.innerHTML;
}

export default function QuillEditor({
  description = '', desc = '', setDesc,
  bundleInfo, updateTask, taskId, viewId, tree, onDirtyChange,
}) {
  const [load, setLoad] = useState(false);
  // Holds the task id being edited, so switching tasks leaves edit mode without an effect.
  const [editingFor, setEditingFor] = useState(null);
  const editing = editingFor !== null && editingFor === taskId;

  const saved = normalize(description);
  const isDirty = normalize(desc) !== saved;

  // Tell the drawer while there are unsaved changes so it can warn before closing
  useEffect(() => {
    onDirtyChange?.(editing && isDirty);
    return () => onDirtyChange?.(false);
  }, [editing, isDirty, onDirtyChange]);

  const startEdit = () => setEditingFor(taskId);

  const discard = () => {
    setDesc(description || '');
    setEditingFor(null);
  };

  const save = () => {
    if (isDirty) {
      updateTask({
        load: setLoad,
        taskId,
        storePayload: buildStorePayload({ bundleInfo, viewId, tree }),
        payload: { description: normalize(desc) },
      });
    }
    setEditingFor(null);
  };

  if (load) {return <div className="flex justify-center py-8"><Loading3 /></div>;}

  const isEmpty = EMPTY_HTML.includes(description);

  return (
    <section aria-labelledby="task-description-heading" className="py-6 h-auto">
      <div className="font-semibold flex justify-between items-center pb-2">
        <h3 id="task-description-heading" className="text-sm text-text-muted">Description</h3>
        <div className="flex items-center space-x-2">
          {editing ? (
            <>
              <button type="button" aria-label="Discard changes" onClick={discard} className="flex h-11 w-11 cursor-pointer items-center justify-center">
                <ReturnHisto className="dark:stroke-text" />
              </button>
              <button type="button" aria-label="Save description" onClick={save} className="flex h-11 w-11 cursor-pointer items-center justify-center">
                <Selected />
              </button>
            </>
          ) : (
            <button type="button" aria-label="Edit description" onClick={startEdit} className="flex h-11 w-11 cursor-pointer items-center justify-center">
              <Edit className="dark:stroke-text w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      {editing ? (
        <div className="quill">
          <ReactQuill
            theme="snow"
            value={desc}
            modules={MODULES}
            placeholder="Type description...."
            onChange={setDesc}
          />
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={startEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              startEdit();
            }
          }}
          className="desc min-h-48 cursor-text text-text"
        >
          <div
            dangerouslySetInnerHTML={{
              __html: isEmpty ? 'Type description...' : sanitizeHtml(description),
            }}
            className="text-sm leading-6 break-words"
          />
        </div>
      )}
    </section>
  );
}

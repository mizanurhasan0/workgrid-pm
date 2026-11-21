import { useParams } from 'react-router-dom';
import { useRef, useState } from 'react';
import req from '../../../Utils/req';
import AlertToster from '../../../Components/AlertToster';

// The server does not answer a message POST it rejects, so sending gives up after this long.
const SEND_TIMEOUT_MS = 60000;

const withTimeout = (promise, ms) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('timeout')), ms);
  promise.then(
    (value) => { clearTimeout(timer); resolve(value); },
    (err) => { clearTimeout(timer); reject(err); },
  );
});

const heading = (level) => (d) => `${'#'.repeat(level)} ${d.length > 0 ? d : 'your_text'}`;

// Markdown snippets for the formatting toolbar. Each receives the selected text.
const parser = {
  bold: (d) => (d.length > 0 ? `**${d}**` : '**your_text**'),
  italic: (d) => (d.length > 0 ? `_${d}_` : '_your text_'),
  strike: (d) => (d.length > 0 ? `~~${d}~~` : '~~your_text~~'),
  quote: (d) => (d.length > 0 ? `> ${d}` : '> your_text'),
  url: (d) => (d.length > 0 ? `[${d}](${d})` : '[Display Text](url)'),
  code: (d) => `\`\`\`\n${d.length > 0 ? d : 'your_code'}\n\`\`\``,
  ullist: (d) => (d.length > 0 ? d.split('\n').map((l) => `* ${l}`).join('\n') : '* your_text'),
  ollist: (d) => (d.length > 0 ? d.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n') : '1. your_text'),
  h1: heading(1),
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  h5: heading(5),
  h6: heading(6),
};

/**
 * Editor state for the chat composer: the textarea, the live text used by the preview,
 * formatting helpers and sending.
 * @returns {object} editor state and methods
 */
export default function useEditor() {
  const [editorType, setEditorType] = useState('write');
  const [sizeWrite, setSizeWrite] = useState(true);
  const [textValue, setTextValue] = useState('');
  const [sending, setSending] = useState(false);
  const markInputRef = useRef(null);
  const previewRef = useRef(null);
  const { id } = useParams();

  const onWriteFileSize = () => setSizeWrite((s) => !s);

  // Writes the textarea and the live text together, then places the caret.
  function commit(next, caret) {
    const ta = markInputRef.current;
    if (!ta) {return;}
    ta.value = next;
    setTextValue(next);
    ta.focus();
    ta.setSelectionRange(caret, caret);
  }

  /**
   * Wraps the selected text with the Markdown for `style`.
   * @param {string} style key of `parser`
   * @param {Event} e click event, its default is prevented
   */
  function applyStyle(style, e) {
    e?.preventDefault?.();
    const ta = markInputRef.current;
    const build = parser[style];
    if (!ta || !build) {return;}
    const { value, selectionStart, selectionEnd } = ta;
    const marked = build(value.slice(selectionStart, selectionEnd));
    commit(
      value.slice(0, selectionStart) + marked + value.slice(selectionEnd),
      selectionStart + marked.length,
    );
  }

  // Inserts text at the caret (used by the emoji picker).
  function appendText(str) {
    const ta = markInputRef.current;
    if (!ta) {return;}
    const { value, selectionStart, selectionEnd } = ta;
    commit(value.slice(0, selectionStart) + str + value.slice(selectionEnd), selectionStart + str.length);
  }

  // Indents the selected lines by one tab.
  function insertTabSpace(e) {
    e?.preventDefault?.();
    const ta = markInputRef.current;
    if (!ta) {return;}
    const { value, selectionStart, selectionEnd } = ta;
    const lineStart = value.slice(0, selectionStart).lastIndexOf('\n') + 1;
    const indented = value.slice(lineStart, selectionEnd)
      .split('\n')
      .map((line) => `\t${line}`)
      .join('\n');
    commit(value.slice(0, lineStart) + indented + value.slice(selectionEnd), selectionStart + 1);
  }

  // Removes one leading tab from the selected lines.
  function removeTabSpace(e) {
    e?.preventDefault?.();
    const ta = markInputRef.current;
    if (!ta) {return;}
    const { value, selectionStart, selectionEnd } = ta;
    const lineStart = value.slice(0, selectionStart).lastIndexOf('\n') + 1;
    const outdented = value.slice(lineStart, selectionEnd)
      .split('\n')
      .map((line) => (line.startsWith('\t') ? line.slice(1) : line))
      .join('\n');
    const firstLineHadTab = value[lineStart] === '\t';
    const caret = firstLineHadTab && selectionStart > lineStart ? selectionStart - 1 : selectionStart;
    commit(value.slice(0, lineStart) + outdented + value.slice(selectionEnd), caret);
  }

  /**
   * Sends the composed message. The stored body is the rendered preview HTML, which is
   * what the chat view and the link list expect. Resolves true when sent.
   * @param {{ files: File[] }} data attached files
   * @returns {Promise<boolean>}
   */
  const submitMessage = async ({ files = [] }) => {
    const text = textValue.trim();
    if (files.length === 0 && text === '') {
      AlertToster('Write a message or attach a file first.', 'warning');
      return false;
    }
    const fd = new FormData();
    files.forEach((file) => fd.append('icon[]', file));
    fd.append('message', previewRef.current?.innerHTML?.trim() || text);
    fd.append('chat', id);
    setSending(true);
    try {
      await withTimeout(req({ method: 'POST', uri: 'message', data: fd }), SEND_TIMEOUT_MS);
      commit('', 0);
      return true;
    } catch {
      AlertToster('Message could not be sent. Check your connection and try again.', 'error');
      return false;
    } finally {
      setSending(false);
    }
  };

  return {
    sizeWrite,
    onWriteFileSize,
    markInputRef,
    previewRef,
    textValue,
    setTextValue,
    sending,
    editorType,
    setEditorType,
    applyStyle,
    appendText,
    insertTabSpace,
    removeTabSpace,
    submitMessage,
  };
}

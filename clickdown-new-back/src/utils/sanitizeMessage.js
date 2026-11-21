import sanitizeHtml from 'sanitize-html';

/**
 * Server-side allow-list for chat messages. Mirrors the client rules in
 * src/Features/Chat/Components/MarkDown/sanitize.js: unknown elements are unwrapped (their text is
 * kept), scripts/frames/form controls are removed with their content, only href/title/class/align
 * attributes survive and links are limited to http, https, mailto and in-app paths.
 */
const ALLOWED_TAGS = [
  'a', 'abbr', 'b', 'blockquote', 'br', 'code', 'dd', 'del', 'div', 'dl', 'dt', 'em',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'kbd', 'li', 'mark', 'ol', 'p', 'pre',
  's', 'small', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'th', 'thead',
  'tr', 'u', 'ul',
];

const DROP_WITH_CONTENT = [
  'script', 'style', 'iframe', 'object', 'embed', 'template', 'noscript', 'textarea',
  'select', 'option', 'button', 'form', 'input', 'svg', 'math', 'head', 'title', 'meta', 'link',
  'base', 'frame', 'frameset',
];

const SAFE_HREF = /^(https?:|mailto:)/i;

const options = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    '*': ['title', 'class', 'align'],
    a: ['href', 'title', 'class', 'align', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  nonTextTags: DROP_WITH_CONTENT,
  transformTags: {
    a: (tagName, attribs) => {
      const attributes = { ...attribs };
      const href = String(attributes.href ?? '').trim();
      if (href && !(SAFE_HREF.test(href) || (href.startsWith('/') && !href.startsWith('//')))) delete attributes.href;
      attributes.target = '_blank';
      attributes.rel = 'noopener noreferrer';
      return { tagName, attribs: attributes };
    },
  },
};

/**
 * Sanitises the HTML/markdown of a chat message before it is stored.
 * Non-string values become an empty string.
 * @param {string} value Raw message text.
 * @returns {string} The sanitised text.
 */
export default function sanitizeMessage(value) {
  if (typeof value !== 'string' || value === '') return '';
  // sanitize-html escapes ">" as "&gt;"; restore it at the start of a line so markdown quotes still work.
  return sanitizeHtml(value, options).replace(/^( {0,3})((?:&gt; ?)+)/gm, (_, indent, quotes) => indent + quotes.replace(/&gt;/g, '>'));
}

// Allow-list sanitiser for hast trees produced from raw HTML (rehype-raw).
// Elements outside the list are unwrapped, so their text is kept. Scripts, frames and
// form controls are removed with their content. Attributes outside the list (style,
// id, on* handlers) are dropped, and links only keep http, https, mailto or in-app paths.

const DROP_WITH_CONTENT = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'template', 'noscript', 'textarea',
  'select', 'button', 'form', 'input', 'svg', 'math', 'head', 'title', 'meta', 'link',
  'base', 'frame', 'frameset',
]);

const ALLOWED_TAGS = new Set([
  'a', 'abbr', 'b', 'blockquote', 'br', 'code', 'dd', 'del', 'div', 'dl', 'dt', 'em',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'kbd', 'li', 'mark', 'ol', 'p', 'pre',
  's', 'small', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'th', 'thead',
  'tr', 'u', 'ul',
]);

const ALLOWED_PROPS = new Set(['href', 'title', 'className', 'target', 'rel', 'align']);

const SAFE_HREF = /^(https?:|mailto:)/i;

const isSafeHref = (href) => {
  const value = String(href).trim();
  return SAFE_HREF.test(value) || (value.startsWith('/') && !value.startsWith('//'));
};

const cleanElement = (node) => {
  const props = node.properties ?? {};
  Object.keys(props).forEach((key) => {
    if (!ALLOWED_PROPS.has(key)) {delete props[key];}
  });
  if (node.tagName === 'a') {
    if (props.href && !isSafeHref(props.href)) {delete props.href;}
    props.target = '_blank';
    props.rel = ['noopener', 'noreferrer'];
  } else {
    delete props.rel;
    delete props.target;
  }
};

const sanitizeChildren = (parent) => {
  if (!parent.children) {return;}
  const next = [];
  parent.children.forEach((child) => {
    if (child.type === 'text') {
      next.push(child);
      return;
    }
    // Comments, doctypes and anything else that is not an element is dropped.
    if (child.type !== 'element') {return;}
    if (DROP_WITH_CONTENT.has(child.tagName)) {return;}
    sanitizeChildren(child);
    if (!ALLOWED_TAGS.has(child.tagName)) {
      next.push(...child.children);
      return;
    }
    cleanElement(child);
    next.push(child);
  });
  parent.children = next;
};

export default function sanitizeHtml() {
  return (tree) => {
    sanitizeChildren(tree);
  };
}

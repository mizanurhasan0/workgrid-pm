import { describe, it, expect } from 'vitest';
import sanitizeHtml from '../Features/Chat/Components/MarkDown/sanitize';

// Runs the sanitiser on a minimal hast tree and returns the resulting children.
const run = (children) => {
  const tree = { type: 'root', children };
  sanitizeHtml()(tree);
  return tree.children;
};
const el = (tagName, properties = {}, children = []) => ({
  type: 'element', tagName, properties, children,
});
const text = (value) => ({ type: 'text', value });

describe('sanitizeHtml', () => {
  it('drops script elements together with their content', () => {
    const out = run([el('script', {}, [text('alert(1)')]), el('p', {}, [text('hi')])]);
    expect(out).toHaveLength(1);
    expect(out[0].tagName).toBe('p');
  });

  it('unwraps unknown elements but keeps their text', () => {
    const out = run([el('blink', {}, [text('kept')])]);
    expect(out).toEqual([text('kept')]);
  });

  it('removes event handlers and inline styles from allowed elements', () => {
    const out = run([el('span', { onClick: 'x()', style: 'color:red', className: 'ok' })]);
    expect(out[0].properties).toEqual({ className: 'ok' });
  });

  it('drops javascript: links but keeps https links', () => {
    const out = run([
      el('a', { href: 'javascript:alert(1)' }),
      el('a', { href: 'https://example.com' }),
    ]);
    expect(out[0].properties.href).toBeUndefined();
    expect(out[0].properties.rel).toEqual(['noopener', 'noreferrer']);
    expect(out[1].properties.href).toBe('https://example.com');
  });
});

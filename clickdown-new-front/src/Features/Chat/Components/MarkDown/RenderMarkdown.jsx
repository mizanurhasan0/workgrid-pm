import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useCodeTheme } from '../../../../Components/Theme/codeTheme';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import solidity from 'react-syntax-highlighter/dist/esm/languages/prism/solidity';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import django from 'react-syntax-highlighter/dist/esm/languages/prism/django';
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import sanitizeHtml from './sanitize';
import './markdown.css';

const LANGUAGES = {
  javascript, jsx, tsx, python, go, typescript, css, bash, solidity, json, ruby, rust, django, c, cpp,
};
Object.entries(LANGUAGES).forEach(([name, grammar]) => SyntaxHighlighter.registerLanguage(name, grammar));

// Text of React children. A stored message holds already-highlighted markup, so the
// code arrives as nested elements and is flattened back to the source text.
const textOf = (node) => {
  if (node === null || node === undefined || typeof node === 'boolean') {return '';}
  if (typeof node === 'string' || typeof node === 'number') {return String(node);}
  if (Array.isArray(node)) {return node.map(textOf).join('');}
  return textOf(node.props?.children);
};

// Fenced blocks with a language get highlighted; everything else is plain code.
function CodeBlock({ node: _node, className, children, ...props }) {
  const codeTheme = useCodeTheme();
  const match = /language-(\w+)/.exec(className || '');
  if (!match) {
    return <code className={className} {...props}>{children}</code>;
  }
  return (
    <div className="md-code">
      <SyntaxHighlighter
        style={codeTheme}
        language={match[1]}
        PreTag="div"
        customStyle={{ margin: 0, fontSize: '0.8125rem' }}
      >
        {textOf(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
}

/**
 * Renders Markdown without a wrapper element (the composer reads the rendered HTML of its
 * preview when sending). Raw HTML is parsed and then sanitised, so messages from other
 * people cannot run scripts or load frames.
 */
export function MarkdownBody({ children }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, sanitizeHtml]}
      components={{ code: CodeBlock }}
    >
      {String(children ?? '')}
    </ReactMarkdown>
  );
}

/** Renders a stored message with the shared message typography. */
export default function RenderMarkdown({ children }) {
  return (
    <div className="md-content">
      <MarkdownBody>{children}</MarkdownBody>
    </div>
  );
}

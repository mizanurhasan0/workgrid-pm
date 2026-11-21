/* eslint-disable react/no-children-prop */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useCodeTheme } from './Theme/codeTheme';
import sanitizeHtml from '../Features/Chat/Components/MarkDown/sanitize';

function CodeBlock({
  node: _node,
  inline,
  className,
  children, ...props
}) {
  const codeStyle = useCodeTheme();
  const match = /language-(\w+)/.exec(className || '');
  return !inline && match ? (
    <SyntaxHighlighter
      showLineNumbers
      children={String(children).replace(/\n$/, '')}
      style={codeStyle}
      language={match[1]}
      PreTag="div"
      {...props}
    />
  ) : (
    <code className={className} {...props}>{children}</code>
  );
}

/**
 * Read-only markdown view. Raw HTML in the message is parsed and then sanitised.
 * @param {Object} props
 * @param {string} props.msg Markdown source.
 * @returns {JSX.Element}
 */
export default function ViewMarkText({ msg }) {
  return (
    <div className="break-words [&_a]:text-brand [&_a]:underline [&_img]:max-w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, sanitizeHtml]}
      components={{ code: CodeBlock }}
    >
      {String(msg ?? '')}
    </ReactMarkdown>
    </div>
  );
}

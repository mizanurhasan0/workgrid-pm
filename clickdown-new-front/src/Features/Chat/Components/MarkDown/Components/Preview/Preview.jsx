import React from 'react';
import { MarkdownBody } from '../../RenderMarkdown';
import { useChatCtx } from '../../../../Context/ChatProvider';
import '../../markdown.css';

// The rendered HTML of this preview is what gets sent as the message body.
export default function Preview() {
  const { textValue, previewRef } = useChatCtx();
  return (
    <section aria-label="Message preview">
      <div className="max-h-48 min-h-24 overflow-y-auto rounded-lg border border-border bg-card px-3 py-2 text-text">
        <div ref={previewRef} className="md-content">
          <MarkdownBody>{textValue}</MarkdownBody>
        </div>
      </div>
    </section>
  );
}

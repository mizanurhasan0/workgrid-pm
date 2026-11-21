import React from 'react';
import {
  Delete,
  Edit,
  Leave,
  Pin,
} from '../../../../assets';

const itemClass = 'flex min-h-11 w-full items-center gap-3 px-4 text-left text-sm text-text hover:bg-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring';
const iconClass = 'h-4 w-4 shrink-0';

export default function ChatMenu({ getAction, isPinned, isCreator }) {
  return (
    <ul role="menu" className="min-w-40 overflow-hidden rounded-lg border border-border bg-raised py-1 shadow-elevated">
      <li role="none">
        <button type="button" role="menuitem" className={itemClass} onClick={() => getAction(isPinned ? 'Unpin' : 'Pin')}>
          <Pin className={iconClass} />
          <span>{isPinned ? 'Unpin' : 'Pin'}</span>
        </button>
      </li>
      <li role="none">
        <button type="button" role="menuitem" className={itemClass} onClick={() => getAction('Update')}>
          <Edit className={iconClass} />
          <span>Update</span>
        </button>
      </li>
      <li role="none" className="border-t border-border">
        <button type="button" role="menuitem" className={itemClass} onClick={() => getAction(isCreator ? 'Delete' : 'Leave')}>
          {isCreator ? <Delete className={iconClass} /> : <Leave className={iconClass} />}
          <span>{isCreator ? 'Delete' : 'Leave'}</span>
        </button>
      </li>
    </ul>
  );
}

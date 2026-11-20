import type { ComponentPropsWithRef, ReactNode } from 'react';
import { ContextMenu, type ContextMenuProps } from '../../menu/ContextMenu/ContextMenu.js';

export interface ConversationItemProps extends ComponentPropsWithRef<'button'> {
  children: string;
  current?: boolean;
  actions?: ReactNode;
  contextMenuContent?: ContextMenuProps['content'];
}

export function ConversationItem({ children, current, actions, contextMenuContent, ...props }: ConversationItemProps) {
  const button = (
    <button type="button" aria-current={current ? 'page' : undefined} title={children}
      {...props} data-nf-conversation-item="">
      <span>{children}</span>
    </button>
  );

  const row = actions ? (
    <div role="group" aria-label={children} hidden={props.hidden} data-nf-conversation-row="">
      {button}
      <div data-nf-conversation-actions="">{actions}</div>
    </div>
  ) : button;
  return contextMenuContent ? <ContextMenu content={contextMenuContent}>{row}</ContextMenu> : row;
}

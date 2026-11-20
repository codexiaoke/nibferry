import type { ComponentPropsWithRef } from 'react';

export interface ConversationListProps extends ComponentPropsWithRef<'nav'> {
  label: string;
}

export function ConversationList({ label, children, ...props }: ConversationListProps) {
  return (
    <nav aria-label={label} {...props} data-nf-conversation-list="">
      <div data-nf-conversation-heading="">{label}</div>
      {children}
    </nav>
  );
}

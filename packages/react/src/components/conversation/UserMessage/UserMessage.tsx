import { Children, type ComponentPropsWithRef, type ReactNode } from 'react';

export interface UserMessageProps extends ComponentPropsWithRef<'div'> {
  attachments?: ReactNode;
  actions?: ReactNode;
}

export function UserMessage({ attachments, actions, children, ...props }: UserMessageProps) {
  const hasBody = Children.toArray(children).some(node => typeof node !== 'string' || node.trim().length > 0);
  return <div data-nf-message-group="user" data-has-actions={actions ? '' : undefined} hidden={props.hidden}>
    <div {...props} data-nf-user-message="" data-with-attachments={attachments ? '' : undefined}>
      {attachments ? <>{attachments}{hasBody && <div data-nf-user-message-text="">{children}</div>}</> : children}
    </div>
    {actions}
  </div>;
}

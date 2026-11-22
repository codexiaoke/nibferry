import type { ComponentPropsWithRef, ReactNode } from 'react';

export interface AssistantMessageProps extends ComponentPropsWithRef<'div'> {
  actions?: ReactNode;
  streaming?: boolean;
}

export function AssistantMessage({ actions, streaming, ...props }: AssistantMessageProps) {
  return <div data-nf-message-group="assistant" data-has-actions={actions ? '' : undefined} hidden={props.hidden}>
    <div {...props} data-nf-assistant-message="" data-nf-streaming={streaming || undefined} />
    {actions}
  </div>;
}

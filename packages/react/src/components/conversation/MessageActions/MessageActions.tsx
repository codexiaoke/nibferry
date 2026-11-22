import type { ComponentPropsWithRef, ReactNode } from 'react';

export interface MessageActionsProps extends ComponentPropsWithRef<'div'> {
  timestamp?: ReactNode;
}

export function MessageActions({ timestamp, children, ...props }: MessageActionsProps) {
  return <div role="group" {...props} data-nf-message-actions="">
    {children}
    {timestamp != null && <span data-nf-message-time="">{timestamp}</span>}
  </div>;
}

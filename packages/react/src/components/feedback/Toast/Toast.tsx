'use client';

import { useEffect, useLayoutEffect, useRef, type ComponentPropsWithRef } from 'react';
import { Presence } from '@radix-ui/react-presence';

export interface ToastProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  message: string;
  notificationId?: string | number;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, notificationId, onDismiss, duration = 2600, ...props }: ToastProps) {
  const dismiss = useRef(onDismiss);
  const last = useRef({ message, notificationId });
  useLayoutEffect(() => { if (message) last.current = { message, notificationId }; }, [message, notificationId]);
  useEffect(() => { dismiss.current = onDismiss; }, [onDismiss]);
  useEffect(() => {
    if (!message || duration <= 0) return;
    const timeout = setTimeout(() => dismiss.current(), duration);
    return () => clearTimeout(timeout);
  }, [message, duration, notificationId]);
  return <div role="status" aria-atomic="true" data-nf-toast="" {...props}>
    <Presence present={Boolean(message)}>
      <span data-state={message ? 'open' : 'closed'} aria-hidden={message ? undefined : true}>
        <span key={message ? notificationId : last.current.notificationId}>{message || last.current.message}</span>
      </span>
    </Presence>
  </div>;
}

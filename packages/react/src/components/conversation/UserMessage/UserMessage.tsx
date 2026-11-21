import type { ComponentPropsWithRef } from 'react';

export type UserMessageProps = ComponentPropsWithRef<'div'>;

export function UserMessage(props: UserMessageProps) {
  return <div {...props} data-nf-user-message="" />;
}

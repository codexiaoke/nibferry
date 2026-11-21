import type { ComponentPropsWithRef } from 'react';

export type AssistantMessageProps = ComponentPropsWithRef<'div'>;

export function AssistantMessage(props: AssistantMessageProps) {
  return <div {...props} data-nf-assistant-message="" />;
}

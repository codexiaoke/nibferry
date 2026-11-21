import type { ComponentPropsWithRef } from 'react';

export type ConversationTurnProps = ComponentPropsWithRef<'article'>;

export function ConversationTurn(props: ConversationTurnProps) {
  return <article {...props} data-nf-turn="" />;
}

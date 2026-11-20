import type { ComponentPropsWithRef } from 'react';

export type SummaryCardProps = ComponentPropsWithRef<'aside'>;

export function SummaryCard(props: SummaryCardProps) {
  return <aside {...props} data-nf-summary-card="" />;
}

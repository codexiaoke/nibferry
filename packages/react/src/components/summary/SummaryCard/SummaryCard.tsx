import type { ComponentPropsWithRef } from 'react';
import { ScrollArea } from '../../layout/ScrollArea/ScrollArea.js';

export type SummaryCardProps = ComponentPropsWithRef<'aside'>;

export function SummaryCard({ children, ...props }: SummaryCardProps) {
  return <aside {...props} data-nf-summary-card="">
    <ScrollArea viewportProps={{ tabIndex: undefined }}>
      <div data-nf-summary-content="">{children}</div>
    </ScrollArea>
  </aside>;
}

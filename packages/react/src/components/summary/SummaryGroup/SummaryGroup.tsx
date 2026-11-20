import type { ComponentPropsWithRef } from 'react';

export interface SummaryGroupProps extends ComponentPropsWithRef<'div'> {
  label: string;
}

export function SummaryGroup({ label, children, ...props }: SummaryGroupProps) {
  return (
    <div role="group" aria-label={label} {...props} data-nf-summary-group="">
      <div data-nf-summary-heading="">{label}</div>
      {children}
    </div>
  );
}

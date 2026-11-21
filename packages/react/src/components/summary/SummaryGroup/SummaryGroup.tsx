import type { ComponentPropsWithRef, ReactNode } from 'react';

export interface SummaryGroupProps extends ComponentPropsWithRef<'div'> {
  label: string;
  actions?: ReactNode;
}

export function SummaryGroup({ label, actions, children, ...props }: SummaryGroupProps) {
  return (
    <div role="group" aria-label={label} {...props} data-nf-summary-group="">
      <div data-nf-summary-heading=""><span>{label}</span>{actions}</div>
      {children}
    </div>
  );
}

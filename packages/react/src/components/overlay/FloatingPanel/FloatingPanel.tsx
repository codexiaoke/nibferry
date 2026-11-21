import type { ComponentPropsWithRef, ReactNode } from 'react';

export interface FloatingPanelProps extends ComponentPropsWithRef<'section'> {
  open: boolean;
  header?: ReactNode;
}

export function FloatingPanel({ open, header, children, ...props }: FloatingPanelProps) {
  return <section role="region" tabIndex={-1} {...props} hidden={!open || props.hidden} data-nf-floating-panel="">
    {header}
    <div data-nf-floating-body="">{children}</div>
  </section>;
}

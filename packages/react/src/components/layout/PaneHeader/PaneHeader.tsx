import type { ComponentPropsWithRef, ReactNode } from 'react';

export interface PaneHeaderProps extends ComponentPropsWithRef<'header'> {
  actions?: ReactNode;
}

export function PaneHeader({ children, actions, ...props }: PaneHeaderProps) {
  return (
    <header {...props} data-nf-pane-header="">
      <div data-nf-pane-header-content="">{children}</div>
      {actions && <div data-nf-pane-header-actions="">{actions}</div>}
    </header>
  );
}

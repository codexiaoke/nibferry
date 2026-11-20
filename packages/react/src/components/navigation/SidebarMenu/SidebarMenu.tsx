import type { ComponentPropsWithRef, ReactNode } from 'react';
import { PaneHeader } from '../../layout/PaneHeader/PaneHeader.js';

export interface SidebarMenuProps extends ComponentPropsWithRef<'nav'> {
  label: string;
  heading?: ReactNode;
  actions?: ReactNode;
}

export function SidebarMenu({ label, heading = label, actions, children, ...props }: SidebarMenuProps) {
  return (
    <nav aria-label={label} {...props} data-nf-sidebar-menu="">
      <PaneHeader actions={actions}>{heading}</PaneHeader>
      {children}
    </nav>
  );
}

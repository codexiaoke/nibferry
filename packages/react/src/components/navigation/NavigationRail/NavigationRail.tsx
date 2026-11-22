import type { ComponentPropsWithRef, ReactNode } from 'react';

export interface NavigationRailProps extends ComponentPropsWithRef<'nav'> {
  label: string;
  footer?: ReactNode;
}

export function NavigationRail({ label, footer, children, ...props }: NavigationRailProps) {
  return (
    <nav aria-label={label} {...props} data-nf-navigation-rail="">
      {footer == null ? children : <>
        <div data-nf-rail-links="">{children}</div>
        <div data-nf-rail-footer="">{footer}</div>
      </>}
    </nav>
  );
}

import type { ComponentPropsWithRef } from 'react';

export interface NavigationRailProps extends ComponentPropsWithRef<'nav'> {
  label: string;
}

export function NavigationRail({ label, children, ...props }: NavigationRailProps) {
  return <nav aria-label={label} {...props} data-nf-navigation-rail="">{children}</nav>;
}

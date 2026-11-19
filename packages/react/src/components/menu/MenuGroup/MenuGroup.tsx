import { Group, Label } from '@radix-ui/react-dropdown-menu';
import type { ComponentPropsWithRef } from 'react';

export interface MenuGroupProps extends Omit<ComponentPropsWithRef<typeof Group>, 'asChild'> {
  label?: string;
}

export function MenuGroup({ label, children, ...props }: MenuGroupProps) {
  return (
    <Group aria-label={label} {...props}>
      {label && <Label data-nf-menu-label="">{label}</Label>}
      {children}
    </Group>
  );
}

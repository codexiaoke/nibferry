import { Item } from '@radix-ui/react-dropdown-menu';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import type { ComponentPropsWithRef } from 'react';

export interface MenuItemProps extends Omit<ComponentPropsWithRef<typeof Item>, 'asChild'> {
  icon?: IconSvgElement;
  shortcut?: string;
  danger?: boolean;
}

export function MenuItem({ icon, shortcut, danger, children, ...props }: MenuItemProps) {
  return (
    <Item {...props} data-nf-menu-item="" data-danger={danger || undefined}>
      {icon && <HugeiconsIcon icon={icon} size={16} aria-hidden="true" />}
      <span data-nf-menu-text="">{children}</span>
      {shortcut && <kbd aria-hidden="true">{shortcut}</kbd>}
    </Item>
  );
}

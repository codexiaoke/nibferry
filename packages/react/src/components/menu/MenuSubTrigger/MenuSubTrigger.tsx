import { SubTrigger } from '@radix-ui/react-dropdown-menu';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import Chevron from '@hugeicons/core-free-icons/ArrowRight01Icon';
import type { ComponentPropsWithRef } from 'react';

export interface MenuSubTriggerProps extends Omit<ComponentPropsWithRef<typeof SubTrigger>, 'asChild'> {
  icon?: IconSvgElement;
}

export function MenuSubTrigger({ icon, children, ...props }: MenuSubTriggerProps) {
  return (
    <SubTrigger {...props} data-nf-menu-item="">
      {icon && <HugeiconsIcon icon={icon} size={16} aria-hidden="true" />}
      <span data-nf-menu-text="">{children}</span>
      <HugeiconsIcon icon={Chevron} size={14} aria-hidden="true" data-nf-menu-chevron="" />
    </SubTrigger>
  );
}

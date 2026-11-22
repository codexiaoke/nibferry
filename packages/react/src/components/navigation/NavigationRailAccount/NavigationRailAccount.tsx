import { Avatar } from '../../display/Avatar/Avatar.js';
import type { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Sliders from '@hugeicons/core-free-icons/SlidersHorizontalIcon';
import { DropdownMenu, type DropdownMenuProps } from '../../menu/DropdownMenu/DropdownMenu.js';
import { MenuContent, type MenuContentProps } from '../../menu/MenuContent/MenuContent.js';
import { MenuSeparator } from '../../menu/MenuSeparator/MenuSeparator.js';
import { MenuTrigger } from '../../menu/MenuTrigger/MenuTrigger.js';

export interface NavigationRailAccountProps extends DropdownMenuProps {
  name: string;
  detail?: ReactNode;
  avatar?: ReactNode;
  label?: string;
  variant?: 'rail' | 'sidebar';
  menuProps?: Omit<MenuContentProps, 'children' | 'asChild'>;
}

export function NavigationRailAccount({ name, detail, avatar, label = name + ' 的账户菜单',
  variant = 'rail', menuProps, children, ...props }: NavigationRailAccountProps) {
  const sidebar = variant === 'sidebar';
  const portrait = (
    <Avatar data-nf-account-avatar="" aria-hidden="true" name={name}>{avatar}</Avatar>
  );
  return (
    <DropdownMenu modal={false} {...props}>
      <MenuTrigger data-nf-rail-item={sidebar ? undefined : ''} data-nf-account-trigger={variant} aria-label={label} title={label}>
        {portrait}
        {sidebar && <>
          <span data-nf-account-name="">{name}</span>
          <HugeiconsIcon icon={Sliders} size={16} aria-hidden="true" />
        </>}
      </MenuTrigger>
      <MenuContent side={sidebar ? 'top' : 'right'} align={sidebar ? 'start' : 'end'} sideOffset={5}
        {...menuProps} data-nf-account-menu={variant}>
        <div data-nf-account-identity="">
          {portrait}
          <div data-nf-account-info="">
            <div>{name}</div>
            {detail != null && <div data-nf-account-detail="">{detail}</div>}
          </div>
        </div>
        <MenuSeparator />
        {children}
      </MenuContent>
    </DropdownMenu>
  );
}

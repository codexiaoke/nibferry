import { SubContent, type DropdownMenuPortalProps } from '@radix-ui/react-dropdown-menu';
import { MenuPortal } from '../MenuContent/MenuContent.js';
import type { ComponentPropsWithRef } from 'react';

export interface MenuSubContentProps extends ComponentPropsWithRef<typeof SubContent> {
  container?: DropdownMenuPortalProps['container'];
}

export function MenuSubContent({ container, ...props }: MenuSubContentProps) {
  const panelInset = 5; // 1px border + 4px padding on each menu.
  return (
    <MenuPortal container={container} forceMount={props.forceMount}>
      <SubContent sideOffset={panelInset + 8} alignOffset={-panelInset} collisionPadding={8} loop {...props} data-nf-menu-content="" />
    </MenuPortal>
  );
}

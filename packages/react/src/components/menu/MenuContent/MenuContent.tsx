import { Content, Portal, type DropdownMenuPortalProps } from '@radix-ui/react-dropdown-menu';
import type { ComponentPropsWithRef } from 'react';

export interface MenuContentProps extends ComponentPropsWithRef<typeof Content> {
  container?: DropdownMenuPortalProps['container'];
}

export function MenuContent({ container, ...props }: MenuContentProps) {
  return (
    <Portal container={container} forceMount={props.forceMount}>
      <Content align="start" sideOffset={4} collisionPadding={8} loop {...props} data-nf-menu-content="" />
    </Portal>
  );
}

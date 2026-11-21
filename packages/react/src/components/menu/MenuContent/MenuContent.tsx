'use client';

import { Content, Portal, type DropdownMenuPortalProps } from '@radix-ui/react-dropdown-menu';
import { useContext, type ComponentPropsWithRef } from 'react';
import { KeyboardOpenContext } from '../DropdownMenu/DropdownMenu.js';
import { DialogContainer } from '../../overlay/Dialog/Dialog.js';

export interface MenuContentProps extends ComponentPropsWithRef<typeof Content> {
  container?: DropdownMenuPortalProps['container'];
}

export function MenuPortal({ container, ...props }: DropdownMenuPortalProps) {
  const dialog = useContext(DialogContainer);
  return <Portal {...props} container={container ?? dialog} />;
}

export function MenuContent({ container, onFocus, ...props }: MenuContentProps) {
  const keyboardOpen = useContext(KeyboardOpenContext);
  return (
    <MenuPortal container={container} forceMount={props.forceMount}>
      <Content align="start" sideOffset={4} collisionPadding={8} loop {...props} data-nf-menu-content=""
        onFocus={event => {
          onFocus?.(event);
          if (!keyboardOpen?.current) return;
          keyboardOpen.current = false;
          if (event.defaultPrevented || event.target !== event.currentTarget) return;
          // The opening key can arrive before Radix installs its document keyboard listener.
          const menu = event.currentTarget;
          queueMicrotask(() => {
            if (menu.ownerDocument.activeElement !== menu) return;
            const items = menu.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])');
            const first = Array.from(items).find(item =>
              item.closest('[role="menu"]') === menu && item.getClientRects().length > 0
            );
            first?.focus({ preventScroll: true });
          });
        }}
      />
    </MenuPortal>
  );
}

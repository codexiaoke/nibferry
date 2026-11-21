'use client';

import { Trigger } from '@radix-ui/react-dropdown-menu';
import { useContext, type ComponentPropsWithRef } from 'react';
import { KeyboardOpenContext } from '../DropdownMenu/DropdownMenu.js';

export type MenuTriggerProps = ComponentPropsWithRef<typeof Trigger>;

export function MenuTrigger({ onKeyDown, onPointerDown, ...props }: MenuTriggerProps) {
  const keyboardOpen = useContext(KeyboardOpenContext);
  return <Trigger {...props} data-nf-menu-trigger=""
    onKeyDown={event => {
      onKeyDown?.(event);
      if (keyboardOpen && !event.defaultPrevented && ['ArrowDown', 'Enter', ' '].includes(event.key)) {
        keyboardOpen.current = event.currentTarget.getAttribute('aria-expanded') !== 'true';
      }
    }}
    onPointerDown={event => {
      onPointerDown?.(event);
      if (keyboardOpen) keyboardOpen.current = false;
    }}
  />;
}

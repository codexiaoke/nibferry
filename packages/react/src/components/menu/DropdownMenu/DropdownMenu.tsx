'use client';

import { Root, type DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { createContext, useRef, type RefObject } from 'react';

export type { DropdownMenuProps };
export const KeyboardOpenContext = createContext<RefObject<boolean> | null>(null);

export function DropdownMenu(props: DropdownMenuProps) {
  const keyboardOpen = useRef(false);
  return <KeyboardOpenContext.Provider value={keyboardOpen}><Root {...props} /></KeyboardOpenContext.Provider>;
}

'use client';

import { useContext, type ComponentProps, type ReactElement } from 'react';
import * as Radix from '@radix-ui/react-popover';
import { DialogContainer } from '../Dialog/Dialog.js';

export interface PopoverProps extends ComponentProps<typeof Radix.Content> {
  trigger: ReactElement;
  label: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  container?: ComponentProps<typeof Radix.Portal>['container'];
}

export function Popover({ trigger, label, open, defaultOpen, onOpenChange, container, ...content }: PopoverProps) {
  const dialog = useContext(DialogContainer);
  return <Radix.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
    <Radix.Trigger asChild>{trigger}</Radix.Trigger>
    <Radix.Portal container={container ?? dialog} forceMount={content.forceMount}>
      <Radix.Content data-nf-popover="" aria-label={label} sideOffset={6} collisionPadding={8}
        align="start" {...content} />
    </Radix.Portal>
  </Radix.Root>;
}

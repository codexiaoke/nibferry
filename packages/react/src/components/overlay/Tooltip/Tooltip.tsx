'use client';

import { Content, Portal, Provider, Root, Trigger } from '@radix-ui/react-tooltip';
import { useContext, type ComponentProps, type ReactElement, type ReactNode } from 'react';
import { DialogContainer } from '../Dialog/Dialog.js';

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  side?: ComponentProps<typeof Content>['side'];
  delay?: number;
  container?: ComponentProps<typeof Portal>['container'];
  className?: string;
}

export function Tooltip({ children, content, side = 'top', delay = 350, container, className }: TooltipProps) {
  const dialog = useContext(DialogContainer);
  return <Provider delayDuration={delay}>
    <Root>
      <Trigger asChild>{children}</Trigger>
      <Portal container={container ?? dialog}>
        <Content side={side} sideOffset={6} collisionPadding={8} className={className} data-nf-tooltip="">
          {content}
        </Content>
      </Portal>
    </Root>
  </Provider>;
}

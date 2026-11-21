'use client';

import { useState, type ComponentPropsWithRef } from 'react';
import { Content, Root, Scrollbar, Thumb, Viewport } from '@radix-ui/react-scroll-area';

export interface ScrollAreaProps extends ComponentPropsWithRef<'div'> {
  dir?: 'ltr' | 'rtl';
  viewportProps?: ComponentPropsWithRef<'div'> & { [key: `data-${string}`]: string | boolean | undefined };
}

export function ScrollArea({ children, viewportProps, ...props }: ScrollAreaProps) {
  const [dragging, setDragging] = useState(false);
  return <Root {...props} type="scroll" scrollHideDelay={650} data-nf-scroll-area="">
    <Viewport tabIndex={0} {...viewportProps} data-nf-scroll-viewport="" disableImplicitContentElement>
      <Content style={{ display: 'block' }}>{children}</Content>
    </Viewport>
    <Scrollbar orientation="vertical" data-nf-scrollbar="" forceMount={dragging || undefined}
      data-dragging={dragging || undefined}
      // A stationary pointer should not keep the scrollbar open after scrolling stops.
      onPointerEnter={event => event.preventDefault()}
      onPointerDown={event => { if (event.button === 0) setDragging(true); }}
      onLostPointerCapture={() => setDragging(false)}>
      <Thumb data-nf-scroll-thumb="" />
    </Scrollbar>
  </Root>;
}

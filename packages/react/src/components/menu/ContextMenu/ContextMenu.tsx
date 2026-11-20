'use client';

import { cloneElement, useRef, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { Root, Trigger } from '@radix-ui/react-dropdown-menu';
import { Slot } from '@radix-ui/react-slot';
import type { MenuContentProps } from '../MenuContent/MenuContent.js';

export interface ContextMenuProps {
  children: ReactElement;
  content: ReactElement<MenuContentProps>;
  onOpen?: () => void;
}

export function ContextMenu({ children, content, onOpen }: ContextMenuProps) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const invoker = useRef<HTMLElement | null>(null);
  const clickedOutside = useRef(false);

  function open(source: HTMLElement, x: number, y: number) {
    invoker.current = source;
    clickedOutside.current = false;
    onOpen?.();
    setPoint({ x, y });
  }

  return (
    <Root modal={false} open={point !== null} onOpenChange={next => { if (!next) setPoint(null); }}>
      <Slot data-nf-context-open={point ? '' : undefined}
        onContextMenu={event => {
          const row = event.currentTarget;
          if (event.defaultPrevented || !row.contains(event.target as Node)) return;
          event.preventDefault();
          const button = (event.target as Element).closest<HTMLElement>('button, a[href], [tabindex]');
          const source = button && row.contains(button) ? button : row.querySelector<HTMLElement>('button') ?? row;
          open(source, event.clientX, event.clientY);
        }}
        onKeyDown={event => {
          if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) return;
          if (event.defaultPrevented || !event.currentTarget.contains(event.target as Node)) return;
          event.preventDefault();
          const source = event.target as HTMLElement;
          const bounds = source.getBoundingClientRect();
          open(source, bounds.left, bounds.bottom);
        }}>
        {children}
      </Slot>
      {point && createPortal(
        <Trigger asChild>
          <span aria-hidden="true" data-nf-context-anchor="" style={{ left: point.x, top: point.y }} />
        </Trigger>,
        invoker.current!.ownerDocument.body,
      )}
      {cloneElement(content, {
        // The cursor anchor has no text. Name the menu from the row or the supplied content.
        'aria-labelledby': content.props['aria-labelledby'],
        'aria-label': content.props['aria-label'] ?? (invoker.current?.getAttribute('aria-label') || invoker.current?.textContent || undefined),
        sideOffset: content.props.sideOffset ?? 2,
        onEscapeKeyDown: event => {
          content.props.onEscapeKeyDown?.(event);
          if (event.defaultPrevented) return;
          event.preventDefault();
          setPoint(null);
          invoker.current?.focus({ preventScroll: true });
        },
        onInteractOutside: event => {
          content.props.onInteractOutside?.(event);
          if (!event.defaultPrevented) clickedOutside.current = true;
        },
        onCloseAutoFocus: event => {
          content.props.onCloseAutoFocus?.(event);
          if (event.defaultPrevented) return;
          event.preventDefault();
          const source = invoker.current;
          if (!clickedOutside.current && source?.isConnected && source.ownerDocument.activeElement === source.ownerDocument.body) {
            source.focus({ preventScroll: true });
          }
        },
      })}
    </Root>
  );
}

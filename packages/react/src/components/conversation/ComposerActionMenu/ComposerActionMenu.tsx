'use client';

import { Children, useContext, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { autoUpdate } from '@floating-ui/dom';
import Add from '@hugeicons/core-free-icons/Add01Icon';
import { PaneButton } from '../../layout/PaneButton/PaneButton.js';
import { DropdownMenu } from '../../menu/DropdownMenu/DropdownMenu.js';
import { MenuContent, type MenuContentProps } from '../../menu/MenuContent/MenuContent.js';
import { MenuTrigger } from '../../menu/MenuTrigger/MenuTrigger.js';
import { ComposerMenuContext } from '../ConversationComposer/ConversationComposer.js';

const defaultTriggers = ['@', '/'];

export interface ComposerMenuMatch {
  symbol: string;
  query: string;
  start: number;
  end: number;
}

export interface ComposerActionMenuProps extends Omit<MenuContentProps, 'asChild' | 'children'> {
  label?: string;
  disabled?: boolean;
  triggers?: readonly string[];
  children?: ReactNode | ((match: ComposerMenuMatch | null) => ReactNode);
}

export function ComposerActionMenu({ label = '添加内容', disabled, children, triggers = defaultTriggers,
  sideOffset = 4, style, onFocus, onFocusOutside, onCloseAutoFocus, onEscapeKeyDown,
  ...props }: ComposerActionMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const composerMenu = useContext(ComposerMenuContext);
  const textOpener = useRef<HTMLTextAreaElement | null>(null);
  const [source, setSource] = useState<'button' | ComposerMenuMatch | null>(null);
  const match = typeof source === 'object' ? source : null;
  const buttonItems = typeof children === 'function' ? children(null) : children;
  const items = match && typeof children === 'function' ? children(match) : buttonItems;
  const hasItems = Children.toArray(buttonItems).length > 0;
  const textEnabled = Boolean(triggers.length && (hasItems || typeof children === 'function'));
  const sourceEnabled = source === 'button' || (match !== null && triggers.includes(match.symbol));
  const open = !disabled && sourceEnabled && Children.toArray(items).length > 0;
  const [anchor, setAnchor] = useState<{ width: number; left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const composer = trigger?.closest<HTMLElement>('[data-nf-composer]');
    if (!open || !trigger || !composer) {
      setAnchor(null);
      if (disabled || !sourceEnabled || (source === 'button' && !hasItems)) setSource(null);
      return;
    }
    // Radix anchors the popup to its trigger. Offset it to the composer's top edge.
    return autoUpdate(trigger, composer, () => {
      const box = composer.getBoundingClientRect();
      const button = trigger.getBoundingClientRect();
      setAnchor({ width: box.width, left: box.left - button.left, top: button.top - box.top });
    });
  }, [open, hasItems, disabled, source, sourceEnabled]);

  useLayoutEffect(() => {
    if (!composerMenu || disabled || !textEnabled) return;
    function readToken(field: HTMLTextAreaElement, token: ComposerMenuMatch | null, inserted: string | null) {
      if (token && (!token.query || inserted?.endsWith(token.symbol + token.query) ||
        (match?.symbol === token.symbol && match.start === token.start))) {
        textOpener.current = field;
        setSource(token);
      } else if (match) setSource(null);
    }

    function handleKey(event: KeyboardEvent<HTMLTextAreaElement>) {
      if (!match) return;
      if (['Escape', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        setSource(null);
        return;
      }
      if (event.altKey || event.metaKey || event.ctrlKey || event.shiftKey ||
        !['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;
      const menuId = triggerRef.current?.getAttribute('aria-controls');
      const menu = menuId && event.currentTarget.ownerDocument.getElementById(menuId);
      if (!menu) return;
      const choices = menu.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"], [hidden])');
      event.preventDefault();
      if (event.key === 'Enter') choices[0]?.click();
      else (event.key === 'ArrowUp' ? choices[choices.length - 1] : choices[0])?.focus();
    }

    const menu = { triggers, edit: readToken, keyDown: handleKey };
    composerMenu.add(menu);
    return () => { composerMenu.delete(menu); };
  }, [composerMenu, disabled, textEnabled, triggers, match]);

  if (!hasItems && !(textEnabled && composerMenu)) return null;
  return <DropdownMenu modal={false} open={open} onOpenChange={next => {
    if (next) textOpener.current = null;
    setSource(next ? 'button' : null);
  }}>
    <MenuTrigger asChild ref={triggerRef}>
      <PaneButton icon={Add} aria-label={label} title={label} disabled={disabled}
        hidden={!hasItems} />
    </MenuTrigger>
    <MenuContent side="top" aria-label={label} sideOffset={sideOffset} style={style} {...props}
      onFocus={event => {
        onFocus?.(event);
        if (event.defaultPrevented || !match || event.target !== event.currentTarget) return;
        event.preventDefault();
        const menu = event.currentTarget;
        queueMicrotask(() => {
          if (menu.ownerDocument.activeElement === menu) textOpener.current?.focus({ preventScroll: true });
        });
      }}
      onFocusOutside={event => {
        onFocusOutside?.(event);
        if (match && event.target === textOpener.current) event.preventDefault();
      }}
      onEscapeKeyDown={event => {
        onEscapeKeyDown?.(event);
        if (event.isComposing || event.keyCode === 229) event.preventDefault();
      }}
      onCloseAutoFocus={event => {
        onCloseAutoFocus?.(event);
        const field = textOpener.current;
        if (event.defaultPrevented || !field) return;
        event.preventDefault();
        if (field.ownerDocument.activeElement === field.ownerDocument.body) field.focus({ preventScroll: true });
      }}
      {...(anchor && {
        side: 'top', align: 'start', avoidCollisions: false,
        sideOffset: sideOffset + anchor.top, alignOffset: anchor.left,
        style: { ...style, width: anchor.width },
      })}>{items}</MenuContent>
  </DropdownMenu>;
}

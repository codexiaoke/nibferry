'use client';

import { useImperativeHandle, useLayoutEffect, useRef, type ComponentPropsWithRef } from 'react';

export interface DialogProps extends Omit<ComponentPropsWithRef<'dialog'>, 'open'> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Dialog({ open, onOpenChange, onCancel, onClose, onPointerDown, onClick, ref, ...props }: DialogProps) {
  const element = useRef<HTMLDialogElement>(null);
  const pressedBackdrop = useRef(false);
  useImperativeHandle(ref, () => element.current!, []);
  useLayoutEffect(() => {
    const dialog = element.current!;
    if (!open) return;
    dialog.showModal();
    return () => dialog.close();
  }, [open]);

  function outside(x: number, y: number) {
    const rect = element.current!.getBoundingClientRect();
    return x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom;
  }

  return <dialog {...props} ref={element} data-nf-dialog=""
    onCancel={event => {
      onCancel?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      onOpenChange(false);
    }}
    onClose={event => {
      onClose?.(event);
      if (open && !event.currentTarget.open) onOpenChange(false);
    }}
    onPointerDown={event => {
      onPointerDown?.(event);
      pressedBackdrop.current = event.target === event.currentTarget && outside(event.clientX, event.clientY);
    }}
    onClick={event => {
      onClick?.(event);
      if (!event.defaultPrevented && pressedBackdrop.current && event.target === event.currentTarget && outside(event.clientX, event.clientY)) {
        onOpenChange(false);
      }
      pressedBackdrop.current = false;
    }} />;
}

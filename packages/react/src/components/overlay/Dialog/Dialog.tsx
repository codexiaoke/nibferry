'use client';

import { createContext, useImperativeHandle, useLayoutEffect, useRef, useState, type ComponentPropsWithRef } from 'react';

export const DialogContainer = createContext<HTMLDialogElement | null>(null);

export interface DialogProps extends Omit<ComponentPropsWithRef<'dialog'>, 'open'> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Dialog({ children, open, onOpenChange, onCancel, onClose, onPointerDown, onClick, ref, ...props }: DialogProps) {
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null);
  const pressedBackdrop = useRef(false);
  useImperativeHandle(ref, () => dialog!, [dialog]);
  useLayoutEffect(() => {
    if (!open || !dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, [open, dialog]);

  function outside(x: number, y: number) {
    const rect = dialog!.getBoundingClientRect();
    return x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom;
  }

  return <dialog {...props} ref={setDialog} data-nf-dialog=""
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
    }}><DialogContainer.Provider value={dialog}>{children}</DialogContainer.Provider></dialog>;
}

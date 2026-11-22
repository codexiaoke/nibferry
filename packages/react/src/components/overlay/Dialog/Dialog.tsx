'use client';

import { createContext, useImperativeHandle, useLayoutEffect, useRef, useState, type ComponentPropsWithRef } from 'react';

export const DialogContainer = createContext<HTMLDialogElement | null>(null);

export interface DialogProps extends Omit<ComponentPropsWithRef<'dialog'>, 'open'> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unmountOnClose?: boolean;
}

export function Dialog({ children, open, onOpenChange, unmountOnClose, onCancel, onClose, onPointerDown, onClick, ref, ...props }: DialogProps) {
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null);
  const [retainContent, setRetainContent] = useState(false);
  const [session, setSession] = useState({ open, key: 0 });
  if (unmountOnClose && open !== session.open) {
    // A reopen during the exit transition still starts a fresh form or search.
    setSession({ open, key: session.key + Number(open) });
  }
  const pressedBackdrop = useRef(false);
  useImperativeHandle(ref, () => dialog!, [dialog]);
  useLayoutEffect(() => () => { if (dialog?.open) dialog.close(); }, [dialog]);
  useLayoutEffect(() => {
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
      if (unmountOnClose) setRetainContent(true);
      return;
    }
    if (dialog.open) dialog.close();
    if (!unmountOnClose) return;
    let current = true;
    const transitions = dialog.getAnimations();
    if (!transitions.length) setRetainContent(false);
    else Promise.allSettled(transitions.map(effect => effect.finished)).then(() => {
      if (current) setRetainContent(false);
    });
    return () => { current = false; };
  }, [open, dialog, unmountOnClose]);

  function outside(x: number, y: number) {
    const rect = dialog!.getBoundingClientRect();
    return x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom;
  }

  return <dialog {...props} inert={!open || props.inert} ref={setDialog} data-nf-dialog=""
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
    }}><DialogContainer.Provider key={unmountOnClose ? session.key : undefined} value={dialog}>
      {(!unmountOnClose || open || retainContent) && children}
    </DialogContainer.Provider></dialog>;
}

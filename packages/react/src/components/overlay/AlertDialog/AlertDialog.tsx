'use client';

import { useId, type ReactNode } from 'react';
import { Dialog, type DialogProps } from '../Dialog/Dialog.js';
import { Button } from '../../input/Button/Button.js';

export interface AlertDialogProps extends Omit<DialogProps, 'title' | 'children'> {
  title: ReactNode;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
}

export function AlertDialog({ title, description, confirmLabel, cancelLabel = '取消', onConfirm,
  destructive, onOpenChange, ...props }: AlertDialogProps) {
  const id = useId();
  return <Dialog {...props} role="alertdialog" data-nf-alert-dialog="" aria-labelledby={id}
    aria-describedby={id + '-description'} onOpenChange={onOpenChange} onClick={event => {
      props.onClick?.(event);
      if (event.target === event.currentTarget) event.preventDefault();
    }}>
    <h2 id={id}>{title}</h2><p id={id + '-description'}>{description}</p>
    <div data-nf-alert-actions="">
      <Button ref={node => { if (node) node.autofocus = true; }} onClick={() => onOpenChange(false)}>{cancelLabel}</Button>
      <Button variant={destructive ? 'danger' : 'primary'} onClick={() => { onConfirm(); onOpenChange(false); }}>
        {confirmLabel}
      </Button>
    </div>
  </Dialog>;
}

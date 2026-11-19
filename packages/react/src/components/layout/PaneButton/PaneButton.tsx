import type { ComponentPropsWithRef, ReactNode } from 'react';
import { HugeiconsIcon, type HugeiconsIconProps } from '@hugeicons/react';

export interface PaneControlProps extends Omit<ComponentPropsWithRef<'button'>, 'aria-controls'> {
  paneId: string;
}

export interface PaneButtonProps extends ComponentPropsWithRef<'button'> {
  paneId?: string;
  icon: HugeiconsIconProps['icon'];
  text?: ReactNode;
}

export function PaneButton({ paneId, icon, text, children, ...props }: PaneButtonProps) {
  return (
    <button
      type="button"
      aria-controls={paneId}
      {...props}
      data-nf-pane-button=""
      data-nf-labeled={text ? '' : undefined}
    >
      {children ?? (
        <>
          <HugeiconsIcon icon={icon} size={16} aria-hidden="true" />
          {text}
        </>
      )}
    </button>
  );
}

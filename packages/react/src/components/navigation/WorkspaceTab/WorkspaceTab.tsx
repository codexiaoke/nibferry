'use client';

import type { ComponentPropsWithRef } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { WorkspaceTabClose } from '../WorkspaceTabClose/WorkspaceTabClose.js';

export interface WorkspaceTabProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
  id: string;
  panelId: string;
  label: string;
  selected: boolean;
  icon?: IconSvgElement;
  onClose?: () => void;
}

export function WorkspaceTab({ id, panelId, label, selected, icon, onClose, onKeyDown, ...props }: WorkspaceTabProps) {
  return (
    <div role="presentation" data-nf-tab-cell="" data-selected={selected || undefined}>
      <button type="button" role="tab" id={id} aria-controls={panelId} aria-selected={selected}
        tabIndex={selected ? 0 : -1} title={label} {...props} data-nf-tab=""
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (onClose && event.key === 'Delete' && !event.defaultPrevented) {
            event.preventDefault();
            onClose();
          }
        }}
      >
        {icon && <HugeiconsIcon icon={icon} size={14} aria-hidden="true" />}
        <span>{label}</span>
      </button>
      {onClose && <WorkspaceTabClose label={label} tabIndex={-1} onClick={onClose} />}
    </div>
  );
}

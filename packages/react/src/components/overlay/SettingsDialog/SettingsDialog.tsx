'use client';

import { useId, type ReactNode } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import Close from '@hugeicons/core-free-icons/Cancel01Icon';
import { Dialog, type DialogProps } from '../Dialog/Dialog.js';
import { PaneButton } from '../../layout/PaneButton/PaneButton.js';
import { ScrollArea } from '../../layout/ScrollArea/ScrollArea.js';

export interface SettingsDialogSection {
  id: string;
  label: string;
  icon?: IconSvgElement;
  content: ReactNode;
}

export interface SettingsDialogProps extends Omit<DialogProps, 'children'> {
  label?: string;
  sections: readonly SettingsDialogSection[];
  value: string;
  onValueChange: (id: string) => void;
}

export function SettingsDialog({ label = '设置', sections, value, onValueChange, open, onOpenChange, ...props }: SettingsDialogProps) {
  const titleId = useId();
  const sectionTitleId = useId();
  const active = sections.find(section => section.id === value) ?? sections[0];
  return (
    <Dialog aria-labelledby={titleId} {...props} data-nf-settings-dialog="" unmountOnClose open={open} onOpenChange={onOpenChange}>
      <div data-nf-settings-sidebar="">
        <h2 id={titleId}>{label}</h2>
        <ScrollArea viewportProps={{ tabIndex: -1 }}>
          <nav aria-labelledby={titleId}>
            {sections.map(section => (
              <button type="button" key={section.id} data-nf-settings-nav-item=""
                aria-current={section.id === active?.id ? 'page' : undefined}
                // showModal() resolves native autofocus after React mounts the closed dialog.
                ref={button => { if (button) button.autofocus = section.id === active?.id; }}
                onClick={() => onValueChange(section.id)}>
                {section.icon && <HugeiconsIcon icon={section.icon} size={17} aria-hidden="true" />}
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </ScrollArea>
      </div>
      <section data-nf-settings-page="" aria-labelledby={active && sectionTitleId}>
        <header>
          <h3 id={sectionTitleId}>{active?.label}</h3>
          <PaneButton icon={Close} aria-label={'关闭' + label} onClick={() => onOpenChange(false)} />
        </header>
        {active && <ScrollArea key={active.id} viewportProps={{ tabIndex: 0 }}>
          <div data-nf-settings-body="">{active.content}</div>
        </ScrollArea>}
      </section>
    </Dialog>
  );
}

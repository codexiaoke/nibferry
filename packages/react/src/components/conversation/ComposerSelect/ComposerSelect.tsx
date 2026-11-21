'use client';

import { ItemIndicator, RadioGroup, RadioItem } from '@radix-ui/react-dropdown-menu';
import { HugeiconsIcon } from '@hugeicons/react';
import Tick from '@hugeicons/core-free-icons/Tick02Icon';
import { DropdownMenu } from '../../menu/DropdownMenu/DropdownMenu.js';
import { MenuContent, type MenuContentProps } from '../../menu/MenuContent/MenuContent.js';
import { MenuTrigger } from '../../menu/MenuTrigger/MenuTrigger.js';

export interface ComposerSelectOption {
  value: string;
  label: string;
  detail?: string;
  disabled?: boolean;
}

export interface ComposerSelectProps {
  label: string;
  value: string;
  options: readonly ComposerSelectOption[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  menuClassName?: string;
  container?: MenuContentProps['container'];
}

export function ComposerSelect({ label, value, options, onValueChange, disabled, className, menuClassName, container }: ComposerSelectProps) {
  const selected = options.find(option => option.value === value);
  const current = selected && [selected.label, selected.detail].filter(Boolean).join(' ');
  return <DropdownMenu modal={false}>
    <MenuTrigger data-nf-composer-select="" disabled={disabled || !options.length} className={className}
      aria-label={current ? label + '，' + current : label} title={current || label}>
      <span>{selected?.label ?? label}</span>
      {selected?.detail && <small>{selected.detail}</small>}
    </MenuTrigger>
    <MenuContent container={container} side="top" className={menuClassName} aria-label={label} onCloseAutoFocus={event => {
      // A neighboring control may already have taken focus during the closing animation.
      const menu = event.target as HTMLElement;
      const active = menu.ownerDocument.activeElement;
      if (active && active !== menu.ownerDocument.body && !menu.contains(active)) event.preventDefault();
    }}>
      <RadioGroup data-nf-composer-options="" value={value} onValueChange={onValueChange}>
        {options.map(option => <RadioItem key={option.value} value={option.value} disabled={option.disabled} data-nf-menu-item="">
          <span data-nf-menu-text="">{option.label} {option.detail && <small>{option.detail}</small>}</span>
          <ItemIndicator><HugeiconsIcon icon={Tick} size={14} aria-hidden="true" /></ItemIndicator>
        </RadioItem>)}
      </RadioGroup>
    </MenuContent>
  </DropdownMenu>;
}

'use client';

import { ItemIndicator, RadioGroup, RadioItem } from '@radix-ui/react-dropdown-menu';
import { HugeiconsIcon } from '@hugeicons/react';
import Tick from '@hugeicons/core-free-icons/Tick02Icon';
import Chevron from '@hugeicons/core-free-icons/ArrowDown01Icon';
import { DropdownMenu } from '../../menu/DropdownMenu/DropdownMenu.js';
import { MenuContent, type MenuContentProps } from '../../menu/MenuContent/MenuContent.js';
import { MenuTrigger, type MenuTriggerProps } from '../../menu/MenuTrigger/MenuTrigger.js';

export interface SelectOption {
  value: string;
  label: string;
  detail?: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<MenuTriggerProps, 'value' | 'children' | 'asChild' | 'defaultValue'> {
  label: string;
  value: string;
  options: readonly SelectOption[];
  onValueChange: (value: string) => void;
  menuClassName?: string;
  container?: MenuContentProps['container'];
  side?: MenuContentProps['side'];
  variant?: 'field' | 'compact';
}

export function Select({ label, value, options, onValueChange, disabled, menuClassName, container,
  side = 'bottom', variant = 'field', ...trigger }: SelectProps) {
  const selected = options.find(option => option.value === value);
  const current = selected && [selected.label, selected.detail].filter(Boolean).join(' ');
  return <DropdownMenu modal={false}>
    <MenuTrigger data-nf-select={variant} disabled={disabled || !options.length}
      title={variant === 'compact' ? current || label : undefined}
      aria-label={current ? label + '，' + current : label} {...trigger}>
      <span>{selected?.label ?? label}</span>
      {selected?.detail && <small>{selected.detail}</small>}
      {variant === 'field' && <HugeiconsIcon icon={Chevron} size={14} aria-hidden="true" />}
    </MenuTrigger>
    <MenuContent data-nf-select-menu="" container={container} side={side} className={menuClassName} aria-label={label} onCloseAutoFocus={event => {
      const menu = event.target as HTMLElement;
      const active = menu.ownerDocument.activeElement;
      if (active && active !== menu.ownerDocument.body && !menu.contains(active)) event.preventDefault();
    }}>
      <RadioGroup data-nf-select-options="" value={value} onValueChange={onValueChange}>
        {options.map(option => <RadioItem key={option.value} value={option.value} disabled={option.disabled} data-nf-menu-item="">
          <span data-nf-menu-text="">{option.label} {option.detail && <small>{option.detail}</small>}</span>
          <ItemIndicator><HugeiconsIcon icon={Tick} size={14} aria-hidden="true" /></ItemIndicator>
        </RadioItem>)}
      </RadioGroup>
    </MenuContent>
  </DropdownMenu>;
}

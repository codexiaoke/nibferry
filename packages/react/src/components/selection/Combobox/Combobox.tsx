'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Chevron from '@hugeicons/core-free-icons/ArrowDown01Icon';
import Tick from '@hugeicons/core-free-icons/Tick02Icon';
import { Button, type ButtonProps } from '../../input/Button/Button.js';
import { Input } from '../../input/Input/Input.js';
import { ScrollArea } from '../../layout/ScrollArea/ScrollArea.js';
import { Popover, type PopoverProps } from '../../overlay/Popover/Popover.js';
import type { SelectOption } from '../Select/Select.js';

export interface ComboboxProps extends Omit<ButtonProps, 'value' | 'defaultValue' | 'children'> {
  label: string;
  options: readonly SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  container?: PopoverProps['container'];
}

export function Combobox({ label, options, value, onValueChange, placeholder = '搜索选项',
  emptyText = '没有匹配的选项', container, onKeyDown, ...triggerProps }: ComboboxProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState<string>();
  const selected = options.find(option => option.value === value);
  const search = query.trim().toLocaleLowerCase();
  const results = options.filter(option => [option.label, option.detail].some(text => text?.toLocaleLowerCase().includes(search)));
  const enabled = results.filter(option => !option.disabled);
  const active = enabled.find(option => option.value === highlight) ?? enabled[0];
  const optionId = (option: SelectOption) => id + '-' + encodeURIComponent(option.value);

  function changeOpen(next: boolean) {
    if (next) { setQuery(''); setHighlight(value); }
    setOpen(next);
  }
  function choose(option: SelectOption) {
    if (option.disabled) return;
    onValueChange(option.value);
    setOpen(false);
  }
  function navigate(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229 || !active) return;
    if (event.key === 'Enter') { event.preventDefault(); choose(active); return; }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const delta = event.key === 'ArrowDown' ? 1 : -1;
    const next = enabled[(enabled.indexOf(active) + delta + enabled.length) % enabled.length];
    setHighlight(next.value);
    document.getElementById(optionId(next))?.scrollIntoView({ block: 'nearest' });
  }
  return <Popover label={label} open={open} onOpenChange={changeOpen} container={container}
    data-nf-combobox-panel="" onOpenAutoFocus={event => {
      event.preventDefault(); input.current?.focus({ preventScroll: true });
      if (active) document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' });
    }} trigger={<Button {...triggerProps} data-nf-combobox-trigger="" aria-label={label + (selected ? '，' + selected.label : '')}
      onKeyDown={event => {
        onKeyDown?.(event);
        if (!event.defaultPrevented && event.key === 'ArrowDown') { event.preventDefault(); changeOpen(true); }
      }}>
      <span>{selected?.label ?? label}</span><HugeiconsIcon icon={Chevron} size={14} aria-hidden="true" />
    </Button>}>
    <Input ref={input} role="combobox" aria-autocomplete="list" aria-label={label} aria-expanded={open}
      aria-controls={id} aria-activedescendant={active && optionId(active)} autoComplete="off"
      placeholder={placeholder} value={query} onChange={event => { setQuery(event.target.value); setHighlight(undefined); }}
      onKeyDown={navigate} />
    <ScrollArea data-nf-combobox-results="" viewportProps={{ tabIndex: -1 }}>
      <div id={id} role="listbox" aria-label={label}>
        {results.map(option => <div key={option.value} id={optionId(option)} role="option"
          aria-selected={option.value === value} aria-disabled={option.disabled || undefined}
          data-active={option === active || undefined} onPointerMove={() => { if (!option.disabled) setHighlight(option.value); }}
          onMouseDown={event => event.preventDefault()} onClick={() => choose(option)}>
          <span>{option.label}{option.detail && <small>{option.detail}</small>}</span>
          {option.value === value && <HugeiconsIcon icon={Tick} size={14} aria-hidden="true" />}
        </div>)}
      </div>
      {!results.length && <div role="status">{emptyText}</div>}
    </ScrollArea>
  </Popover>;
}

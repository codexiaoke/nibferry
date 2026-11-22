'use client';

import { useId, useLayoutEffect, useRef, useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { WorkspaceTab } from '../WorkspaceTab/WorkspaceTab.js';
import { WorkspaceTabList } from '../WorkspaceTabList/WorkspaceTabList.js';

export interface TabsItem {
  value: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue'> {
  label: string;
  items: readonly TabsItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({ label, items, value, defaultValue, onValueChange, ...props }: TabsProps) {
  const id = useId();
  const list = useRef<HTMLDivElement>(null);
  const [localValue, setLocalValue] = useState(defaultValue);
  const selected = items.find(item => !item.disabled && item.value === (value ?? localValue))
    ?? items.find(item => !item.disabled);
  useLayoutEffect(() => {
    const element = list.current!;
    const active = element.querySelector<HTMLElement>(':scope > [data-selected]');
    if (!active) { element.removeAttribute('data-indicator'); return; }
    const position = () => {
      const { offsetLeft, offsetWidth } = active;
      element.style.setProperty('--nf-tab-x', offsetLeft + 'px');
      element.style.setProperty('--nf-tab-width', offsetWidth + 'px');
    };
    position();
    element.setAttribute('data-indicator', '');
    const observer = new ResizeObserver(position);
    for (const cell of element.children) observer.observe(cell);
    return () => observer.disconnect();
  }, [selected, items, props.dir]);
  return <div data-nf-tabs="" {...props}>
    <WorkspaceTabList ref={list} aria-label={label}>
      {items.map((item, index) => <WorkspaceTab key={item.value} id={id + '-tab-' + index} panelId={id + '-panel-' + index}
        label={item.label} selected={item === selected} disabled={item.disabled} onClick={() => {
          if (item === selected) return;
          if (value === undefined) setLocalValue(item.value);
          onValueChange?.(item.value);
        }} />)}
    </WorkspaceTabList>
    {items.map((item, index) => <div key={item.value} role="tabpanel" id={id + '-panel-' + index}
      aria-labelledby={id + '-tab-' + index} hidden={item !== selected} tabIndex={0}>
      {item.content}
    </div>)}
  </div>;
}

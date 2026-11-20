'use client';

import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { flushSync } from 'react-dom';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { Dialog, type DialogProps } from '../../overlay/Dialog/Dialog.js';

export interface SearchDialogItem {
  id: string;
  label: string;
  icon?: IconSvgElement;
  detail?: string;
  keywords?: string;
  /** Letter invoked with Command on macOS or Control on other platforms. */
  shortcutKey?: string;
  onSelect: () => void;
}

export interface SearchDialogGroup {
  id: string;
  label: string;
  filterLabel?: string;
  previewLimit?: number;
  items: readonly SearchDialogItem[];
}

export interface SearchDialogProps extends Pick<DialogProps, 'open' | 'onOpenChange' | 'className' | 'id'> {
  label: string;
  groups: readonly SearchDialogGroup[];
}

export function SearchDialog({ label, groups, open, onOpenChange, ...props }: SearchDialogProps) {
  function choose(item: SearchDialogItem) {
    // Release the focus trap before the host opens or focuses the destination.
    flushSync(() => onOpenChange(false));
    item.onSelect();
  }
  return <Dialog {...props} open={open} onOpenChange={onOpenChange}
    aria-label={label} data-nf-search-dialog="">
    {open && <SearchPanel label={label} groups={groups} choose={choose} />}
  </Dialog>;
}

function SearchPanel({ label, groups, choose }: Pick<SearchDialogProps, 'label' | 'groups'> & {
  choose: (item: SearchDialogItem) => void;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [active, setActive] = useState<SearchDialogItem['id'] | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [mac, setMac] = useState(false);
  useLayoutEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const visible = groups.filter(group => category === null || group.id === category).map(group => {
    const matching = terms.length ? group.items.filter(item => {
      const text = [item.label, item.detail, item.keywords].join(' ').toLowerCase();
      return terms.every(term => text.includes(term));
    }) : group.items;
    return { ...group, items: !terms.length && category === null ? matching.slice(0, group.previewLimit) : matching };
  }).filter(group => group.items.length > 0);
  const items = visible.flatMap(group => group.items);
  const selected = items.find(item => item.id === active) ?? items[0];
  const optionId = (item: SearchDialogItem) => listId + '-' + encodeURIComponent(item.id);

  function resetSelection() {
    setActive(null);
    if (list.current) list.current.scrollTop = 0;
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
    if ((mac ? event.metaKey : event.ctrlKey) && !event.altKey && !event.shiftKey) {
      const command = groups.flatMap(group => group.items).find(item => item.shortcutKey?.toLowerCase() === event.key.toLowerCase());
      if (command) { event.preventDefault(); choose(command); }
      return;
    }
    if (!selected) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      choose(selected);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const step = event.key === 'ArrowUp' ? -1 : 1;
      const next = items[(items.indexOf(selected) + step + items.length) % items.length];
      setActive(next.id);
      document.getElementById(optionId(next))?.scrollIntoView({ block: 'nearest' });
    }
  }

  return <>
    <input ref={input} autoFocus role="combobox" aria-label={label} placeholder={label}
      aria-autocomplete="list" aria-expanded="true" aria-controls={listId}
      aria-activedescendant={selected && optionId(selected)} value={query} onKeyDown={handleKey}
      onChange={event => { setQuery(event.target.value); resetSelection(); }} />
    <div data-nf-search-scroll="" ref={list}>
      <div role="listbox" id={listId} aria-label="搜索结果">
        {visible.map(group => <div key={group.id} role="group" aria-label={group.label}>
          <div data-nf-search-heading="" aria-hidden="true">{group.label}</div>
          {group.items.map(item => <div key={item.id} id={optionId(item)} role="option"
            aria-selected={selected?.id === item.id} onPointerMove={() => setActive(item.id)}
            onMouseDown={event => event.preventDefault()} onClick={() => choose(item)}>
            {item.icon && <HugeiconsIcon icon={item.icon} size={16} aria-hidden="true" />}
            <span data-nf-search-label="">{item.label}</span>
            {item.detail && <small>{item.detail}</small>}
            {item.shortcutKey && <kbd>{mac ? '⌘' : 'Ctrl+'}{item.shortcutKey.toUpperCase()}</kbd>}
          </div>)}
        </div>)}
      </div>
      {!items.length && <div data-nf-search-empty="" role="status">没有找到匹配的结果</div>}
    </div>
    <div role="group" aria-label="搜索分类" data-nf-search-filters="">
      {[{ id: null, label: '全部' }, ...groups.map(group => ({ id: group.id, label: group.filterLabel ?? group.label }))].map(filter =>
        <button key={filter.id ?? ''} type="button" aria-pressed={category === filter.id}
          onClick={() => { setCategory(filter.id); resetSelection(); input.current?.focus(); }}>{filter.label}</button>
      )}
    </div>
  </>;
}

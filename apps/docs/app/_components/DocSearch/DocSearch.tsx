'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import Search from '@hugeicons/core-free-icons/Search01Icon';
import Up from '@hugeicons/core-free-icons/ArrowUp02Icon';
import Down from '@hugeicons/core-free-icons/ArrowDown02Icon';
import File from '@hugeicons/core-free-icons/File02Icon';
import Hash from '@hugeicons/core-free-icons/HashtagIcon';
import Close from '@hugeicons/core-free-icons/Cancel01Icon';
import type { SearchEntry } from '../../../lib/docs';

function excerpt(text: string, query: string) {
  const plain = text.replace(/`+/g, '').replace(/\s+/g, ' ');
  const index = plain.toLowerCase().indexOf(query.trim().toLowerCase());
  return index > 24 ? '…' + plain.slice(index - 12) : plain;
}

function findEntries(entries: SearchEntry[], query: string) {
  const words = query.trim().toLowerCase().split(/\s+/);
  if (!words[0]) return entries.filter((item) => !item.section);
  return entries
    .flatMap((entry) => {
      const title = entry.title.toLowerCase();
      const content = (entry.location + ' ' + entry.text).toLowerCase();
      if (!words.every((word) => title.includes(word) || content.includes(word))) return [];
      const score = words.reduce((sum, word) => sum + (title.includes(word) ? 2 : 0), 0);
      return [{ entry, score: score + (title === query.trim().toLowerCase() ? 4 : 0) }];
    })
    .sort((a, b) => b.score - a.score)
    .map(({ entry }) => entry);
}

function measureSelection(content: HTMLElement) {
  const selected = content.querySelector<HTMLElement>('[aria-selected="true"]');
  if (!selected) return;
  content.style.setProperty('--selection-y', selected.offsetTop + 'px');
  content.style.setProperty('--selection-height', selected.offsetHeight + 'px');
}

export default function DocSearch({
  entries,
  onOpen,
}: {
  entries: SearchEntry[];
  onOpen: () => void;
}) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [shortcut, setShortcut] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const results = useMemo(() => findEntries(entries, query), [entries, query]);

  useLayoutEffect(() => {
    if (dialog.current?.open && content.current) measureSelection(content.current);
  }, [active, query]);

  useEffect(() => {
    const element = content.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      if (!dialog.current?.open) return;
      dialog.current.style.setProperty('--results-height', element.offsetHeight + 'px');
      measureSelection(element);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setShortcut(/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K');
    function shortcutKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else trigger.current?.click();
      }
    }
    document.addEventListener('keydown', shortcutKey);
    return () => document.removeEventListener('keydown', shortcutKey);
  }, []);

  function open() {
    onOpen();
    setQuery('');
    setActive(0);
    dialog.current?.showModal();
    content.current?.parentElement?.scrollTo(0, 0);
    if (content.current) measureSelection(content.current);
    input.current?.focus();
  }

  function select(entry: SearchEntry) {
    dialog.current?.close();
    router.push(entry.url);
  }

  return (
    <>
      <button
        type="button"
        ref={trigger}
        className="header-search"
        aria-label="搜索文档"
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        onClick={open}
      >
        <HugeiconsIcon icon={Search} size={16} aria-hidden="true" />
        <span>搜索文档</span>
        {shortcut && <kbd>{shortcut}</kbd>}
      </button>
      <dialog
        ref={dialog}
        className="doc-search-dialog"
        aria-label="搜索文档"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="doc-search-panel">
          <div className="doc-search-field">
            <HugeiconsIcon icon={Search} size={20} aria-hidden="true" />
            <input
              ref={input}
              type="text"
              role="combobox"
              aria-label="搜索文档"
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls="search-results"
              aria-expanded="true"
              aria-activedescendant={results.length ? 'search-result-' + active : undefined}
              placeholder="搜索文档…"
              value={query}
              onChange={(event) => {
                content.current?.parentElement?.scrollTo(0, 0);
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing || !results.length) return;
                if (event.key === 'Enter') {
                  event.preventDefault();
                  select(results[active]);
                }
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                  event.preventDefault();
                  const next =
                    (active + (event.key === 'ArrowDown' ? 1 : -1) + results.length) %
                    results.length;
                  setActive(next);
                  document
                    .getElementById('search-result-' + next)
                    ?.scrollIntoView({ block: 'nearest' });
                }
              }}
            />
            <button
              type="button"
              className="icon-button"
              aria-label="关闭搜索"
              onClick={() => dialog.current?.close()}
            >
              <HugeiconsIcon icon={Close} size={16} aria-hidden="true" />
            </button>
          </div>
          <div className="search-scroll">
            <div className="search-content" ref={content}>
              <p className="search-caption" role="status">
                {query.trim()
                  ? results.length
                    ? results.length + ' 个结果'
                    : '没有找到匹配的文档'
                  : '浏览文档'}
              </p>
              <div id="search-results" role="listbox" aria-label="文档结果">
                {results.map((entry, i) => (
                  <div
                    key={entry.url}
                    id={'search-result-' + i}
                    role="option"
                    aria-selected={active === i}
                    className="search-result"
                    onPointerMove={() => setActive(i)}
                    onClick={() => select(entry)}
                  >
                    <HugeiconsIcon
                      icon={entry.section ? Hash : File}
                      size={17}
                      aria-hidden="true"
                    />
                    <div>
                      <strong>{entry.title}</strong>
                      <small>
                        {entry.section ? entry.location + ' · ' : ''}
                        {excerpt(entry.text, query)}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="search-help">
            <span>
              <kbd aria-label="上方向键">
                <HugeiconsIcon icon={Up} size={12} aria-hidden="true" />
              </kbd>
              <kbd aria-label="下方向键">
                <HugeiconsIcon icon={Down} size={12} aria-hidden="true" />
              </kbd>{' '}
              选择
            </span>
            <span>
              <kbd>Enter</kbd> 打开
            </span>
            <span>
              <kbd>Esc</kbd> 关闭
            </span>
          </div>
        </div>
      </dialog>
    </>
  );
}

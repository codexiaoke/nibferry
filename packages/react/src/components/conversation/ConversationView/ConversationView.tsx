'use client';

import { Children, useContext, useLayoutEffect, useReducer, useRef, useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ConversationFileReceiver, FileDropArea } from './file-drop.js';
import { ConversationScrollRequest } from './scroll-to-latest.js';
import { SelectionQuote, type ReplySelection } from './selection-quote.js';
import { Button } from '../../input/Button/Button.js';
import Down from '@hugeicons/core-free-icons/ArrowDown02Icon';
import { ScrollArea } from '../../layout/ScrollArea/ScrollArea.js';

export function useConversationScrollToLatest() {
  return useContext(ConversationScrollRequest);
}

export interface ConversationViewProps extends ComponentPropsWithRef<'div'> {
  composer?: ReactNode;
  empty?: ReactNode;
  latestLabel?: string;
  onQuoteSelection?: (selection: ReplySelection) => void;
  onLoadEarlier?: () => void | Promise<void>;
}

export function ConversationView({ composer, empty, children, latestLabel = '返回最新消息', onQuoteSelection, onLoadEarlier, ...props }: ConversationViewProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const fileReceiver = useRef<((files: File[]) => void) | undefined>(undefined);
  const follow = useRef(true);
  const lastTop = useRef(0);
  const automaticTop = useRef<number | null>(null);
  const [away, setAway] = useState(false);
  const [latestRequest, requestLatest] = useReducer((count: number) => count + 1, 0);
  const hasTurns = Children.toArray(children).length > 0;

  const pending = useRef(false);
  const anchor = useRef<{ element: Element; top: number } | null>(null);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error'>('idle');
  function contentTop(node: Element, el: HTMLElement) {
    return node.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
  }
  async function loadEarlier() {
    const el = viewport.current;
    const first = content.current?.firstElementChild;
    if (!el || !onLoadEarlier || pending.current) return;
    pending.current = true;
    follow.current = false;
    anchor.current = first ? { element: first, top: contentTop(first, el) } : null;
    setLoadState('loading');
    try {
      await onLoadEarlier();
      setLoadState('idle');
    } catch {
      anchor.current = null;
      setLoadState('error');
    } finally {
      pending.current = false;
    }
  }
  useLayoutEffect(() => {
    const saved = anchor.current;
    const el = viewport.current;
    if (!saved || !el || !saved.element.isConnected) return;
    if (content.current?.firstElementChild === saved.element) return;
    el.scrollTop += contentTop(saved.element, el) - saved.top;
    automaticTop.current = el.scrollTop;
    recordPosition(el);
    anchor.current = null;
  });

  function recordPosition(el: HTMLDivElement) {
    if (!el.clientHeight) return;
    lastTop.current = el.scrollTop;
    follow.current = el.scrollHeight - el.clientHeight - el.scrollTop < 32;
    setAway(!follow.current);
  }

  function scrollToEnd(el: HTMLDivElement) {
    el.scrollTop = el.scrollHeight;
    automaticTop.current = el.scrollTop;
  }

  // A send can append a turn and shrink the composer in the same commit.
  useLayoutEffect(() => {
    if (!latestRequest) return;
    const el = viewport.current!;
    scrollToEnd(el);
    recordPosition(el);
  }, [latestRequest]);

  useLayoutEffect(() => {
    const el = viewport.current!;
    function sync() {
      if (!el.clientHeight) return;
      // ResizeObserver can run before the scroll event from scrolling back to read.
      if (el.scrollTop < lastTop.current - 1) recordPosition(el);
      // Keep the control the reader is using in place when its details expand.
      if (follow.current && !content.current?.contains(document.activeElement)) scrollToEnd(el);
      recordPosition(el);
    }
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    observer.observe(content.current!);
    return () => observer.disconnect();
  }, []);

  return <FileDropArea {...props} receiver={() => fileReceiver.current} data-nf-conversation-view="" data-empty={!hasTurns}>
    {onQuoteSelection && <SelectionQuote content={content} onQuote={onQuoteSelection} />}
    <ScrollArea data-nf-thread-area="" viewportProps={{
      ref: viewport, tabIndex: -1, 'data-nf-thread-scroll': '',
      onScroll: event => {
        // A growing block can move the bottom again before our previous scroll event arrives.
        const el = event.currentTarget;
        if (el.scrollTop !== automaticTop.current) {
          const movedUp = el.scrollTop < lastTop.current;
          recordPosition(el);
          if (movedUp && el.scrollTop < 8 && loadState === 'idle') void loadEarlier();
        }
        automaticTop.current = null;
      },
    }}>
      {onLoadEarlier && <div data-nf-history-control=""><Button variant="ghost" disabled={loadState === 'loading'} onClick={loadEarlier}>
        {loadState === 'loading' ? '正在加载历史消息' : loadState === 'error' ? '重试加载历史消息' : '加载更早消息'}
      </Button></div>}
      <div ref={content} data-nf-transcript="">{hasTurns ? children : empty}</div>
    </ScrollArea>
    <div data-nf-composer-row="">
      <div data-nf-composer-dock="">
        {away && <button type="button" data-nf-latest="" aria-label={latestLabel} onClick={() => {
          requestLatest();
          viewport.current!.focus({ preventScroll: true });
        }}><HugeiconsIcon icon={Down} size={18} aria-hidden="true" /></button>}
        <ConversationScrollRequest.Provider value={requestLatest}>
          <ConversationFileReceiver.Provider value={fileReceiver}>{composer}</ConversationFileReceiver.Provider>
        </ConversationScrollRequest.Provider>
      </div>
    </div>
  </FileDropArea>;
}

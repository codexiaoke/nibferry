'use client';

import { Children, useLayoutEffect, useRef, useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Down from '@hugeicons/core-free-icons/ArrowDown02Icon';
import { ScrollArea } from '../../layout/ScrollArea/ScrollArea.js';

export interface ConversationViewProps extends ComponentPropsWithRef<'div'> {
  composer?: ReactNode;
  empty?: ReactNode;
  latestLabel?: string;
}

export function ConversationView({ composer, empty, children, latestLabel = '返回最新消息', ...props }: ConversationViewProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const lastTop = useRef(0);
  const automaticTop = useRef<number | null>(null);
  const [away, setAway] = useState(false);
  const hasTurns = Children.toArray(children).length > 0;

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

  return <div {...props} data-nf-conversation-view="" data-empty={!hasTurns}>
    <ScrollArea data-nf-thread-area="" viewportProps={{
      ref: viewport, tabIndex: -1, 'data-nf-thread-scroll': '',
      onScroll: event => {
        // A growing block can move the bottom again before our previous scroll event arrives.
        if (event.currentTarget.scrollTop !== automaticTop.current) recordPosition(event.currentTarget);
        automaticTop.current = null;
      },
    }}>
      <div ref={content} data-nf-transcript="">{hasTurns ? children : empty}</div>
    </ScrollArea>
    <div data-nf-composer-row="">
      <div data-nf-composer-dock="">
        {away && <button type="button" data-nf-latest="" aria-label={latestLabel} onClick={() => {
          follow.current = true;
          scrollToEnd(viewport.current!);
          setAway(false);
          viewport.current!.focus({ preventScroll: true });
        }}><HugeiconsIcon icon={Down} size={18} aria-hidden="true" /></button>}
        {composer}
      </div>
    </div>
  </div>;
}

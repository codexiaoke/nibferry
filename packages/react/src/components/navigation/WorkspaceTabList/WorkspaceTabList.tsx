'use client';

import { useLayoutEffect, useRef, useState, type ComponentPropsWithRef } from 'react';

export interface WorkspaceTabListProps extends ComponentPropsWithRef<'div'> {
  onReorder?: (orderedIds: string[]) => void;
}

function tabsIn(list: HTMLElement) {
  return Array.from(list.querySelectorAll<HTMLButtonElement>(':scope > [data-nf-tab-cell] > [role="tab"]'));
}

function moveTo(tabs: HTMLButtonElement[], from: number, to: number) {
  const ids = tabs.map((tab) => tab.id);
  const [moved] = ids.splice(from, 1);
  ids.splice(to, 0, moved);
  return ids;
}

export function WorkspaceTabList({ onReorder, children, ...props }: WorkspaceTabListProps) {
  const gesture = useRef<{
    tab: HTMLButtonElement;
    pointer: number;
    start: number;
    startTime: number;
    scrollLeft: number;
    mode: 'pending' | 'drag' | 'scroll';
  } | null>(null);
  const suppressClick = useRef(false);
  const scrollFrame = useRef(0);
  const [marker, setMarker] = useState<number | null>(null);
  const focusAfterMove = useRef<HTMLButtonElement | null>(null);
  useLayoutEffect(() => {
    focusAfterMove.current?.focus();
    focusAfterMove.current = null;
  }, [children]);
  useLayoutEffect(() => () => cancelAnimationFrame(scrollFrame.current), []);

  function reset() {
    cancelAnimationFrame(scrollFrame.current);
    gesture.current = null;
    setMarker(null);
  }

  function destination(list: HTMLElement, x: number, y: number) {
    const bounds = list.getBoundingClientRect();
    if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) return null;
    const tabs = tabsIn(list);
    const from = tabs.indexOf(gesture.current!.tab);
    const to = tabs.findIndex((tab) => {
      const rect = tab.parentElement!.getBoundingClientRect();
      return x >= rect.left && x <= rect.right;
    });
    if (from < 0 || to < 0 || from === to) return null;
    const target = tabs[to].parentElement!.getBoundingClientRect();
    const after = (to > from) !== (getComputedStyle(list).direction === 'rtl');
    return { tabs, from, to, edge: (after ? target.right : target.left) - bounds.left + list.scrollLeft };
  }

  function trackDrop(list: HTMLElement, x: number, y: number) {
    cancelAnimationFrame(scrollFrame.current);
    const bounds = list.getBoundingClientRect();
    if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) {
      setMarker(null);
      return;
    }
    const step = x <= bounds.left + 12 ? -6 : x >= bounds.right - 12 ? 6 : 0;
    function update() {
      const before = list.scrollLeft;
      list.scrollLeft += step;
      setMarker(destination(list, x, y)?.edge ?? null);
      if (list.scrollLeft !== before) scrollFrame.current = requestAnimationFrame(update);
    }
    update();
  }

  return (
    <div {...props} role="tablist" data-nf-tab-list="" data-reorderable={onReorder ? '' : undefined}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === 'Escape' && gesture.current) { reset(); return; }
        const list = event.currentTarget;
        const allTabs = tabsIn(list);
        const tabs = allTabs.filter(tab => !tab.disabled && !tab.hidden);
        const index = tabs.indexOf(event.target as HTMLButtonElement);
        if (index < 0) return;
        const rtl = getComputedStyle(list).direction === 'rtl';
        let step = 0;
        if (event.key === 'ArrowRight') step = rtl ? -1 : 1;
        if (event.key === 'ArrowLeft') step = rtl ? 1 : -1;
        if (event.altKey && step && onReorder) {
          event.preventDefault();
          const to = index + step;
          if (tabs[to]) {
            focusAfterMove.current = tabs[index];
            onReorder(moveTo(allTabs, allTabs.indexOf(tabs[index]), allTabs.indexOf(tabs[to])));
          }
          return;
        }
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        let next = index;
        if (step) next = (index + step + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        tabs[next].focus();
        tabs[next].click();
      }}
      onPointerDown={(event) => {
        props.onPointerDown?.(event);
        suppressClick.current = false;
        if (!onReorder || event.defaultPrevented || event.button !== 0 || !event.isPrimary) return;
        const tab = (event.target as Element).closest<HTMLButtonElement>('[data-nf-tab]');
        if (!tab || tab.disabled) return;
        gesture.current = {
          tab, pointer: event.pointerId, start: event.clientX, startTime: event.timeStamp,
          scrollLeft: event.currentTarget.scrollLeft, mode: 'pending',
        };
        tab.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        props.onPointerMove?.(event);
        const drag = gesture.current;
        if (!drag || drag.pointer !== event.pointerId) return;
        const list = event.currentTarget;
        const dx = event.clientX - drag.start;
        if (drag.mode === 'pending') {
          if (Math.abs(dx) < 5) return;
          const swipe = event.pointerType === 'touch' && list.scrollWidth > list.clientWidth
            && event.timeStamp - drag.startTime < 250;
          drag.mode = swipe ? 'scroll' : 'drag';
        }
        suppressClick.current = true;
        if (drag.mode === 'scroll') {
          list.scrollLeft = drag.scrollLeft - dx;
          return;
        }
        trackDrop(list, event.clientX, event.clientY);
      }}
      onPointerUp={(event) => {
        props.onPointerUp?.(event);
        const drag = gesture.current;
        if (!drag || drag.pointer !== event.pointerId) return;
        const drop = drag.mode === 'drag' && destination(event.currentTarget, event.clientX, event.clientY);
        reset();
        if (drop) onReorder?.(moveTo(drop.tabs, drop.from, drop.to));
      }}
      onLostPointerCapture={(event) => {
        props.onLostPointerCapture?.(event);
        if (gesture.current?.pointer === event.pointerId) reset();
      }}
      onClickCapture={(event) => {
        if (suppressClick.current && event.detail > 0) {
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        } else props.onClickCapture?.(event);
      }}
    >
      {children}
      {marker !== null && <span aria-hidden="true" data-nf-tab-marker="" style={{ left: marker }} />}
    </div>
  );
}

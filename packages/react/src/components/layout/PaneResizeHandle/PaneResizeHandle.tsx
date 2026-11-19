'use client';

import {
  useLayoutEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentPropsWithRef,
} from 'react';

export interface PaneResizeHandleProps
  extends Pick<
    ComponentPropsWithRef<'div'>,
    'className' | 'style' | 'title' | 'aria-label' | 'ref'
  > {
  side: 'left' | 'right';
  paneId: string;
  onWidthChange: (width: number) => void;
}

function lengthInPixels(length: string, basis: number) {
  if (length.endsWith('%')) return (parseFloat(length) / 100) * basis;
  return length.endsWith('px') ? parseFloat(length) : undefined;
}

function measure(pane: HTMLElement, main: HTMLElement) {
  const width = Math.round(pane.getBoundingClientRect().width);
  const mainWidth = main.getBoundingClientRect().width;
  const basis = pane.parentElement!.clientWidth;
  const style = getComputedStyle(pane);
  const min = Math.ceil(lengthInPixels(style.minWidth, basis) ?? 0);
  const mainMin = lengthInPixels(getComputedStyle(main).minWidth, basis) ?? 0;
  const limit = Math.min(
    width + mainWidth - mainMin,
    lengthInPixels(style.maxWidth, basis) ?? Infinity,
  );
  const max = Math.max(min, Math.floor(limit));
  return { width, min, max, basis, atMainMin: mainWidth <= mainMin + 0.5 };
}

export function PaneResizeHandle({
  side,
  paneId,
  onWidthChange,
  ref,
  ...props
}: PaneResizeHandleProps) {
  const handle = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; width: number; direction: number } | null>(null);
  const panels = useRef<{ pane: HTMLElement; main: HTMLElement } | null>(null);
  const [range, setRange] = useState({ width: 0, min: 0, max: 0 });
  useImperativeHandle(ref, () => handle.current!, []);

  useLayoutEffect(() => {
    const workspace = handle.current!.parentElement!;
    const observer = new ResizeObserver(sync);
    let previous: ReturnType<typeof measure> | undefined;
    function sync() {
      const pair = panels.current;
      if (!pair || !handle.current?.getClientRects().length) return;
      const next = measure(pair.pane, pair.main);
      // Flex can compress both sides when the container narrows. Adopt their
      // displayed widths together so the next drag starts at the visible edge.
      if (
        previous &&
        next.basis < previous.basis &&
        next.width < previous.width &&
        next.atMainMin
      ) {
        onWidthChange(next.width);
      }
      previous = next;
      setRange((old) =>
        old.width === next.width && old.min === next.min && old.max === next.max ? old : next,
      );
    }
    function connect() {
      observer.disconnect();
      const pane = workspace.querySelector<HTMLElement>(':scope > [data-nf-pane="' + side + '"]');
      const main = workspace.querySelector<HTMLElement>(':scope > [data-nf-pane="main"]');
      panels.current = pane?.id === paneId && main ? { pane, main } : null;
      if (panels.current) {
        observer.observe(panels.current.pane);
        observer.observe(panels.current.main);
        observer.observe(workspace);
        sync();
      }
    }
    connect();
    // Either sibling can be conditionally replaced by the host.
    const children = new MutationObserver(connect);
    children.observe(workspace, { childList: true });
    return () => {
      children.disconnect();
      observer.disconnect();
      panels.current = null;
    };
  }, [side, paneId, onWidthChange]);

  function direction() {
    const rtl = getComputedStyle(handle.current!.parentElement!).direction === 'rtl';
    return (side === 'left') !== rtl ? 1 : -1;
  }
  function resize(next: number) {
    if (!panels.current || !handle.current?.getClientRects().length) return;
    const { width, min, max } = measure(panels.current.pane, panels.current.main);
    const clamped = Math.max(min, Math.min(max, Math.round(next)));
    if (clamped !== width) onWidthChange(clamped);
  }
  const label = props['aria-label'] ?? (side === 'left' ? '调整左栏宽度' : '调整右栏宽度');
  return (
    <div
      {...props}
      ref={handle}
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      data-nf-resize={side}
      aria-controls={paneId}
      aria-label={label}
      aria-valuemin={range.min}
      aria-valuemax={range.max}
      aria-valuenow={range.width}
      aria-valuetext={range.width + ' 像素'}
      onPointerDown={(event) => {
        if (!panels.current || event.button !== 0 || !event.isPrimary) return;
        drag.current = {
          x: event.clientX,
          width: panels.current.pane.getBoundingClientRect().width,
          direction: direction(),
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const start = drag.current;
        if (start && event.currentTarget.hasPointerCapture(event.pointerId)) {
          resize(start.width + (event.clientX - start.x) * start.direction);
        }
      }}
      onLostPointerCapture={() => {
        drag.current = null;
      }}
      onKeyDown={(event) => {
        if (!panels.current) return;
        const { width, min, max } = measure(panels.current.pane, panels.current.main);
        const step = (event.shiftKey ? 32 : 8) * direction();
        let next: number;
        switch (event.key) {
          case 'ArrowLeft':
            next = width - step;
            break;
          case 'ArrowRight':
            next = width + step;
            break;
          case 'Home':
            next = min;
            break;
          case 'End':
            next = max;
            break;
          default:
            return;
        }
        event.preventDefault();
        resize(next);
      }}
    />
  );
}

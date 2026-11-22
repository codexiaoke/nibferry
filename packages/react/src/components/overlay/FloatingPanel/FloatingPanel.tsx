'use client';

import { useRef, useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Grip from '@hugeicons/core-free-icons/DragDropVerticalIcon';

export interface FloatingPanelProps extends ComponentPropsWithRef<'section'> {
  open: boolean;
  header?: ReactNode;
  movable?: boolean;
}

const arrowSteps: Record<string, [number, number]> = {
  ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, -8], ArrowDown: [0, 8],
};

export function FloatingPanel({ open, header, movable = false, children, style, ...props }: FloatingPanelProps) {
  const grab = useRef<{ x: number; y: number } | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  function move(panel: HTMLElement, left: number, top: number) {
    const bounds = panel.offsetParent;
    if (!(bounds instanceof HTMLElement)) return;
    const rect = bounds.getBoundingClientRect();
    // Store a fraction of the available travel so resizing the workspace keeps the panel inside.
    function percent(offset: number, travel: number) {
      return travel > 0 ? Math.min(1, Math.max(0, offset / travel)) * 100 : 0;
    }
    setPosition({
      x: percent(left - rect.left - bounds.clientLeft, bounds.clientWidth - panel.offsetWidth),
      y: percent(top - rect.top - bounds.clientTop, bounds.clientHeight - panel.offsetHeight),
    });
  }

  const placed = movable && header != null && position;
  return <section role="region" tabIndex={-1} {...props} hidden={!open || props.hidden} data-nf-floating-panel=""
    style={placed ? { ...style, inset: 'auto', margin: 0, left: placed.x + '%', top: placed.y + '%',
      transform: `translate(${-placed.x}%, ${-placed.y}%)` } : style}>
    {movable && header != null ? <div data-nf-floating-header="" role="group" aria-label="移动浮窗"
      aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown" tabIndex={0}
      onPointerDown={event => {
        if (event.button !== 0 || !event.isPrimary || event.defaultPrevented) return;
        const bar = event.currentTarget;
        const control = (event.target as Element).closest('button, a[href], input, textarea, select, summary, [tabindex], [contenteditable], [role="button"], [role="link"]');
        if (control && control !== bar) return;
        const rect = bar.parentElement!.getBoundingClientRect();
        grab.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        bar.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        if (grab.current && event.currentTarget.hasPointerCapture(event.pointerId)) {
          move(event.currentTarget.parentElement!, event.clientX - grab.current.x, event.clientY - grab.current.y);
        }
      }}
      onLostPointerCapture={() => { grab.current = null; }}
      onKeyDown={event => {
        const step = arrowSteps[event.key];
        if (!step || event.target !== event.currentTarget) return;
        event.preventDefault();
        const panel = event.currentTarget.parentElement!;
        const rect = panel.getBoundingClientRect();
        move(panel, rect.left + step[0], rect.top + step[1]);
      }}>
      <div data-nf-floating-title="">{header}</div>
      <HugeiconsIcon icon={Grip} size={16} aria-hidden="true" />
    </div> : header}
    <div data-nf-floating-body="">{children}</div>
  </section>;
}

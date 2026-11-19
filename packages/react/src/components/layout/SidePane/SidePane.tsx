'use client';

import {
  useCallback,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ComponentPropsWithRef,
} from 'react';
import { PaneResizeHandle } from '../PaneResizeHandle/PaneResizeHandle.js';

export interface SidePaneProps extends ComponentPropsWithRef<'aside'> {
  width?: CSSProperties['width'];
  defaultWidth?: CSSProperties['width'];
  resizable?: boolean;
  collapsed?: boolean;
  onWidthChange?: (width: number) => void;
}

export function SidePane({
  side,
  id,
  width,
  defaultWidth,
  resizable,
  collapsed,
  onWidthChange,
  ref,
  style,
  ...props
}: SidePaneProps & { side: 'left' | 'right' }) {
  const generatedId = useId();
  const paneId = id ?? generatedId;
  const element = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => element.current!, []);
  const collapsible = collapsed !== undefined;
  useLayoutEffect(() => {
    if (!collapsible) return;
    const pane = element.current!;
    // Use the rendered size so flex sizing, percentages and host CSS are respected.
    const measure = () => {
      const width = pane.getBoundingClientRect().width;
      if (width > 0) pane.style.setProperty('--nf-pane-slide-offset', -width + 'px');
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(pane, { box: 'border-box' });
    return () => observer.disconnect();
  }, [collapsible]);
  const [localWidth, setLocalWidth] = useState<number>();
  const controlled = width !== undefined && onWidthChange !== undefined;
  const pixels = controlled ? undefined : localWidth;
  const changeWidth = useCallback(
    (next: number) => {
      if (!controlled) setLocalWidth(next);
      onWidthChange?.(next);
    },
    [controlled, onWidthChange],
  );
  const paneWidth = pixels ?? style?.width ?? width ?? defaultWidth;
  const handle = resizable && !props.hidden && !collapsed && (
    <PaneResizeHandle side={side} paneId={paneId} onWidthChange={changeWidth} />
  );
  return (
    <>
      {side === 'right' && handle}
      <aside
        {...props}
        ref={element}
        id={id ?? (resizable ? paneId : undefined)}
        data-nf-pane={side}
        data-nf-collapsed={collapsed}
        inert={collapsed || props.inert}
        aria-hidden={collapsed || props['aria-hidden']}
        style={{ ...style, width: paneWidth }}
      />
      {side === 'left' && handle}
    </>
  );
}

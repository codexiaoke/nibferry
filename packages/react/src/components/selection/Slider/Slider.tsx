'use client';

import { useRef, useState, type ComponentPropsWithRef } from 'react';

export interface SliderProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max' | 'step' | 'children'> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  marks?: readonly number[];
  onValueChange: (value: number) => void;
}

export function Slider({ min = 0, max = 100, step = 1, value, marks, onValueChange, dir, className, style, hidden,
  onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onLostPointerCapture, ...props }: SliderProps) {
  const rail = useRef<HTMLSpanElement>(null);
  const activePointer = useRef<number | null>(null);
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  function endDrag(pointerId: number) {
    if (activePointer.current !== pointerId) return;
    activePointer.current = null;
    setDragPosition(null);
  }
  function percent(number: number) {
    return max > min ? Math.min(100, Math.max(0, (number - min) / (max - min) * 100)) : 50;
  }
  return <div data-nf-slider="" dir={dir} className={className} style={style} hidden={hidden} data-dragging={dragPosition === null ? undefined : ''}>
    <span data-nf-slider-track="" aria-hidden="true"><span data-nf-slider-stops="" ref={rail}>
      <span data-nf-slider-fill="" style={{ width: (dragPosition ?? percent(value)) + '%' }}>
        <span data-nf-slider-thumb="" />
      </span>
      {marks?.map(mark => <i key={mark} style={{ insetInlineStart: percent(mark) + '%' }} />)}
    </span></span>
    <input {...props} type="range" min={min} max={max} step={step} value={value} dir={dir}
      onPointerDown={event => {
        onPointerDown?.(event);
        if (event.defaultPrevented || !event.isPrimary || event.button !== 0) return;
        activePointer.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        onPointerMove?.(event);
        if (event.defaultPrevented || activePointer.current !== event.pointerId) return;
        const track = rail.current!.getBoundingClientRect();
        if (!track.width || max <= min) return;
        const fraction = Math.max(0, Math.min(1, (event.clientX - track.left) / track.width));
        setDragPosition((getComputedStyle(event.currentTarget).direction === 'rtl' ? 1 - fraction : fraction) * 100);
      }}
      onPointerUp={event => { endDrag(event.pointerId); onPointerUp?.(event); }}
      onPointerCancel={event => { endDrag(event.pointerId); onPointerCancel?.(event); }}
      onLostPointerCapture={event => { endDrag(event.pointerId); onLostPointerCapture?.(event); }}
      onChange={event => onValueChange(event.currentTarget.valueAsNumber)} />
  </div>;
}

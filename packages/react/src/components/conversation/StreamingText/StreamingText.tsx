'use client';

import { useLayoutEffect, useRef, useState, type ComponentPropsWithRef } from 'react';

export type StreamingEffect = 'pixel' | 'pen' | 'plain';

export interface StreamingTextProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  children: string;
  streaming: boolean;
  effect?: StreamingEffect;
}

function PenTip({ text }: { text: string }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const previous = useRef<{ x: number; y: number }>(undefined);
  useLayoutEffect(() => {
    const element = anchor.current!;
    const ink = element.firstElementChild as HTMLElement;
    const x = element.offsetLeft, y = element.offsetTop;
    const last = previous.current;
    previous.current = { x, y };
    // On a line break the pen starts at the new line instead of crossing the paragraph.
    if (!last || last.y !== y || last.x === x) return;
    ink.style.transition = 'none';
    ink.style.translate = (last.x - x) + 'px';
    void ink.offsetWidth;
    ink.style.removeProperty('transition');
    ink.style.translate = '0px';
  }, [text]);
  return <span ref={anchor} data-nf-pen-tip="" aria-hidden="true"><i /></span>;
}

function LiveText({ text, effect }: { text: string; effect: StreamingEffect }) {
  const [frame, setFrame] = useState<{ text: string; starts: number[] }>({ text, starts: [] });
  if (frame.text !== text) {
    // Older chunks share one text node. A correction is rendered immediately.
    setFrame({ text, starts: text.startsWith(frame.text) ? [...frame.starts.slice(-7), frame.text.length] : [] });
  }
  return <>{text.slice(0, frame.starts[0] ?? text.length)}
    {frame.starts.map((start, i) => <span key={start} data-nf-stream-chunk="">{text.slice(start, frame.starts[i + 1])}</span>)}
    {text && effect === 'pen' && <PenTip text={text} />}
  </>;
}

export function StreamingText({ children, streaming, effect = 'pixel', ...props }: StreamingTextProps) {
  return <span {...props} data-nf-stream-text={streaming ? effect : undefined}>
    {streaming ? <LiveText text={children} effect={effect} /> : children}
  </span>;
}

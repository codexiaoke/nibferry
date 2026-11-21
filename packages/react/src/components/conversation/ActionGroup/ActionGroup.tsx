'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Layers from '@hugeicons/core-free-icons/Layers01Icon';
import { ScrollArea } from '../../layout/ScrollArea/ScrollArea.js';
import { ActivityDisclosure, type DisclosureProps } from '../ActivityDisclosure/ActivityDisclosure.js';

export interface ActionGroupProps extends DisclosureProps {
  icon?: ReactNode;
}

export function ActionGroup({ icon = <HugeiconsIcon icon={Layers} size={14} />, label, children, ...props }: ActionGroupProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ above: false, below: false });

  function measure() {
    const el = viewport.current;
    if (!el) return;
    const above = el.scrollTop > 1;
    const below = el.scrollHeight - el.clientHeight - el.scrollTop > 1;
    setEdges(prev => prev.above === above && prev.below === below ? prev : { above, below });
  }
  useLayoutEffect(() => {
    const observer = new ResizeObserver(measure);
    observer.observe(viewport.current!);
    observer.observe(list.current!);
    return () => observer.disconnect();
  }, []);

  const heading = <>{icon && <span data-nf-action-icon="" aria-hidden="true">{icon}</span>}{label}</>;
  return <ActivityDisclosure {...props} data-nf-action-group="" label={heading}>
    <ScrollArea data-nf-action-area="" viewportProps={{
      ref: viewport, 'data-nf-action-scroll': '', onScroll: measure,
      'data-above': edges.above || undefined, 'data-below': edges.below || undefined,
      role: 'group', 'aria-label': typeof label === 'string' ? label : '操作列表',
      tabIndex: edges.above || edges.below ? 0 : undefined,
    }}>
      <div ref={list}>{children}</div>
    </ScrollArea>
  </ActivityDisclosure>;
}

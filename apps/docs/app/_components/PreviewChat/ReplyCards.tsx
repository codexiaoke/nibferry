'use client';

import { Fragment, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Arrow from '@hugeicons/core-free-icons/ArrowRight02Icon';
import { Button, Field, Input, MessageCard, Tag } from 'nibferry';
import './ReplyCards.css';

interface ReplyControls {
  decision?: '已通过' | '已退回';
  steps?: string[];
  selected?: number;
  vote?: 'up' | 'down';
  showRight?: boolean;
}

export function useReplyControls(revision: string) {
  const [byRevision, setByRevision] = useState<Record<string, ReplyControls>>({});
  return { value: byRevision[revision] ?? {}, change: (patch: Partial<ReplyControls>) => {
    setByRevision(all => ({ ...all, [revision]: { ...all[revision], ...patch } }));
  } };
}

type Controls = ReturnType<typeof useReplyControls>;

export function ApprovalCard({ value: { decision }, change }: Controls) {
  const status = useRef<HTMLSpanElement>(null);
  function decide(next: '已通过' | '已退回') {
    change({ decision: next });
    status.current?.focus({ preventScroll: true });
  }
  return <MessageCard title="流程草案审批"
    status={<Tag ref={status} tabIndex={-1} role="status" tone={decision === '已通过' ? 'accent' : 'neutral'}>{decision ?? '待审批'}</Tag>}
    actions={!decision && <>
      <Button variant="primary" onClick={() => decide('已通过')}>通过</Button>
      <Button onClick={() => decide('已退回')}>退回</Button>
    </>}>
    <p>是否同意将「起草、核对、交付」作为这次交接的流程？</p>
  </MessageCard>;
}

export function CanvasCard({ value: { steps = ['起草', '核对', '交付'], selected = 0 }, change }: Controls) {
  return <MessageCard title="交接流程画布">
    <div className="preview-canvas-nodes" role="group" aria-label="流程节点">
      {steps.map((name, index) => <Fragment key={index}>
        {index > 0 && <HugeiconsIcon icon={Arrow} size={16} aria-hidden="true" />}
        <Button aria-pressed={selected === index} onClick={() => change({ selected: index })}>{name || '未命名节点'}</Button>
      </Fragment>)}
    </div>
    <Field label="节点名称"><Input value={steps[selected]} onChange={event => {
      const value = event.target.value;
      change({ steps: steps.map((name, index) => index === selected ? value : name) });
    }} /></Field>
  </MessageCard>;
}

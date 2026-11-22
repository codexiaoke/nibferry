'use client';

import { useEffect, useState } from 'react';
import { Button, Select, StreamingText, type StreamingEffect } from 'nibferry';
import './ReplyMotionPreview.css';

export const replyEffects = [
  { value: 'pixel', label: '像素显影' }, { value: 'pen', label: '流光笔尖' }, { value: 'plain', label: '只看文字' },
] as const;
const sentence = '起草时整理待交接事项，核对后把最终版本交给接手人。';

export function ReplyMotionPreview({ value, onValueChange }: { value?: StreamingEffect; onValueChange?: (value: StreamingEffect) => void }) {
  const [selection, setSelection] = useState<StreamingEffect>('pixel');
  const [count, setCount] = useState(sentence.length);
  const effect = value ?? selection;
  const active = count < sentence.length;
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setCount(n => Math.min(n + 1, sentence.length)), 80);
    return () => clearInterval(timer);
  }, [active]);
  return <div className="preview-reply-motion">
    <div><Select label="回复动效" value={effect} options={replyEffects} onValueChange={next => {
      const selected = replyEffects.find(option => option.value === next)!.value;
      setSelection(selected); onValueChange?.(selected); setCount(0);
    }} /><Button variant="ghost" onClick={() => setCount(0)}>重播示例</Button></div>
    <p><StreamingText streaming={active} effect={effect}>{sentence.slice(0, count)}</StreamingText></p>
  </div>;
}

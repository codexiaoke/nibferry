'use client';

import { useState } from 'react';
import { Disclosure, Field, Inline, Progress, Slider, Stack, Switch, Tabs, Textarea } from 'nibferry';

export function ContentControlsDemo() {
  const [draft, setDraft] = useState('保留来源链接，整理本周的工作区更新。');
  return <div className="component-demo"><Stack>
    <Tabs label="文档视图" items={[
      { value: 'edit', label: '编辑', content: <Field label="文档正文">
        <Textarea value={draft} onChange={event => setDraft(event.target.value)} />
      </Field> },
      { value: 'preview', label: '预览', content: <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
        {draft || '暂无正文'}
      </p> },
    ]} />
    <Disclosure label="修订备注">
      <Textarea aria-label="修订备注内容" rows={2} placeholder="记录这次修改的原因" />
    </Disclosure>
  </Stack></div>;
}

export function RangeProgressDemo() {
  const [count, setCount] = useState(2);
  const [unknown, setUnknown] = useState(false);
  const total = 5;
  const amount = count + ' / ' + total + ' 份';
  return <div className="component-demo"><Stack>
    <Field label="已处理文件">
      <Slider max={total} marks={[0, 1, 2, 3, 4, 5]} value={count} aria-valuetext={amount}
        disabled={unknown} onValueChange={setCount} />
    </Field>
    <Inline style={{ justifyContent: 'space-between' }}>
      <span>导入进度</span><span>{unknown ? '处理中' : amount}</span>
    </Inline>
    <Progress label="导入进度" max={total} value={unknown ? undefined : count} />
    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--nf-space-sm)', width: 'fit-content' }}>
      <Switch checked={unknown} onChange={event => setUnknown(event.target.checked)} />进度未知
    </label>
  </Stack></div>;
}

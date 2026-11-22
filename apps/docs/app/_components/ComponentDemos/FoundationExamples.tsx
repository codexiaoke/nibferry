'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import List from '@hugeicons/core-free-icons/LeftToRightListDashIcon';
import Grid from '@hugeicons/core-free-icons/GridViewIcon';
import { Alert, Avatar, Button, Checkbox, EmptyState, Field, Input, RadioGroup, Select,
  Switch, Tag, Toast, Tooltip } from 'nibferry';

export function FieldsDemo() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  return <div className="component-demo">
    <form className="example-foundation" noValidate onSubmit={event => {
      event.preventDefault();
      if (value.trim()) setName(value.trim());
      else setError('请输入项目名称');
    }}>
      <Field label="项目名称" error={error}><Input required value={value}
        onChange={event => { setValue(event.target.value); setError(''); setName(''); }} /></Field>
      <Button type="submit" variant="primary">保存</Button>
      {name && <output>已保存「{name}」</output>}
    </form>
  </div>;
}

const views = [{ value: 'list', label: '列表', icon: List }, { value: 'grid', label: '网格', icon: Grid }];

export function ChoicesDemo() {
  const [view, setView] = useState('list');
  const [sort, setSort] = useState('recent');
  return <div className="component-demo"><div className="example-foundation">
    <RadioGroup label="显示方式" options={views} value={view} onValueChange={setView} />
    <RadioGroup label="卡片选择" variant="cards" value={view} onValueChange={setView}
      options={views.map(option => ({ ...option, visual: <HugeiconsIcon icon={option.icon} size={20} /> }))} />
    <Select label="排序" options={[{ value: 'recent', label: '最近更新' }, { value: 'name', label: '按名称' }]}
      value={sort} onValueChange={setSort} />
    <label><Checkbox defaultChecked />显示文件大小</label>
    <label><Switch />显示隐藏文件</label>
  </div></div>;
}

export function IdentityDemo() {
  return <div className="component-demo"><div className="example-identity">
    <Avatar name="Xiaoke" /><span>Xiaoke</span><Tag tone="accent">所有者</Tag>
  </div></div>;
}

export function FeedbackDemo() {
  const [restored, setRestored] = useState(false);
  const [message, setMessage] = useState('');
  return <div className="component-demo"><div className="example-foundation">
    {restored
      ? <EmptyState title="没有待同步的文件" action={<Button onClick={() => { setRestored(false); setMessage(''); }}>重置示例</Button>} />
      : <Alert title="文件同步已中断" tone="danger" action={<Tooltip content="重新同步文件">
        <Button onClick={() => { setRestored(true); setMessage('同步完成'); }}>重试</Button>
      </Tooltip>} />}
    <Toast message={message} onDismiss={() => setMessage('')} />
  </div></div>;
}

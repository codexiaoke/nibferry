'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertDialog, AttachmentItem, AttachmentList, Button, Combobox, Field, Inline, NumberField,
  Pagination, Popover, Skeleton, Spinner, Stack, Table } from 'nibferry';

const models = [
  { value: 'default', label: '工作区默认' },
  { value: 'astra', label: 'GPT-6.2 Astra', detail: 'OpenAI' },
  { value: 'sol', label: 'GPT-6.2 Sol', detail: 'OpenAI' },
  { value: 'reasoner', label: 'DeepSeek Reasoner', detail: 'DeepSeek' },
];

export function SourcePickerDemo() {
  const [model, setModel] = useState('default');
  const current = models.find(option => option.value === model)!;
  return <div className="component-demo"><Stack>
    <Field label="回复模型"><Combobox label="回复模型" value={model} onValueChange={setModel}
      placeholder="搜索模型或提供商" options={models} /></Field>
    <Inline><Popover label="模型详情" trigger={<Button>模型详情</Button>}>
      <Stack gap="sm"><strong>{current.label}</strong><span>{current.detail ?? '随工作区设置更新'}</span></Stack>
    </Popover></Inline>
  </Stack></div>;
}

const files = [
  { name: '交接清单.md', detail: '12 KB' },
  { name: '工作区草图.pdf', detail: '320 KB' },
];
export function AttachmentsDemo() {
  const [attachments, setAttachments] = useState(files);
  const [pending, setPending] = useState('');
  const [open, setOpen] = useState(false);
  const list = useRef<HTMLUListElement>(null);
  const restore = useRef<HTMLButtonElement>(null);
  return <div className="component-demo"><Stack>
    <AttachmentList aria-label="消息附件" ref={list}>
      {attachments.map(file => <AttachmentItem key={file.name} {...file} onRemove={() => {
        setPending(file.name); setOpen(true);
      }} />)}
    </AttachmentList>
    <Inline><Button ref={restore} disabled={attachments.length === files.length}
      onClick={() => setAttachments(files)}>恢复示例附件</Button></Inline>
    <AlertDialog open={open} onOpenChange={setOpen} title="移除附件？" confirmLabel="移除附件" destructive
      description={'「' + pending + '」将从这条消息中移除，原文件仍保留。'}
      onConfirm={() => {
        setAttachments(items => items.filter(item => item.name !== pending));
        requestAnimationFrame(() => (list.current?.querySelector('button') ?? restore.current)?.focus());
      }} />
  </Stack></div>;
}

const resources = [
  ['交接清单.md', '文档'], ['工作区草图.pdf', '图纸'], ['交互规范.md', '文档'],
  ['组件目录.csv', '表格'], ['主题配置.json', '配置'],
];

export function RecordsDemo() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState<number | null>(2);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [loading]);
  const perPage = Math.max(1, Math.min(resources.length, Math.floor(size ?? 1)));
  const rows = resources.slice((page - 1) * perPage, page * perPage);
  return <div className="component-demo"><Stack>
    <Inline wrap align="end" style={{ justifyContent: 'space-between' }}>
      <Field label="每页条数" style={{ width: 140 }}>
        <NumberField min={1} max={resources.length} value={size}
          onValueChange={next => { setSize(next); setPage(1); }} />
      </Field>
      <Button disabled={loading} onClick={() => setLoading(true)}>
        {loading && <Spinner />}{loading ? '正在刷新' : '刷新资料'}
      </Button>
    </Inline>
    <Table aria-label="工作区资料" aria-busy={loading}>
      <colgroup><col style={{ width: '70%' }} /><col /></colgroup>
      <thead><tr><th scope="col">资料名称</th><th scope="col">类型</th></tr></thead>
      <tbody>{rows.map(([name, type]) => <tr key={name}>
        <td>{loading ? <Skeleton style={{ width: '72%' }} /> : name}</td>
        <td>{loading ? <Skeleton style={{ width: '2em' }} /> : type}</td>
      </tr>)}</tbody>
    </Table>
    <Pagination page={page} pageCount={Math.ceil(resources.length / perPage)} onPageChange={setPage} />
  </Stack></div>;
}

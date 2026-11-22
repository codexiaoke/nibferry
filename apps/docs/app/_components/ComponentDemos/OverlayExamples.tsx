'use client';

import { useId, useState } from 'react';
import {
  Button, Field, Input, ContextMenu, Dialog, FloatingPanel, FloatingPanelTrigger, MenuContent, MenuItem,
  PaneButton, PaneHeader, SearchDialog,
} from 'nibferry';
import File from '@hugeicons/core-free-icons/File01Icon';
import Search from '@hugeicons/core-free-icons/Search01Icon';

export function ContextMenuDemo() {
  const [pinned, setPinned] = useState(false);
  return (
    <div className="component-demo">
      <ContextMenu content={<MenuContent aria-label="文档操作">
        <MenuItem onSelect={() => setPinned(!pinned)}>{pinned ? '取消置顶' : '置顶文档'}</MenuItem>
      </MenuContent>}>
        <div className="example-context" tabIndex={0} aria-label="组件指南，右键打开文档操作">
          <strong>{pinned ? '组件指南（已置顶）' : '组件指南'}</strong>
          <small>右键或按 Shift + F10 打开菜单</small>
        </div>
      </ContextMenu>
    </div>
  );
}

const articles = ['使用指南', '组件目录', '主题配置'];

export function SearchDemo() {
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState('');
  return (
    <div className="component-demo">
      <PaneButton className="example-button" icon={Search} text="搜索文档示例"
        aria-haspopup="dialog" onClick={() => setOpen(true)} />
      {selection && <small role="status">已选择《{selection}》</small>}
      <SearchDialog label="选择示例文档" open={open} onOpenChange={setOpen}
        groups={[{ id: 'docs', label: '文档', items: articles.map(label => ({
          id: label, label, icon: File, onSelect: () => setSelection(label),
        })) }]} />
    </div>
  );
}

export function DialogDemo() {
  const [name, setName] = useState('组件指南');
  const [draft, setDraft] = useState(name);
  const [open, setOpen] = useState(false);
  return (
    <div className="component-demo">
      <div className="example-document">
        <span>{name}</span>
        <button type="button" className="example-button" aria-haspopup="dialog"
          onClick={() => { setDraft(name); setOpen(true); }}>重命名</button>
      </div>
      <Dialog aria-label="重命名文档" open={open} onOpenChange={setOpen}>
        <form className="example-rename" onSubmit={event => {
          event.preventDefault();
          if (draft.trim()) { setName(draft.trim()); setOpen(false); }
        }}>
          <Field label="文档名称"><Input value={draft} onChange={e => setDraft(e.target.value)} /></Field>
          <footer>
            <Button onClick={() => setOpen(false)}>取消</Button>
            <Button type="submit" variant="primary" disabled={!draft.trim()}>保存</Button>
          </footer>
        </form>
      </Dialog>
    </div>
  );
}

export function FloatingDemo() {
  const [open, setOpen] = useState(true);
  const [reply, setReply] = useState<'empty' | 'unread' | 'read'>('empty');
  const id = useId();
  return (
    <div className="component-demo example-float">
      {!open && <button type="button" className="example-button" disabled={reply === 'unread'}
        onClick={() => setReply('unread')}>模拟收到回复</button>}
      <FloatingPanelTrigger paneId={id} expanded={open} unread={reply === 'unread'} onClick={() => {
        if (!open && reply === 'unread') setReply('read');
        setOpen(!open);
      }} />
      <FloatingPanel movable id={id} open={open} aria-label="文档助手" header={<PaneHeader>文档助手</PaneHeader>}>
        {reply === 'empty' ? '可以在阅读文档时，把问题记在这里。' : '已找到你要的组件示例。'}
      </FloatingPanel>
    </div>
  );
}

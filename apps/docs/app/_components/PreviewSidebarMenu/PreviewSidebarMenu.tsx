'use client';

import { useState } from 'react';
import Search from '@hugeicons/core-free-icons/Search01Icon';
import Compose from '@hugeicons/core-free-icons/PencilEdit02Icon';
import Inbox from '@hugeicons/core-free-icons/InboxIcon';
import Bell from '@hugeicons/core-free-icons/Notification01Icon';
import Folder from '@hugeicons/core-free-icons/Folder01Icon';
import ChatIcon from '@hugeicons/core-free-icons/BubbleChatIcon';
import File from '@hugeicons/core-free-icons/File01Icon';
import TextIcon from '@hugeicons/core-free-icons/LeftToRightListBulletIcon';
import { CountBadge, DropdownMenu, MenuContent, MenuItem, MenuTrigger, PaneButton, SearchDialog, SidebarMenu, type SearchDialogGroup } from '@nibferry/react';
import { version } from '../../../../../packages/react/package.json';
import type { SearchEntry } from '../../../lib/docs';
import './PreviewSidebarMenu.css';

const shortcuts = [
  {
    label: '待办', icon: Inbox,
    items: [
      { chatId: 'handoff', label: '整理项目交接清单' },
      { chatId: 'workspace', label: '调整工作区布局' },
    ],
  },
  {
    label: '消息通知', icon: Bell,
    items: [
      { chatId: 'analysis', label: '桌面端分析已更新' },
      { chatId: 'progress', label: '开发进度已更新' },
    ],
  },
];

interface Chat { id: string; title: string; project: string }
export interface PreviewSearchProps {
  searchEntries: SearchEntry[];
  onOpenPage: (page: { title: string; path: string }) => void;
}
interface Props extends PreviewSearchProps {
  chats: Chat[];
  onNewChat: () => void;
  onOpenChat: (id: string) => void;
}

export default function PreviewSidebarMenu({ chats, onNewChat, onOpenChat, searchEntries, onOpenPage }: Props) {
  const [searching, setSearching] = useState(false);
  const available = new Set(chats.map(chat => chat.id));
  function searchGroups(): SearchDialogGroup[] {
    const documents = searchEntries.filter(entry => !entry.section);
    const resource = (entry: SearchEntry) => {
      const [path, anchor] = entry.url.split('#');
      return {
        id: entry.url, label: entry.title, detail: entry.section ? entry.location : undefined,
        icon: entry.section ? TextIcon : File, keywords: entry.text,
        onSelect: () => onOpenPage({ title: entry.title, path: path.replace(/\/?$/, '/') + (anchor ? '#' + anchor : '') }),
      };
    };
    return [
      { id: 'actions', label: '快捷操作', filterLabel: '操作', items: [
        { id: 'new-chat', label: '新聊天', icon: Compose, shortcutKey: 'N', onSelect: onNewChat },
        { id: 'open-library', label: '打开资料空间', icon: Folder, shortcutKey: 'O',
          onSelect: () => onOpenPage({ title: '文档概览', path: '/docs/' }) },
      ] },
      { id: 'chats', label: '聊天', previewLimit: 5, items: chats.map(chat => ({
        id: chat.id, label: chat.title, detail: chat.project, icon: ChatIcon, onSelect: () => onOpenChat(chat.id),
      })) },
      { id: 'resources', label: '资料空间', previewLimit: 2, items: documents.map(resource) },
      { id: 'files', label: '文件', previewLimit: 2, items: documents.map(entry => {
        const name = (entry.url.replace(/^\/docs\/?/, '').replace(/\/$/, '') || 'index') + '.txt';
        const path = '/markdown/' + name;
        return { id: path, label: name, detail: entry.title, icon: File, onSelect: () => onOpenPage({ title: name, path }) };
      }) },
      { id: 'text', label: '文本', previewLimit: 2, items: searchEntries.filter(entry => entry.section).map(resource) },
    ];
  }

  return (
    <SidebarMenu label="工作区菜单" className="preview-sidebar-shortcuts"
      heading={<><strong>Nibferry</strong><small>{version}</small></>}
      actions={<PaneButton icon={Search} aria-label="搜索项目和会话" title="搜索项目和会话"
        aria-haspopup="dialog" aria-expanded={searching} paneId="preview-sidebar-search" onClick={event => {
          event.currentTarget.focus();
          setSearching(true);
        }} />}>
      <PaneButton icon={Compose} text={<span>新聊天</span>} onClick={onNewChat} />
      {shortcuts.map(({ label, icon, items }) => {
        const visible = items.filter(item => available.has(item.chatId));
        return <DropdownMenu key={label} modal={false}>
          <MenuTrigger asChild>
            <PaneButton icon={icon} text={<><span>{label}</span><CountBadge count={visible.length} /></>} />
          </MenuTrigger>
          <MenuContent side="right" className="preview-conversation-menu" aria-label={label}>
            {visible.map(item => <MenuItem key={item.chatId}
              onSelect={() => onOpenChat(item.chatId)}>{item.label}</MenuItem>)}
            {!visible.length && <MenuItem disabled>{label === '待办' ? '暂无待办' : '暂无通知'}</MenuItem>}
          </MenuContent>
        </DropdownMenu>;
      })}
      <SearchDialog id="preview-sidebar-search" className="preview-workspace-search" label="搜索 Nibferry"
        open={searching} onOpenChange={setSearching} groups={searching ? searchGroups() : []} />
    </SidebarMenu>
  );
}

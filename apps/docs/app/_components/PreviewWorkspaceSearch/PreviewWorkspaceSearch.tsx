'use client';

import Compose from '@hugeicons/core-free-icons/PencilEdit02Icon';
import Folder from '@hugeicons/core-free-icons/Folder01Icon';
import ChatIcon from '@hugeicons/core-free-icons/BubbleChatIcon';
import File from '@hugeicons/core-free-icons/File01Icon';
import TextIcon from '@hugeicons/core-free-icons/LeftToRightListBulletIcon';
import { SearchDialog, type SearchDialogGroup } from 'nibferry';
import type { SearchEntry } from '../../../lib/docs';
import type { PreviewChat } from '../PreviewSidebarMenu/PreviewSidebarMenu';
import './PreviewWorkspaceSearch.css';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chats: PreviewChat[];
  onNewChat: () => void;
  onOpenChat: (id: string) => void;
  searchEntries: SearchEntry[];
  onOpenPage: (page: { title: string; path: string }) => void;
}

export default function PreviewWorkspaceSearch({ open, onOpenChange, chats, onNewChat, onOpenChat, searchEntries, onOpenPage }: Props) {
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
          onSelect: () => onOpenPage({ title: '使用指南', path: '/docs/' }) },
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

  return <SearchDialog id="preview-sidebar-search" className="preview-workspace-search" label="搜索 Nibferry"
    open={open} onOpenChange={onOpenChange} groups={open ? searchGroups() : []} />;
}

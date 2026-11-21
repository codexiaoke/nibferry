'use client';

import { useRef, useState, type ComponentProps, type MouseEvent } from 'react';
import * as Popover from '@radix-ui/react-popover';
import Search from '@hugeicons/core-free-icons/Search01Icon';
import Compose from '@hugeicons/core-free-icons/PencilEdit02Icon';
import Inbox from '@hugeicons/core-free-icons/InboxIcon';
import Bell from '@hugeicons/core-free-icons/Notification01Icon';
import ChatIcon from '@hugeicons/core-free-icons/BubbleChatIcon';
import {
  CountBadge, DropdownMenu, MenuContent, MenuItem, MenuTrigger,
  NavigationRail, NavigationRailItem, PaneButton, SidebarMenu,
} from '@nibferry/react';
import { version } from '../../../../../packages/react/package.json';
import PreviewConversationList from '../PreviewConversationList/PreviewConversationList';
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

export interface PreviewChat { id: string; title: string; projectId: string; project: string }

interface Props {
  collapsedProjects?: ComponentProps<typeof PreviewConversationList>;
  chats: PreviewChat[];
  searching: boolean;
  onSearch: () => void;
  onNewChat: () => void;
  onOpenChat: (id: string) => void;
}

export default function PreviewSidebarMenu({ collapsedProjects, chats, searching, onSearch, onNewChat, onOpenChat }: Props) {
  const [projectsOpen, setProjectsOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const searchProps = {
    icon: Search, paneId: 'preview-sidebar-search', 'aria-haspopup': 'dialog' as const, 'aria-expanded': searching,
    onClick: (event: MouseEvent<HTMLButtonElement>) => { event.currentTarget.focus(); onSearch(); },
  };
  const available = new Set(chats.map(chat => chat.id));
  const menus = shortcuts.map(({ label, icon, items }) => {
    const visible = items.filter(item => available.has(item.chatId));
    const badge = <CountBadge count={visible.length} />;
    return <DropdownMenu key={label} modal={false}>
      <MenuTrigger asChild>
        {collapsedProjects
          ? <NavigationRailItem label={label} icon={icon} badge={badge} aria-label={label + '，' + visible.length + ' 条'} />
          : <PaneButton icon={icon} text={<span>{label}</span>} badge={badge} />}
      </MenuTrigger>
      <MenuContent side="right" className="preview-conversation-menu" aria-label={label}>
        {visible.map(item => <MenuItem key={item.chatId}
          onSelect={() => onOpenChat(item.chatId)}>{item.label}</MenuItem>)}
        {!visible.length && <MenuItem disabled>{label === '待办' ? '暂无待办' : '暂无通知'}</MenuItem>}
      </MenuContent>
    </DropdownMenu>;
  });

  if (collapsedProjects) {
    return <NavigationRail label="收起的工作区菜单" className="workspace-preview-rail">
      <NavigationRailItem {...searchProps} label="搜索项目和会话" />
      {menus}
      <Popover.Root open={projectsOpen} onOpenChange={setProjectsOpen}>
        <Popover.Trigger asChild><NavigationRailItem ref={trigger} icon={ChatIcon} label="会话" /></Popover.Trigger>
        <Popover.Portal container={trigger.current?.closest('.workspace-preview')}>
          <Popover.Content side="right" align="start" sideOffset={8} collisionPadding={8}
            collisionBoundary={trigger.current?.closest('[data-nf-workspace]')}
            aria-label="会话" className="preview-sidebar-projects"
            onEscapeKeyDown={event => {
              // Radix handles Escape before the nested native dialog and project popover.
              const target = event.target as HTMLElement;
              const editor = target.closest('dialog[open]');
              if (editor instanceof HTMLDialogElement) {
                event.preventDefault();
                editor.requestClose();
              } else {
                const details = target.closest('.preview-sidebar-projects')?.querySelector<HTMLElement>(':popover-open');
                if (details) { event.preventDefault(); details.hidePopover(); }
              }
            }}>
            <PreviewConversationList {...collapsedProjects}
              onSelect={id => { collapsedProjects.onSelect(id); setProjectsOpen(false); }}
              onNewChat={project => { collapsedProjects.onNewChat(project); setProjectsOpen(false); }} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </NavigationRail>;
  }
  return <SidebarMenu label="工作区菜单" className="preview-sidebar-shortcuts"
    heading={<><strong>Nibferry</strong><small>{version}</small></>}
    actions={<PaneButton {...searchProps} aria-label="搜索项目和会话" title="搜索项目和会话" />}>
    <PaneButton icon={Compose} text={<span>新聊天</span>} onClick={onNewChat} />
    {menus}
  </SidebarMenu>;
}

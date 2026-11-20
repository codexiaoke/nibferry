'use client';

import { useRef, useState } from 'react';
import More from '@hugeicons/core-free-icons/MoreHorizontalIcon';
import Compose from '@hugeicons/core-free-icons/PencilEdit02Icon';
import Settings from '@hugeicons/core-free-icons/Settings01Icon';
import Pin from '@hugeicons/core-free-icons/PinIcon';
import PinOff from '@hugeicons/core-free-icons/PinOffIcon';
import Archive from '@hugeicons/core-free-icons/ArchiveIcon';
import {
  ConversationGroup, ConversationItem, ConversationList, Dialog, DropdownMenu, MenuContent, MenuItem,
  MenuTrigger, PaneButton, ProjectInfo,
} from '@nibferry/react';
import PreviewSidebarMenu, { type PreviewSearchProps } from '../PreviewSidebarMenu/PreviewSidebarMenu';
import './PreviewConversationList.css';

interface Project {
  id: string;
  name: string;
  repository?: string;
  directory?: string;
  pinned: boolean;
  conversations: { id: string; title: string; active?: boolean; pinned?: boolean; archived?: boolean }[];
}

export const initialProjects: Project[] = [
  { id: 'nibferry', name: 'Nibferry', pinned: false, repository: 'codexiaoke/nibferry',
    directory: '~/code/project/Nibferry', conversations: [
      { id: 'handoff', title: '梳理 Nibferry 项目交接', active: true },
      { id: 'workspace', title: '讨论工作区布局' },
      { id: 'summary', title: '设计摘要面板' },
    ] },
  { id: 'euos', name: 'EU OS', pinned: false, repository: 'zh_genie/eu-os-desktop',
    directory: '~/code/com/euos/eu-os-desktop', conversations: [
      { id: 'workflow', title: '查看技能与流程图' },
      { id: 'desktop', title: '启动桌面端' },
      { id: 'analysis', title: '分析 EU-OS 桌面端项目', active: true },
      { id: 'containers', title: '排查服务容器未启动' },
    ] },
  { id: 'studypilo', name: 'StudyPilo', pinned: false, directory: '~/code/project/studypilo-next',
    conversations: [{ id: 'progress', title: '查看开发进度' }] },
];

interface Props extends PreviewSearchProps {
  projects: Project[];
  onProjectChange: (project: Project) => void;
  currentId: string;
  onSelect: (id: string) => void;
}

export default function PreviewConversationList({ projects, onProjectChange, currentId, onSelect, searchEntries, onOpenPage }: Props) {
  const [expanded, setExpanded] = useState([initialProjects[0].id]);
  const [editing, setEditing] = useState<Project | null>(null);
  const editor = useRef<HTMLDialogElement>(null);

  function closeEditor() {
    editor.current?.close();
    if (editing) document.getElementById('preview-project-actions-' + editing.id)?.focus();
    setEditing(null);
  }

  function openChat(project: Project, chatId: string) {
    setExpanded(open => open.includes(project.id) ? open : [...open, project.id]);
    onSelect(chatId);
  }

  function newChat(project: Project) {
    const conversation = { id: crypto.randomUUID(), title: '新聊天' };
    onProjectChange({ ...project, conversations: [conversation, ...project.conversations] });
    openChat(project, conversation.id);
  }

  const projectForChat = (chatId: string) => projects.find(project => project.conversations.some(chat => chat.id === chatId))!;
  return <>
    <PreviewSidebarMenu
      searchEntries={searchEntries} onOpenPage={onOpenPage}
      chats={projects.flatMap(project => project.conversations.filter(chat => !chat.archived)
        .map(chat => ({ id: chat.id, title: chat.title, project: project.name })))}
      onNewChat={() => newChat(projectForChat(currentId))}
      onOpenChat={id => openChat(projectForChat(id), id)} />
    <ConversationList label="项目">
      {[...projects].sort((a, b) => Number(b.pinned) - Number(a.pinned)).map(project => {
        const { id, name, pinned } = project;
        const conversations = project.conversations.filter(chat => !chat.archived)
          .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
        function updateChat(chatId: string, changes: { pinned?: boolean; archived?: boolean }) {
          onProjectChange({ ...project, conversations: project.conversations.map(chat =>
            chat.id === chatId ? { ...chat, ...changes } : chat) });
        }
        const pin = (next: boolean) => onProjectChange({ ...project, pinned: next });
        const projectCommands = <>
          <MenuItem icon={Pin} onSelect={() => pin(!pinned)}>{pinned ? '取消置顶项目' : '置顶项目'}</MenuItem>
          <MenuItem icon={Settings} onSelect={() => setEditing(project)}>编辑项目</MenuItem>
        </>;
        return (
          <ConversationGroup key={id} label={name} expanded={expanded.includes(id)}
            onToggle={() => setExpanded(open => open.includes(id) ? open.filter(key => key !== id) : [...open, id])}
            contextMenuContent={<MenuContent className="preview-conversation-menu" aria-label="项目操作">{projectCommands}</MenuContent>}
            details={<ProjectInfo name={name} repository={project.repository} directory={project.directory}
              chatCount={conversations.length} activeChatCount={conversations.filter(chat => chat.active).length}
              pinned={pinned} onPinnedChange={pin} onEdit={() => setEditing(project)} />}
            actions={<>
              <DropdownMenu modal={false}>
                <MenuTrigger asChild><PaneButton id={'preview-project-actions-' + id} icon={More} aria-label="项目操作" /></MenuTrigger>
                <MenuContent className="preview-conversation-menu" side="right"
                  onCloseAutoFocus={event => {
                    // A dialog or another row may already have taken focus.
                    if (document.activeElement !== document.body) event.preventDefault();
                  }}>
                  {projectCommands}
                </MenuContent>
              </DropdownMenu>
              <PaneButton icon={Compose} aria-label="新建聊天" onClick={() => newChat(project)} />
            </>}>
            {conversations.map((chat, index) => {
              const pinIcon = chat.pinned ? PinOff : Pin;
              const pinLabel = chat.pinned ? '取消置顶聊天' : '置顶聊天';
              const togglePin = () => updateChat(chat.id, { pinned: !chat.pinned });
              function archive() {
                const neighbor = conversations[index + 1] ?? conversations[index - 1];
                document.getElementById(neighbor ? 'preview-chat-' + neighbor.id : 'preview-project-actions-' + id)?.focus();
                updateChat(chat.id, { archived: true });
              }
              return (
                <ConversationItem key={chat.id} id={'preview-chat-' + chat.id}
                  current={currentId === chat.id} onClick={() => onSelect(chat.id)}
                  contextMenuContent={<MenuContent className="preview-conversation-menu" aria-label="会话操作">
                    <MenuItem icon={pinIcon} onSelect={togglePin}>{pinLabel}</MenuItem>
                    <MenuItem icon={Archive} onSelect={archive}>归档聊天</MenuItem>
                  </MenuContent>}
                  actions={<>
                    <PaneButton icon={pinIcon} aria-pressed={!!chat.pinned}
                      aria-label={pinLabel} title={pinLabel} onClick={togglePin} />
                    <PaneButton icon={Archive} aria-label="归档聊天" title="归档聊天" onClick={archive} />
                  </>}>
                  {chat.title}
                </ConversationItem>
              );
            })}
          </ConversationGroup>
        );
      })}
      {editing && (
        <Dialog open onOpenChange={closeEditor} className="preview-project-editor" ref={editor} aria-label="编辑项目">
          <form onSubmit={event => {
            event.preventDefault();
            const input = event.currentTarget.elements.namedItem('name') as HTMLInputElement;
            const name = input.value.trim();
            if (!name) { input.focus(); return; }
            onProjectChange({ ...editing, name });
            closeEditor();
          }}>
            <label>项目名称<input name="name" defaultValue={editing.name} autoFocus required pattern=".*\S.*" /></label>
            <footer>
              <button type="button" onClick={closeEditor}>取消</button>
              <button type="submit">保存</button>
            </footer>
          </form>
        </Dialog>
      )}
    </ConversationList>
  </>;
}

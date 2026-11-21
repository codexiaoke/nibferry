import type { ReactElement } from 'react';
import Edit from '@hugeicons/core-free-icons/PencilEdit01Icon';
import Pin from '@hugeicons/core-free-icons/PinIcon';
import Copy from '@hugeicons/core-free-icons/Copy01Icon';
import Chat from '@hugeicons/core-free-icons/BubbleChatAddIcon';
import Branch from '@hugeicons/core-free-icons/GitBranchIcon';
import Clock from '@hugeicons/core-free-icons/Clock01Icon';
import Move from '@hugeicons/core-free-icons/ArrowRight02Icon';
import Window from '@hugeicons/core-free-icons/WindowsNewIcon';
import Open from '@hugeicons/core-free-icons/ArrowUpRight01Icon';
import Archive from '@hugeicons/core-free-icons/Archive01Icon';
import Trash from '@hugeicons/core-free-icons/Delete02Icon';
import Project from '@hugeicons/core-free-icons/FolderTransferIcon';
import Remove from '@hugeicons/core-free-icons/FolderRemoveIcon';
import List from '@hugeicons/core-free-icons/LeftToRightListBulletIcon';
import {
  DropdownMenu, MenuContent, MenuGroup, MenuItem, MenuSeparator,
  MenuSub, MenuSubContent, MenuSubTrigger, MenuTrigger,
} from 'nibferry';
import './PreviewConversationMenu.css';

interface Props {
  children: ReactElement;
  project: string;
  onCopyLink: () => void;
  onCopyTitle: () => void;
  summaryId: string;
  summaryLabel: string;
  onToggleSummary: () => void;
}

export default function PreviewConversationMenu({
  children, project, onCopyLink, onCopyTitle, summaryId, summaryLabel, onToggleSummary,
}: Props) {
  return (
    <DropdownMenu modal={false}>
      <MenuTrigger asChild>{children}</MenuTrigger>
      <MenuContent className="preview-conversation-menu">
        <MenuGroup>
          <MenuItem icon={Edit} shortcut="⌥⌘R">重命名</MenuItem>
          <MenuItem icon={Pin} shortcut="⌥⌘P">置顶聊天</MenuItem>
          <MenuSub>
            <MenuSubTrigger icon={Copy}>复制</MenuSubTrigger>
            <MenuSubContent className="preview-conversation-menu">
              <MenuItem onSelect={onCopyLink}>复制预览链接</MenuItem>
              <MenuItem onSelect={onCopyTitle}>复制会话标题</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuItem icon={Chat} shortcut="⌥⌘S">新建侧边聊天</MenuItem>
          <MenuSub>
            <MenuSubTrigger icon={Branch}>分叉</MenuSubTrigger>
            <MenuSubContent className="preview-conversation-menu">
              <MenuItem>在新聊天中分叉</MenuItem>
              <MenuItem>在侧边聊天中分叉</MenuItem>
            </MenuSubContent>
          </MenuSub>
          <MenuItem icon={Clock}>添加计划任务…</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuItem icon={Move}>移至右侧面板</MenuItem>
          <MenuItem icon={Window}>在新窗口中打开</MenuItem>
          <MenuSub>
            <MenuSubTrigger icon={Open}>打开方式</MenuSubTrigger>
            <MenuSubContent className="preview-conversation-menu">
              <MenuItem>并排显示</MenuItem>
              <MenuItem>全屏显示</MenuItem>
            </MenuSubContent>
          </MenuSub>
          <MenuItem icon={List} aria-controls={summaryId} onSelect={onToggleSummary}>{summaryLabel}</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuItem icon={Archive} shortcut="⇧⌘A">归档</MenuItem>
          <MenuItem icon={Trash} danger>删除</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup label={project}>
          <MenuSub>
            <MenuSubTrigger icon={Project}>移至项目</MenuSubTrigger>
            <MenuSubContent className="preview-conversation-menu">
              <MenuItem disabled>{project}（当前项目）</MenuItem>
              <MenuItem>其他项目…</MenuItem>
            </MenuSubContent>
          </MenuSub>
          <MenuItem icon={Remove}>从“{project}”中移除</MenuItem>
        </MenuGroup>
      </MenuContent>
    </DropdownMenu>
  );
}

import Folder from '@hugeicons/core-free-icons/Folder01Icon';
import Chat from '@hugeicons/core-free-icons/BubbleChatIcon';
import Git from '@hugeicons/core-free-icons/GitBranchIcon';
import Settings from '@hugeicons/core-free-icons/Settings01Icon';
import Pin from '@hugeicons/core-free-icons/PinIcon';
import { PaneButton } from '../../layout/PaneButton/PaneButton.js';
import { SummaryItem } from '../../summary/SummaryItem/SummaryItem.js';

export interface ProjectInfoProps {
  name: string;
  chatCount: number;
  activeChatCount: number;
  repository?: string;
  directory?: string;
  pinned?: boolean;
  onPinnedChange?: (pinned: boolean) => void;
  onEdit?: () => void;
}

export function ProjectInfo({ name, chatCount, activeChatCount, repository, directory,
  pinned = false, onPinnedChange, onEdit }: ProjectInfoProps) {
  return (
    <div data-nf-project-info="">
      <SummaryItem icon={Folder} trailing={onPinnedChange && (
        <PaneButton icon={Pin} aria-label={pinned ? '取消置顶项目' : '置顶项目'} aria-pressed={pinned}
          onClick={() => onPinnedChange(!pinned)} />
      )}><strong>{name}</strong></SummaryItem>
      <SummaryItem icon={Chat}>{chatCount} 次聊天 · {activeChatCount} 个活跃聊天</SummaryItem>
      {(repository || directory) && <div data-nf-project-section="">
        {repository && <SummaryItem icon={Git}><span title={repository}>{repository}</span></SummaryItem>}
        {directory && <SummaryItem icon={Folder}><span title={directory}>{directory}</span></SummaryItem>}
      </div>}
      {onEdit && <div data-nf-project-section=""><SummaryItem icon={Settings} onSelect={onEdit}>编辑项目</SummaryItem></div>}
    </div>
  );
}

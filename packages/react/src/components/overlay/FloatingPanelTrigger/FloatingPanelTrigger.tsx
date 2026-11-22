import Chat from '@hugeicons/core-free-icons/BubbleChatIcon';
import { PaneButton, type PaneButtonProps } from '../../layout/PaneButton/PaneButton.js';

export interface FloatingPanelTriggerProps extends Omit<PaneButtonProps, 'paneId' | 'aria-expanded' | 'icon'> {
  paneId: string;
  expanded: boolean;
  unread?: boolean;
  icon?: PaneButtonProps['icon'];
}

export function FloatingPanelTrigger({ expanded, unread = false, icon = Chat, ...props }: FloatingPanelTriggerProps) {
  const label = expanded ? '收起浮窗' : '展开浮窗';
  const showUnread = !expanded && unread;
  return <PaneButton icon={icon} aria-label={label} title={label}
    aria-description={showUnread ? '有新的 Agent 回复' : undefined} {...props}
    aria-expanded={expanded} data-nf-floating-trigger="" data-nf-unread={showUnread || undefined} />;
}

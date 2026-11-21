import Chat from '@hugeicons/core-free-icons/BubbleChatIcon';
import { PaneButton, type PaneButtonProps } from '../../layout/PaneButton/PaneButton.js';

export interface FloatingPanelTriggerProps extends Omit<PaneButtonProps, 'paneId' | 'aria-expanded' | 'icon'> {
  paneId: string;
  expanded: boolean;
  icon?: PaneButtonProps['icon'];
}

export function FloatingPanelTrigger({ expanded, icon = Chat, ...props }: FloatingPanelTriggerProps) {
  const label = expanded ? '收起浮窗' : '展开浮窗';
  return <PaneButton icon={icon} aria-label={label} title={label} {...props}
    aria-expanded={expanded} data-nf-floating-trigger="" />;
}

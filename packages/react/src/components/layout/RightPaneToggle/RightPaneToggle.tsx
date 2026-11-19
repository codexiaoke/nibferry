import PanelRightOpenIcon from '@hugeicons/core-free-icons/PanelRightOpenIcon';
import PanelRightCloseIcon from '@hugeicons/core-free-icons/PanelRightCloseIcon';
import { PaneButton, type PaneControlProps } from '../PaneButton/PaneButton.js';

export interface RightPaneToggleProps extends Omit<PaneControlProps, 'aria-expanded'> {
  expanded: boolean;
}

export function RightPaneToggle({ expanded, ...props }: RightPaneToggleProps) {
  return (
    <PaneButton
      aria-label={expanded ? '收起右侧栏' : '展开右侧栏'}
      {...props}
      aria-expanded={expanded}
      icon={expanded ? PanelRightCloseIcon : PanelRightOpenIcon}
    />
  );
}

import { PaneButton, type PaneControlProps } from '../PaneButton/PaneButton.js';
import LeftPaneExpandedIcon from '@hugeicons/core-free-icons/PanelLeftOpenIcon';
import LeftPaneCollapsedIcon from '@hugeicons/core-free-icons/PanelLeftCloseIcon';

export interface LeftPaneToggleProps extends Omit<PaneControlProps, 'aria-expanded'> {
  expanded: boolean;
}

export function LeftPaneToggle({ expanded, ...props }: LeftPaneToggleProps) {
  return (
    <PaneButton
      aria-label={expanded ? '收起左侧栏' : '展开左侧栏'}
      {...props}
      data-nf-left-pane-toggle=""
      aria-expanded={expanded}
      icon={expanded ? LeftPaneExpandedIcon : LeftPaneCollapsedIcon}
    />
  );
}

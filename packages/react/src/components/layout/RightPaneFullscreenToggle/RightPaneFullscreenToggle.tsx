import ArrowExpandIcon from '@hugeicons/core-free-icons/ArrowExpand01Icon';
import ArrowShrinkIcon from '@hugeicons/core-free-icons/ArrowShrink02Icon';
import { PaneButton, type PaneControlProps } from '../PaneButton/PaneButton.js';

export interface RightPaneFullscreenToggleProps extends PaneControlProps {
  fullscreen: boolean;
}

export function RightPaneFullscreenToggle({ fullscreen, ...props }: RightPaneFullscreenToggleProps) {
  return (
    <PaneButton
      aria-label={fullscreen ? '退出全屏' : '全屏显示右侧栏'}
      {...props}
      icon={fullscreen ? ArrowShrinkIcon : ArrowExpandIcon}
      text={fullscreen ? '退出全屏' : undefined}
    />
  );
}

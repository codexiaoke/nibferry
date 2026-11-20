import List from '@hugeicons/core-free-icons/LeftToRightListBulletIcon';
import { PaneButton, type PaneControlProps } from '../../layout/PaneButton/PaneButton.js';

export interface SummaryToggleProps extends Omit<PaneControlProps, 'aria-expanded'> {
  expanded: boolean;
}

export function SummaryToggle({ expanded, ...props }: SummaryToggleProps) {
  const label = expanded ? '收起会话摘要' : '查看会话摘要';
  return (
    <PaneButton aria-label={label} title={label} {...props} icon={List} aria-expanded={expanded} data-nf-summary-toggle="" />
  );
}

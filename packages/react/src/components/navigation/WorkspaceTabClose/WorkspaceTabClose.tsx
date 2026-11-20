import Cancel from '@hugeicons/core-free-icons/Cancel01Icon';
import { PaneButton, type PaneButtonProps } from '../../layout/PaneButton/PaneButton.js';

export interface WorkspaceTabCloseProps extends Omit<PaneButtonProps, 'icon'> {
  label: string;
}

export function WorkspaceTabClose({ label, ...props }: WorkspaceTabCloseProps) {
  const action = '关闭「' + label + '」';
  return <PaneButton icon={Cancel} aria-label={action} title={action} {...props} data-nf-tab-close="" />;
}

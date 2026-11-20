import Add from '@hugeicons/core-free-icons/Add01Icon';
import { PaneButton, type PaneButtonProps } from '../../layout/PaneButton/PaneButton.js';

export type WorkspaceTabAddProps = Omit<PaneButtonProps, 'icon'>;

export function WorkspaceTabAdd(props: WorkspaceTabAddProps) {
  return <PaneButton icon={Add} aria-label="新增标签页" title="新增标签页" {...props} />;
}

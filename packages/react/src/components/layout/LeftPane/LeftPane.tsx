import type { ReactNode } from 'react';
import { SidePane, type SidePaneProps } from '../SidePane/SidePane.js';

export interface LeftPaneProps extends SidePaneProps {
  collapsedContent?: ReactNode;
}

export function LeftPane({ collapsedContent, ...props }: LeftPaneProps) {
  return <>
    <SidePane {...props} side="left" />
    {collapsedContent != null && props.collapsed !== undefined && !props.hidden && (
      <div data-nf-left-collapsed-content="" hidden={!props.collapsed} inert={!props.collapsed || props.inert}
        aria-hidden={!props.collapsed || props['aria-hidden']}>
        {collapsedContent}
      </div>
    )}
  </>;
}

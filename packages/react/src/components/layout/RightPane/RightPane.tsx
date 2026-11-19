import { SidePane, type SidePaneProps } from '../SidePane/SidePane.js';

export interface RightPaneProps extends SidePaneProps {
  fullscreen?: boolean;
}

export function RightPane({ fullscreen, ...props }: RightPaneProps) {
  return <SidePane {...props} side="right" data-nf-fullscreen={fullscreen} />;
}

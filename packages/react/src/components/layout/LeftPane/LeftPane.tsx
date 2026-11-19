import { SidePane, type SidePaneProps } from '../SidePane/SidePane.js';

export type LeftPaneProps = SidePaneProps;

export function LeftPane(props: LeftPaneProps) {
  return <SidePane {...props} side="left" />;
}

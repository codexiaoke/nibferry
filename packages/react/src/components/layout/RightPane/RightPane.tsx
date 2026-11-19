import type { ComponentPropsWithRef, CSSProperties } from 'react';

export interface RightPaneProps extends ComponentPropsWithRef<'aside'> {
  width?: CSSProperties['width'];
}

export function RightPane({ width, style, ...props }: RightPaneProps) {
  return <aside {...props} data-nf-pane="right" style={{ width, ...style }} />;
}

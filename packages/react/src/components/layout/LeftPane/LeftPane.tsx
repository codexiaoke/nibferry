import type { ComponentPropsWithRef, CSSProperties } from 'react';

export interface LeftPaneProps extends ComponentPropsWithRef<'aside'> {
  width?: CSSProperties['width'];
}

export function LeftPane({ width, style, ...props }: LeftPaneProps) {
  return <aside {...props} data-nf-pane="left" style={{ width, ...style }} />;
}

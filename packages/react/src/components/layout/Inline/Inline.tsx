import type { ComponentPropsWithRef, CSSProperties } from 'react';
import { spacing, type LayoutGap } from '../spacing.js';

export interface InlineProps extends ComponentPropsWithRef<'div'> {
  gap?: LayoutGap;
  align?: CSSProperties['alignItems'];
  wrap?: boolean;
}

export function Inline({
  gap = 'sm',
  align = 'center',
  wrap = false,
  style,
  ...props
}: InlineProps) {
  return (
    <div
      {...props}
      style={{
        display: props.hidden ? undefined : 'flex',
        flexDirection: 'row',
        flexWrap: wrap ? 'wrap' : 'nowrap',
        gap: spacing(gap),
        alignItems: align,
        ...style,
      }}
    />
  );
}

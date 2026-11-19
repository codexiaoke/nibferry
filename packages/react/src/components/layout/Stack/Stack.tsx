import type { ComponentPropsWithRef, CSSProperties } from 'react';
import { spacing, type LayoutGap } from '../spacing.js';

export interface StackProps extends ComponentPropsWithRef<'div'> {
  gap?: LayoutGap;
  align?: CSSProperties['alignItems'];
}

export function Stack({ gap = 'md', align, style, ...props }: StackProps) {
  return (
    <div
      {...props}
      style={{
        display: props.hidden ? undefined : 'flex',
        flexDirection: 'column',
        gap: spacing(gap),
        alignItems: align,
        ...style,
      }}
    />
  );
}

import type { ComponentPropsWithRef } from 'react';

export interface SkeletonProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  shape?: 'text' | 'circle' | 'block';
}

export function Skeleton({ shape = 'text', ...props }: SkeletonProps) {
  return <span {...props} data-nf-skeleton={shape} aria-hidden="true"><span /></span>;
}

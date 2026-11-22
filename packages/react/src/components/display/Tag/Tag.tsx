import type { ComponentPropsWithRef } from 'react';

export interface TagProps extends ComponentPropsWithRef<'span'> {
  tone?: 'neutral' | 'accent';
}

export function Tag({ tone = 'neutral', ...props }: TagProps) {
  return <span data-nf-tag={tone} {...props} />;
}

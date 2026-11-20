import type { ComponentPropsWithRef } from 'react';

export interface CountBadgeProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  count: number;
}

export function CountBadge({ count, ...props }: CountBadgeProps) {
  return <span title={String(count)} {...props} data-nf-count-badge="">{count > 99 ? '99+' : count}</span>;
}

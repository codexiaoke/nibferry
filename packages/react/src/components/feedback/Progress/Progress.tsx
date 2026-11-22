import type { ComponentPropsWithRef } from 'react';

export interface ProgressProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  label: string;
  value?: number;
  max?: number;
}

export function Progress({ label, value, max = 100, ...props }: ProgressProps) {
  const limit = Number.isFinite(max) && max > 0 ? max : 100;
  const current = value !== undefined && Number.isFinite(value) ? Math.min(limit, Math.max(0, value)) : undefined;
  return <div {...props} data-nf-progress="" role="progressbar" aria-label={label}
    aria-valuemin={0} aria-valuemax={limit} aria-valuenow={current}>
    <span aria-hidden="true" style={current === undefined ? undefined : { inlineSize: (current / limit * 100) + '%' }} />
  </div>;
}

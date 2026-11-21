import type { ComponentPropsWithRef, CSSProperties } from 'react';

export interface ContextUsageProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** Percentage of the available context in use. */
  value: number;
}

export function ContextUsage({ value, style, 'aria-label': label = '上下文用量', ...props }: ContextUsageProps) {
  if (!Number.isFinite(value)) return null;
  const percent = Math.min(100, Math.max(0, value));
  return <span role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}
    aria-valuetext={percent + '%'} title={label + ' ' + percent + '%'} {...props} data-nf-context-usage=""
    style={{ ...style, '--nf-context-fill': percent + '%' } as CSSProperties} />;
}

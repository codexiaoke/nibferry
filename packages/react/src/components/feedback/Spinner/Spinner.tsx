import type { ComponentPropsWithRef } from 'react';

export interface SpinnerProps extends ComponentPropsWithRef<'span'> {
  label?: string;
}
export function Spinner({ label, ...props }: SpinnerProps) {
  return <span {...props} data-nf-spinner="" role={label ? 'status' : undefined}
    aria-label={label} aria-hidden={label ? undefined : true} />;
}

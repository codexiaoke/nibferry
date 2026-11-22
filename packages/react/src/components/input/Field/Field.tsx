'use client';

import { cloneElement, useId, type ComponentPropsWithRef, type ReactElement, type ReactNode } from 'react';

type ControlAttributes = Pick<ComponentPropsWithRef<'input'>, 'id' | 'aria-describedby' | 'aria-invalid'>;

export interface FieldProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactElement<ControlAttributes>;
}

export function Field({ label, hint, error, children, ...props }: FieldProps) {
  const generatedId = useId();
  const id = children.props.id ?? generatedId;
  const description = [children.props['aria-describedby'], hint && id + '-hint', error && id + '-error']
    .filter(Boolean).join(' ') || undefined;
  return <div data-nf-field="" {...props}>
    <label htmlFor={id}>{label}</label>
    {cloneElement(children, { id, 'aria-describedby': description, 'aria-invalid': error ? true : children.props['aria-invalid'] })}
    {hint && <small id={id + '-hint'}>{hint}</small>}
    {error && <small data-nf-field-error="" id={id + '-error'} role="alert">{error}</small>}
  </div>;
}

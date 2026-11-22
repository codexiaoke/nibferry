import type { ComponentPropsWithRef } from 'react';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export function Button({ variant = 'secondary', type = 'button', ...props }: ButtonProps) {
  return <button type={type} data-nf-button={variant} {...props} />;
}

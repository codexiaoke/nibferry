import type { ComponentPropsWithRef } from 'react';

export interface InputProps extends ComponentPropsWithRef<'input'> {
  type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'search';
}

export function Input({ type = 'text', ...props }: InputProps) {
  return <input type={type} data-nf-input="" {...props} />;
}

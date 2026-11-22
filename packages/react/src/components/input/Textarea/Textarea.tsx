import type { ComponentPropsWithRef } from 'react';

export type TextareaProps = ComponentPropsWithRef<'textarea'>;

export function Textarea({ rows = 3, ...props }: TextareaProps) {
  return <textarea rows={rows} data-nf-textarea="" {...props} />;
}

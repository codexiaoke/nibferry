import type { ComponentPropsWithRef, ReactNode } from 'react';

export interface AlertProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  title: ReactNode;
  tone?: 'info' | 'danger';
  action?: ReactNode;
}

export function Alert({ title, tone = 'info', action, children, ...props }: AlertProps) {
  return <div role={tone === 'danger' ? 'alert' : 'status'} data-nf-alert={tone} {...props}>
    <div><strong>{title}</strong>{children != null && <div data-nf-alert-body="">{children}</div>}</div>
    {action}
  </div>;
}

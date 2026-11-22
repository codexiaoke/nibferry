import type { ComponentPropsWithRef, ReactNode } from 'react';

export interface EmptyStateProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  title: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, icon, action, children, ...props }: EmptyStateProps) {
  return <div data-nf-empty-state="" {...props}>
    {icon && <span aria-hidden="true">{icon}</span>}
    <div>{title}</div>
    {children != null && <small>{children}</small>}
    {action}
  </div>;
}

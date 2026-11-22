import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';

export interface MessageCardProps extends Omit<ComponentPropsWithRef<'section'>, 'title'> {
  title: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
}

export function MessageCard({ title, status, actions, children, ...props }: MessageCardProps) {
  const titleId = useId();
  return <section aria-labelledby={titleId} {...props} data-nf-message-card="">
    <header><strong id={titleId}>{title}</strong>{status}</header>
    {children}
    {actions != null && typeof actions !== 'boolean' && <footer>{actions}</footer>}
  </section>;
}

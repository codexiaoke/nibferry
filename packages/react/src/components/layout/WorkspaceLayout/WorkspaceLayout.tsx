import type { ComponentPropsWithRef } from 'react';

export type WorkspacePane = 'left' | 'main' | 'right';

export interface WorkspaceLayoutProps extends ComponentPropsWithRef<'div'> {
  compactPane?: WorkspacePane;
  expandedPane?: WorkspacePane;
}

export function WorkspaceLayout({
  compactPane = 'main',
  expandedPane,
  ...props
}: WorkspaceLayoutProps) {
  return <div {...props} data-nf-workspace={compactPane} data-nf-expanded={expandedPane} />;
}

import type { ComponentPropsWithRef } from 'react';

export type MainPaneProps = ComponentPropsWithRef<'div'>;

export function MainPane(props: MainPaneProps) {
  return <div {...props} data-nf-pane="main" />;
}

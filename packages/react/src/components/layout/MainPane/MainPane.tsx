import type { ComponentPropsWithRef } from 'react';

export type MainPaneProps = ComponentPropsWithRef<'div'>;

export function MainPane(props: MainPaneProps) {
  return <div {...props} inert={props.hidden === true || props.inert} data-nf-pane="main" />;
}

import type { ComponentPropsWithRef } from 'react';

export type SwitchProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'children' | 'role'>;

export function Switch(props: SwitchProps) {
  return <input {...props} type="checkbox" role="switch" data-nf-switch="" />;
}

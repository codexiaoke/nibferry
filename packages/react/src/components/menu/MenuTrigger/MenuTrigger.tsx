import { Trigger } from '@radix-ui/react-dropdown-menu';
import type { ComponentPropsWithRef } from 'react';

export type MenuTriggerProps = ComponentPropsWithRef<typeof Trigger>;

export function MenuTrigger(props: MenuTriggerProps) {
  return <Trigger {...props} data-nf-menu-trigger="" />;
}

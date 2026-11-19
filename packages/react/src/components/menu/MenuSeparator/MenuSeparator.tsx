import { Separator } from '@radix-ui/react-dropdown-menu';
import type { ComponentPropsWithRef } from 'react';

export type MenuSeparatorProps = ComponentPropsWithRef<typeof Separator>;

export function MenuSeparator(props: MenuSeparatorProps) {
  return <Separator {...props} data-nf-menu-separator="" />;
}

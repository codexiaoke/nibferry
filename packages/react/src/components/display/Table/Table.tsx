import type { ComponentPropsWithRef } from 'react';
import { ScrollArea } from '../../layout/ScrollArea/ScrollArea.js';

export type TableProps = ComponentPropsWithRef<'table'>;
export function Table({ children, ...props }: TableProps) {
  return <ScrollArea orientation="horizontal" data-nf-table-scroll="" hidden={props.hidden}>
    <table {...props} data-nf-table="">{children}</table>
  </ScrollArea>;
}

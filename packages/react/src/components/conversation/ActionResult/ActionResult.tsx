import type { ComponentPropsWithRef } from 'react';

export type ActionResultValue = string | number | boolean | null
  | readonly ActionResultValue[] | { readonly [key: string]: ActionResultValue };

export interface ActionResultProps extends Omit<ComponentPropsWithRef<'section'>, 'children'> {
  value: ActionResultValue;
}

export function ActionResult({ value, ...props }: ActionResultProps) {
  return <section aria-label="操作结果" {...props} data-nf-action-result="">
    <pre>{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}</pre>
  </section>;
}

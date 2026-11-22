import type { ComponentPropsWithRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Tick from '@hugeicons/core-free-icons/Tick02Icon';

export type CheckboxProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'children'>;

export function Checkbox(props: CheckboxProps) {
  return <span data-nf-check-box="">
    <input {...props} type="checkbox" />
    <HugeiconsIcon icon={Tick} size={13} strokeWidth={2.4} aria-hidden="true" />
  </span>;
}

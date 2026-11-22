'use client';

import { Select, type SelectOption, type SelectProps } from '../../selection/Select/Select.js';

export type ComposerSelectOption = SelectOption;
export type ComposerSelectProps = Pick<SelectProps,
  'label' | 'value' | 'options' | 'onValueChange' | 'disabled' | 'className' | 'menuClassName' | 'container'>;

export function ComposerSelect(props: ComposerSelectProps) {
  return <Select {...props} data-nf-composer-select="" variant="compact" side="top" />;
}

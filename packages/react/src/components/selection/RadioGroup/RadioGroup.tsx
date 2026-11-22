'use client';

import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';

export interface RadioOption {
  value: string;
  label: ReactNode;
  visual?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps extends Omit<ComponentPropsWithRef<'fieldset'>, 'children' | 'defaultValue'> {
  label: ReactNode;
  options: readonly RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: 'list' | 'cards';
  required?: boolean;
}

export function RadioGroup({ label, options, value, defaultValue, onValueChange, variant = 'list',
  name, required, form, ...props }: RadioGroupProps) {
  const generatedName = useId();
  return <fieldset data-nf-radio-group={variant} form={form} {...props}>
    <legend>{label}</legend>
    <div data-nf-radio-options="">
      {options.map(option => <label key={option.value} data-nf-radio-option="">
        <input type="radio" form={form} name={name ?? generatedName} value={option.value} required={required}
          disabled={option.disabled} checked={value === undefined ? undefined : value === option.value}
          defaultChecked={value === undefined ? defaultValue === option.value : undefined}
          onChange={() => onValueChange?.(option.value)} />
        {variant === 'cards' && option.visual != null && <span data-nf-radio-visual="" aria-hidden="true">{option.visual}</span>}
        <span data-nf-radio-label="">{option.label}</span>
        {option.description != null && <small>{option.description}</small>}
      </label>)}
    </div>
  </fieldset>;
}

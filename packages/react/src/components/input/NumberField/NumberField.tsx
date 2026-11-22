'use client';

import { useImperativeHandle, useRef, type ComponentPropsWithRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Minus from '@hugeicons/core-free-icons/MinusSignIcon';
import Plus from '@hugeicons/core-free-icons/PlusSignIcon';
import { Button } from '../Button/Button.js';

export interface NumberFieldProps extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type' | 'onChange' | 'step' | 'min' | 'max'> {
  value: number | null;
  onValueChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberField({ value, onValueChange, min, max, step = 1, disabled, readOnly, ref, ...props }: NumberFieldProps) {
  const input = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => input.current!, []);
  function adjust(up: boolean) {
    const field = input.current!;
    const previous = field.value;
    if (up) field.stepUp(); else field.stepDown();
    const next = field.valueAsNumber;
    field.value = previous;
    if (Number.isFinite(next) && next !== value) onValueChange(next);
  }
  return <div data-nf-number-field="" hidden={props.hidden}>
    <input {...props} ref={input} data-nf-input="" type="number" value={value ?? ''} min={min} max={max}
      step={step} disabled={disabled} readOnly={readOnly}
      onChange={event => onValueChange(Number.isFinite(event.target.valueAsNumber) ? event.target.valueAsNumber : null)} />
    <Button variant="ghost" aria-label="减少" disabled={disabled || readOnly || (min !== undefined && value !== null && value <= min)}
      onClick={() => adjust(false)}><HugeiconsIcon icon={Minus} size={14} aria-hidden="true" /></Button>
    <Button variant="ghost" aria-label="增加" disabled={disabled || readOnly || (max !== undefined && value !== null && value >= max)}
      onClick={() => adjust(true)}><HugeiconsIcon icon={Plus} size={14} aria-hidden="true" /></Button>
  </div>;
}

'use client';

import { useContext, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { HugeiconsIcon } from '@hugeicons/react';
import Arrow from '@hugeicons/core-free-icons/ArrowRight01Icon';
import Reset from '@hugeicons/core-free-icons/RefreshIcon';
import Tick from '@hugeicons/core-free-icons/Tick02Icon';
import { Slider } from '../../selection/Slider/Slider.js';
import { ScrollArea } from '../../layout/ScrollArea/ScrollArea.js';
import type { ComposerSelectOption } from '../ComposerSelect/ComposerSelect.js';
import { DialogContainer } from '../../overlay/Dialog/Dialog.js';

export interface ComposerModelOption extends ComposerSelectOption {
  provider?: string;
}

export interface ComposerModelSelectProps {
  models: readonly ComposerModelOption[];
  model: string;
  onModelChange: (model: string) => void;
  levels: readonly { value: string; label: string }[];
  level: string;
  onLevelChange: (level: string) => void;
  resetLevel?: string;
  panelClassName?: string;
  container?: Popover.PopoverPortalProps['container'];
}

function groupModels(models: readonly ComposerModelOption[]) {
  const groups = new Map<string, ComposerModelOption[]>([['', []]]);
  for (const model of models) {
    const provider = model.provider ?? '';
    const options = groups.get(provider);
    if (options) options.push(model);
    else groups.set(provider, [model]);
  }
  return groups;
}

function moveOption(event: KeyboardEvent<HTMLDivElement>) {
  const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:enabled'));
  const at = items.indexOf(event.target as HTMLButtonElement);
  const next = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: items.length - 1 }[event.key];
  if (next === undefined) return;
  event.preventDefault();
  items[Math.min(items.length - 1, Math.max(0, next))]?.focus();
}

export function ComposerModelSelect({ models, model, onModelChange, levels, level, onLevelChange,
  resetLevel, panelClassName, container }: ComposerModelSelectProps) {
  const dialog = useContext(DialogContainer);
  const [view, setView] = useState<'level' | 'models' | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const range = useRef<HTMLInputElement>(null);
  const currentOption = useRef<HTMLButtonElement>(null);
  const tip = useId();
  const current = models.find(option => option.value === model);
  const index = levels.findIndex(option => option.value === level);
  const strength = levels[index]?.label;
  const firstView = levels.length ? 'level' : 'models';
  const prompt = levels.length ? '选择推理强度' : '选择模型';
  const firstEnabled = models.find(option => !option.disabled);
  const focusValue = current && !current.disabled ? current.value : firstEnabled?.value;

  useEffect(() => {
    const button = trigger.current;
    const scope = button?.closest<HTMLElement>('[data-nf-composer]') ?? button;
    if (!scope) return;
    function shortcut(event: globalThis.KeyboardEvent) {
      if (!event.ctrlKey || !event.shiftKey || event.altKey || event.metaKey || event.key.toLowerCase() !== 'm'
        || event.isComposing || event.defaultPrevented || button?.disabled) return;
      event.preventDefault();
      setView(firstView);
    }
    scope.addEventListener('keydown', shortcut);
    return () => scope.removeEventListener('keydown', shortcut);
  }, [firstView]);

  useEffect(() => {
    if (view === 'models') currentOption.current?.focus();
  }, [view]);

  return <Popover.Root open={view !== null} onOpenChange={open => setView(open ? firstView : null)}>
    <span className="nf-model-anchor">
      <Popover.Trigger ref={trigger} className="nf-model-trigger" disabled={!firstEnabled}
        aria-label={['模型，' + (current?.label ?? '选择模型'), strength].filter(Boolean).join(' ')}
        aria-describedby={!view ? tip : undefined} aria-keyshortcuts="Control+Shift+M">
        <span className="nf-model-caption" data-concealed={view === 'level' || undefined}>
          <span>{current?.label ?? '选择模型'}</span>{strength && <small>{strength}</small>}
        </span>
        {view === 'level' && <span className="nf-model-prompt">{prompt}</span>}
      </Popover.Trigger>
      {!view && <span className="nf-model-tip" role="tooltip" id={tip}>{prompt}<kbd>⌃⇧M</kbd></span>}
    </span>
    <Popover.Portal container={container ?? dialog}>
      <Popover.Content side="top" align="end" sideOffset={4} collisionPadding={8}
        className={['nf-model-panel', panelClassName].filter(Boolean).join(' ')}
        aria-label={view === 'models' ? '选择模型' : prompt}
        onOpenAutoFocus={event => {
          event.preventDefault();
          (view === 'models' ? currentOption.current : range.current ?? trigger.current)?.focus({ preventScroll: true });
        }}>
        {view === 'models' ? <ScrollArea className="nf-model-options" viewportProps={{ tabIndex: -1 }}>
          <div className="nf-model-list" role="listbox" aria-label="选择模型" onKeyDown={moveOption}>
            <div className="nf-model-list-title" aria-hidden="true">选择模型</div>
            {Array.from(groupModels(models), ([provider, options]) => options.length > 0 && (
              <div key={provider} role={provider ? 'group' : 'presentation'} aria-label={provider || undefined}>
                {provider && <div className="nf-model-provider" aria-hidden="true">{provider}</div>}
                {options.map(option => <button key={option.value} type="button" role="option"
                  aria-selected={option.value === model} disabled={option.disabled}
                  ref={option.value === focusValue ? currentOption : undefined} tabIndex={option.value === focusValue ? 0 : -1}
                  onClick={() => { onModelChange(option.value); setView(null); }}>
                  <span>{option.label}{option.detail && <small>{option.detail}</small>}</span>
                  {option.value === model && <HugeiconsIcon icon={Tick} size={15} aria-hidden="true" />}
                </button>)}
              </div>
            ))}
          </div>
        </ScrollArea> : view === 'level' && <div className="nf-model-level">
          <div className="nf-model-head">
            <button type="button" className="nf-model-switch" aria-label={'选择模型，' + (current?.label ?? '')}
              onClick={() => setView('models')}>
              <strong>{strength}</strong>
              <span>{current?.label ?? '选择模型'}<HugeiconsIcon icon={Arrow} size={12} aria-hidden="true" /></span>
            </button>
            {resetLevel !== undefined && levels.some(option => option.value === resetLevel) && <button type="button" className="nf-model-reset"
              aria-label="恢复默认推理强度" title="恢复默认推理强度" onClick={() => onLevelChange(resetLevel)}>
              <HugeiconsIcon icon={Reset} size={15} aria-hidden="true" />
            </button>}
          </div>
          <Slider aria-label="推理强度" aria-valuetext={strength} ref={range} min={0} max={levels.length - 1}
            marks={levels.map((_, i) => i)} value={Math.max(0, index)} onValueChange={i => onLevelChange(levels[i].value)} />
        </div>}
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>;
}

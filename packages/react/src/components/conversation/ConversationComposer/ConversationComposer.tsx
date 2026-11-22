'use client';

import { createContext, useContext, useLayoutEffect, useState, type ComponentPropsWithRef, type KeyboardEvent, type ReactNode } from 'react';
import { ConversationFileReceiver, FileDropArea } from '../ConversationView/file-drop.js';
import { ConversationScrollRequest } from '../ConversationView/scroll-to-latest.js';
import type { ComposerMenuMatch } from '../ComposerActionMenu/ComposerActionMenu.js';
import { Textarea } from '../../input/Textarea/Textarea.js';
import { HugeiconsIcon } from '@hugeicons/react';
import Up from '@hugeicons/core-free-icons/ArrowUp02Icon';
import Stop from '@hugeicons/core-free-icons/StopIcon';

interface ComposerMenuInput {
  triggers: readonly string[];
  edit: (field: HTMLTextAreaElement, match: ComposerMenuMatch | null, inserted: string | null) => void;
  keyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
}
export const ComposerMenuContext = createContext<Set<ComposerMenuInput> | null>(null);

export interface ConversationComposerProps extends Omit<ComponentPropsWithRef<'textarea'>, 'value' | 'defaultValue' | 'onChange' | 'children'> {
  value: string;
  onValueChange: (text: string) => void;
  onSend: () => void;
  canSend?: boolean;
  contextContent?: ReactNode;
  attachments?: ReactNode;
  onFilesAdd?: (files: File[]) => void;
  onStop?: () => void;
  running?: boolean;
  tools?: ReactNode;
  rightTools?: ReactNode;
  emptyAction?: ReactNode;
  sendLabel?: string;
  stopLabel?: string;
}

export function ConversationComposer({ value, onValueChange, onSend, canSend, contextContent, attachments, onFilesAdd, running, onStop, tools, rightTools, emptyAction,
  sendLabel = '发送消息', stopLabel = '停止生成', disabled, hidden, onKeyDown, onCompositionEnd, ...props }: ConversationComposerProps) {
  const [menus] = useState(() => new Set<ComposerMenuInput>());
  const hasText = Boolean(value.trim());
  const ready = !disabled && !running && (canSend ?? hasText);
  const conversation = useContext(ConversationFileReceiver);
  const requestLatest = useContext(ConversationScrollRequest);
  const receiveFiles = disabled || hidden || props.readOnly ? undefined : onFilesAdd;
  useLayoutEffect(() => {
    if (!conversation) return;
    conversation.current = receiveFiles;
    return () => { conversation.current = undefined; };
  }, [conversation, receiveFiles]);

  function send() {
    if (!ready) return;
    onSend();
    requestLatest();
  }

  function edit(field: HTMLTextAreaElement, inserted: string | null) {
    if (field.readOnly) return;
    const end = field.selectionEnd;
    const word = field.value.slice(0, end).match(/\S+$/u)?.[0] ?? '';
    let owner: ComposerMenuInput | undefined;
    let symbol = '';
    for (const menu of menus) {
      for (const prefix of menu.triggers) {
        if (prefix.length > symbol.length && word.startsWith(prefix)) {
          owner = menu;
          symbol = prefix;
        }
      }
    }
    const token = { symbol, query: word.slice(symbol.length), start: end - word.length, end };
    for (const menu of menus) menu.edit(field, owner === menu && field.selectionStart === end ? token : null, inserted);
  }
  return <FileDropArea data-nf-composer="" hidden={hidden} receiver={() => conversation ? undefined : receiveFiles}
    onPaste={event => {
      if (!event.defaultPrevented && receiveFiles && event.clipboardData.files.length) {
        event.preventDefault();
        receiveFiles(Array.from(event.clipboardData.files));
      }
    }}>
    {contextContent}
    {attachments}
    <Textarea aria-label="消息" rows={1} {...props} value={value} disabled={disabled}
      onChange={event => {
        onValueChange(event.target.value);
        const input = event.nativeEvent as InputEvent;
        if (!input.isComposing) edit(event.currentTarget, input.data);
      }}
      onCompositionEnd={event => {
        onCompositionEnd?.(event);
        if (!event.defaultPrevented) edit(event.currentTarget, event.data);
      }}
      onKeyDown={event => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
        for (const menu of menus) {
          menu.keyDown(event);
          if (event.defaultPrevented) return;
        }
        if (event.key !== 'Enter' || event.shiftKey) return;
        event.preventDefault();
        send();
      }} />
    <ComposerMenuContext.Provider value={menus}>
      <div data-nf-composer-toolbar="">
        {tools != null && <div data-nf-composer-tools="start">{tools}</div>}
        <div data-nf-composer-tools="end">
          {rightTools}
          {!disabled && !running && !hasText && !attachments && !ready && emptyAction != null ? emptyAction :
            <button data-nf-composer-submit="" type="button" aria-label={running ? stopLabel : sendLabel}
              disabled={running ? !onStop || disabled : !ready} onClick={running ? onStop : send}>
              <HugeiconsIcon icon={running ? Stop : Up} size={18} aria-hidden="true" />
            </button>}
        </div>
      </div>
    </ComposerMenuContext.Provider>
  </FileDropArea>;
}

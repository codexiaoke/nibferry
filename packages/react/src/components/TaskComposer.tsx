import { useId, type FormEvent } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import ArrowUp02Icon from '@hugeicons/core-free-icons/ArrowUp02Icon';
import File02Icon from '@hugeicons/core-free-icons/File02Icon';
import type { TaskAttachment } from '../task/types.js';
import styles from './controls.module.css';

export interface TaskComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (text: string) => void;
  attachments?: readonly TaskAttachment[];
  label?: string;
  submitLabel?: string;
}

export function TaskComposer({
  value,
  onChange,
  onSubmit,
  attachments = [],
  label = '任务要求',
  submitLabel = '发送任务',
}: TaskComposerProps) {
  const inputId = useId();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  }
  return (
    <form className={styles.composer} onSubmit={submit}>
      <label className={styles.readerOnly} htmlFor={inputId}>
        {label}
      </label>
      <textarea
        id={inputId}
        value={value}
        rows={2}
        placeholder="交代任务…"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing &&
            event.nativeEvent.keyCode !== 229
          ) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />
      <div className={styles.tools}>
        <ul aria-label="随任务发送的资料" className={styles.files}>
          {attachments.map((file) => (
            <li key={file.id}>
              <HugeiconsIcon icon={File02Icon} size={14} aria-hidden="true" />
              {file.name}
            </li>
          ))}
        </ul>
        <button
          className={styles.send}
          type="submit"
          aria-label={submitLabel}
          disabled={!value.trim()}
        >
          <HugeiconsIcon icon={ArrowUp02Icon} size={20} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

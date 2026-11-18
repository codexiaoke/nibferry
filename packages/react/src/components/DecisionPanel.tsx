import { useId, type ReactNode } from 'react';
import type { TaskDecision } from '../task/types.js';
import styles from './controls.module.css';

export interface DecisionPanelProps {
  decision: TaskDecision;
  onChoose: (optionId: string) => void;
  pending?: boolean;
  reference?: ReactNode;
}

export function DecisionPanel({
  decision,
  onChoose,
  pending = false,
  reference,
}: DecisionPanelProps) {
  const title = useId();
  return (
    <section
      aria-labelledby={title}
      className={styles.decision}
      onKeyDown={(event) => {
        if (
          pending ||
          event.repeat ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        )
          return;
        if (
          !(event.target instanceof HTMLButtonElement) ||
          !event.target.hasAttribute('data-option') ||
          !/^[1-9]$/.test(event.key)
        )
          return;
        const option = decision.options[Number(event.key) - 1];
        if (option) {
          event.preventDefault();
          onChoose(option.id);
        }
      }}
    >
      <h3 id={title}>{decision.question}</h3>
      {reference}
      <div className={styles.options}>
        {decision.options.map((option, index) => (
          <button
            type="button"
            key={option.id}
            data-option=""
            aria-disabled={pending}
            className={styles.option}
            onClick={() => {
              if (!pending) onChoose(option.id);
            }}
          >
            <span className={styles.number} aria-hidden="true">
              {index + 1}
            </span>
            <span>
              <strong>{option.label}</strong>
              {option.description && <small>{option.description}</small>}
            </span>
          </button>
        ))}
      </div>
      {pending && <p role="status">正在提交选择…</p>}
    </section>
  );
}

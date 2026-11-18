'use client';

import { useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Copy from '@hugeicons/core-free-icons/Copy01Icon';
import Check from '@hugeicons/core-free-icons/Tick02Icon';
import Arrow from '@hugeicons/core-free-icons/ArrowDown01Icon';

const commands = [
  { label: '打包组件库', command: 'pnpm --filter @nibferry/react pack' },
  { label: '启动官网', command: 'pnpm dev' },
  { label: '构建项目', command: 'pnpm build' },
];

export default function BuildCommand() {
  const [command, setCommand] = useState(commands[0].command);
  const [status, setStatus] = useState('');
  const picker = useRef<HTMLDetailsElement>(null);
  function closePicker() {
    if (!picker.current) return;
    picker.current.open = false;
    picker.current.querySelector('summary')?.focus();
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setStatus('已复制命令');
    } catch {
      setStatus('请选中命令并复制');
    }
  }
  return (
    <div className="command-wrap">
      <div className="build-command">
        <button
          type="button"
          className="command-copy"
          onClick={copy}
          aria-label={'复制命令 ' + command}
        >
          <code>{command}</code>
          <HugeiconsIcon
            icon={status === '已复制命令' ? Check : Copy}
            size={15}
            aria-hidden="true"
          />
        </button>
        <details
          ref={picker}
          className="command-choice"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              event.currentTarget.open = false;
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') closePicker();
          }}
        >
          <summary aria-label="选择仓库命令">
            <HugeiconsIcon icon={Arrow} size={14} aria-hidden="true" />
          </summary>
          <div className="choice-list">
            {commands.map((item) => (
              <button
                key={item.command}
                type="button"
                aria-pressed={item.command === command}
                onClick={() => {
                  setCommand(item.command);
                  setStatus('');
                  closePicker();
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </details>
      </div>
      <span className="command-status" role="status">
        {status}
      </span>
    </div>
  );
}

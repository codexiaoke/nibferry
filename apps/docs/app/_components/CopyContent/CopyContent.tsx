'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Copy from '@hugeicons/core-free-icons/Copy01Icon';
import Check from '@hugeicons/core-free-icons/Tick02Icon';

type Props = { markdown: string } | { children: ReactNode };

export default function CopyContent(props: Props) {
  const block = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('');
  const isPage = 'markdown' in props;
  const label = isPage ? '复制本页' : '复制代码';

  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(''), 2200);
    return () => clearTimeout(timer);
  }, [status]);

  async function copy() {
    const text = isPage ? props.markdown : block.current?.querySelector('pre')?.textContent;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setStatus(isPage ? '已复制 Markdown' : '已复制代码');
    } catch {
      setStatus(isPage ? '复制失败，请查看原文' : '请选中代码并复制');
    }
  }

  const button = (
    <button
      type="button"
      aria-label={status || label}
      title={status || label}
      className={isPage ? undefined : 'code-copy icon-button'}
      onClick={copy}
    >
      <HugeiconsIcon
        icon={status.startsWith('已复制') ? Check : Copy}
        size={15}
        aria-hidden="true"
      />
      <span aria-live="polite" className={isPage ? undefined : 'sr-only'}>
        {status || label}
      </span>
    </button>
  );
  return isPage ? (
    button
  ) : (
    <div className="doc-code" ref={block}>
      {props.children}
      {button}
    </div>
  );
}

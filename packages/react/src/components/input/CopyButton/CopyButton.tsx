'use client';

import { useEffect, useState, type ComponentPropsWithRef } from 'react';
import Copy from '@hugeicons/core-free-icons/Copy01Icon';
import Check from '@hugeicons/core-free-icons/Tick02Icon';
import { PaneButton } from '../../layout/PaneButton/PaneButton.js';
import { Tooltip } from '../../overlay/Tooltip/Tooltip.js';

export interface CopyButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = '复制', onClick, disabled, ...props }: CopyButtonProps) {
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 2000);
    return () => clearTimeout(timer);
  }, [notice]);
  return <>
    <Tooltip content={notice || label}><PaneButton {...props} icon={notice === '已复制' ? Check : Copy}
      aria-label={label} disabled={disabled || !text} onClick={async event => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        try { await navigator.clipboard.writeText(text); setNotice('已复制'); }
        catch { setNotice('复制失败，请手动复制'); }
      }} /></Tooltip>
    <span role="status" data-nf-copy-status={notice === '已复制' ? 'success' : undefined}>{notice}</span>
  </>;
}

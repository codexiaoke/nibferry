'use client';

import type { ComponentPropsWithRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Prev from '@hugeicons/core-free-icons/ArrowLeft01Icon';
import Next from '@hugeicons/core-free-icons/ArrowRight01Icon';
import { Button } from '../../input/Button/Button.js';

export interface PaginationProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'> {
  page: number;
  pageCount: number;
  previousLabel?: string;
  nextLabel?: string;
  onPageChange: (page: number) => void;
}
export function Pagination({ page, pageCount, onPageChange, previousLabel = '上一页', nextLabel = '下一页', ...props }: PaginationProps) {
  const total = Math.max(0, Math.floor(pageCount));
  const current = total ? Math.max(1, Math.min(Math.floor(page), total)) : 0;
  return <nav aria-label="分页" {...props} data-nf-pagination="">
    <Button variant="ghost" aria-label={previousLabel} disabled={current <= 1} onClick={() => onPageChange(current - 1)}>
      <HugeiconsIcon icon={Prev} size={16} aria-hidden="true" /></Button>
    <span aria-live="polite" aria-atomic="true">{current} / {total}</span>
    <Button variant="ghost" aria-label={nextLabel} disabled={current >= total} onClick={() => onPageChange(current + 1)}>
      <HugeiconsIcon icon={Next} size={16} aria-hidden="true" /></Button>
  </nav>;
}

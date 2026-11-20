import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import type { ReactNode } from 'react';

export interface SummaryItemProps {
  children: ReactNode;
  icon?: IconSvgElement;
  trailing?: ReactNode;
  className?: string;
  onSelect?: () => void;
  disabled?: boolean;
}

export function SummaryItem({ children, icon, trailing, className, onSelect, disabled }: SummaryItemProps) {
  const content = (
    <>
      {icon && <HugeiconsIcon icon={icon} size={16} aria-hidden="true" />}
      <span data-nf-summary-label="">{children}</span>
      {trailing != null && <span data-nf-summary-detail="">{trailing}</span>}
    </>
  );

  if (onSelect) {
    return (
      <button type="button" data-nf-summary-item="" className={className} disabled={disabled} onClick={onSelect}>
        {content}
      </button>
    );
  }
  return <div data-nf-summary-item="" className={className}>{content}</div>;
}

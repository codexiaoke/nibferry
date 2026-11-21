'use client';

import { useId, useRef, useState, useLayoutEffect, type ComponentPropsWithRef, type ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Chevron from '@hugeicons/core-free-icons/ArrowRight01Icon';

export interface DisclosureProps extends ComponentPropsWithRef<'div'> {
  label: ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export function ActivityDisclosure({ label, expanded, defaultExpanded = false, onExpandedChange,
  children, reveal, ...props }: DisclosureProps & { reveal?: boolean }) {
  const id = useId();
  const [localOpen, setLocalOpen] = useState(defaultExpanded);
  const open = reveal || (expanded ?? localOpen);
  const trigger = useRef<HTMLButtonElement>(null);
  const body = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!open && body.current?.contains(document.activeElement)) trigger.current?.focus({ preventScroll: true });
  }, [open]);

  const button = <button type="button" ref={trigger} aria-expanded={open} aria-controls={id}
    data-nf-activity-trigger="" onClick={() => {
      if (expanded === undefined) setLocalOpen(!open);
      onExpandedChange?.(!open);
    }}>
    {label}<HugeiconsIcon icon={Chevron} size={13} aria-hidden="true" />
  </button>;

  return <div {...props} data-nf-disclosure="">
    {reveal === undefined ? button : (
      <div data-nf-process-heading="" data-open={!reveal} inert={reveal} aria-hidden={reveal}>
        <div>{button}</div>
      </div>
    )}
    <div id={id} ref={body} data-nf-activity-body="" data-open={open} inert={!open} aria-hidden={!open}>
      <div>{children}</div>
    </div>
  </div>;
}

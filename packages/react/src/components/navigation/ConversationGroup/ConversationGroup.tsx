'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { ContextMenu, type ContextMenuProps } from '../../menu/ContextMenu/ContextMenu.js';
import { HugeiconsIcon } from '@hugeicons/react';
import Folder from '@hugeicons/core-free-icons/Folder01Icon';
import FolderOpen from '@hugeicons/core-free-icons/FolderOpenIcon';
import Chevron from '@hugeicons/core-free-icons/ArrowRight01Icon';

export interface ConversationGroupProps {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  details?: ReactNode;
  actions?: ReactNode;
  contextMenuContent?: ContextMenuProps['content'];
  children: ReactNode;
}

export function ConversationGroup({ label, expanded, onToggle, details, actions, contextMenuContent, children }: ConversationGroupProps) {
  const id = useId();
  const header = useRef<HTMLDivElement>(null);
  const disclosure = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stopPositioning = useRef<(() => void) | undefined>(undefined);

  function cancelTimer() {
    clearTimeout(timer.current);
  }

  function openDetails(focus: boolean) {
    cancelTimer();
    const anchor = header.current;
    const panel = card.current;
    if (!anchor || !panel) return;
    const navigation = anchor.closest('[data-nf-conversation-list]') ?? anchor;
    if (navigation.querySelector('[data-nf-context-open], [aria-haspopup="menu"][aria-expanded="true"]')) return;
    if (!panel.matches(':popover-open')) {
      panel.showPopover();
      stopPositioning.current?.();
      stopPositioning.current = autoUpdate(anchor, panel, async () => {
        const { x, y } = await computePosition(anchor, panel, {
          placement: 'right-start', strategy: 'fixed',
          middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8, crossAxis: true })],
        });
        Object.assign(panel.style, { left: x + 'px', top: y + 'px' });
      });
    }
    if (focus) panel.focus();
  }

  function closeDetails() {
    cancelTimer();
    card.current?.hidePopover();
  }

  function leave() {
    cancelTimer();
    if (!card.current?.contains(document.activeElement)) timer.current = setTimeout(closeDetails, 180);
  }

  const hasDetails = Boolean(details);
  useEffect(() => () => {
    clearTimeout(timer.current);
    stopPositioning.current?.();
  }, [hasDetails]);

  const row = (
    <div ref={header} data-nf-project-row="" onPointerLeave={details ? leave : undefined}>
      <button type="button" ref={disclosure} aria-expanded={expanded} aria-controls={id}
        aria-keyshortcuts={details ? 'ArrowRight' : undefined} title={details ? undefined : label}
        data-nf-conversation-disclosure=""
        onPointerEnter={event => {
          if (details && event.pointerType !== 'touch') {
            cancelTimer();
            timer.current = setTimeout(() => openDetails(false), 300);
          }
        }}
        onClick={() => { closeDetails(); onToggle(); }}
        onKeyDown={event => {
          if (event.key === 'Escape') closeDetails();
          if (details && event.key === 'ArrowRight') {
            event.preventDefault();
            openDetails(true);
          }
        }}>
        <HugeiconsIcon icon={expanded ? FolderOpen : Folder} size={16} aria-hidden="true" />
        <span>{label}</span>
        {!actions && <HugeiconsIcon icon={Chevron} size={12} aria-hidden="true" />}
      </button>
      {actions && <div data-nf-project-actions="" onFocusCapture={closeDetails}
        onPointerEnter={cancelTimer} onPointerDownCapture={closeDetails}>{actions}</div>}
    </div>
  );

  return (
    <div role="group" aria-label={label} data-nf-conversation-group="">
      {contextMenuContent ? <ContextMenu content={contextMenuContent} onOpen={closeDetails}>{row}</ContextMenu> : row}
      {details && (
        <div popover="auto" role="dialog" aria-label={label + ' 项目信息'} tabIndex={-1}
          ref={card} data-nf-project-popover=""
          onToggle={event => {
            if (event.newState === 'closed') stopPositioning.current?.();
          }}
          onPointerEnter={cancelTimer} onPointerLeave={leave}
          onBlur={event => {
            if (!event.currentTarget.contains(event.relatedTarget)) closeDetails();
          }}
          onKeyDown={event => {
            if (event.key === 'Escape') {
              event.preventDefault();
              closeDetails();
              disclosure.current?.focus();
            }
          }}>
          {details}
        </div>
      )}
      <div id={id} data-nf-conversation-body="" inert={!expanded}>
        <div>{children}</div>
      </div>
    </div>
  );
}

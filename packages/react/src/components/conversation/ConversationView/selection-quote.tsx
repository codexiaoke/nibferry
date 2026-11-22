import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { autoUpdate, computePosition, flip, hide, inline, offset, shift } from '@floating-ui/dom';
import { HugeiconsIcon } from '@hugeicons/react';
import Quote from '@hugeicons/core-free-icons/QuoteDownIcon';
import { Button } from '../../input/Button/Button.js';

export interface ReplySelection { text: string; message: HTMLElement }

export function SelectionQuote({ content, onQuote }: {
  content: RefObject<HTMLDivElement | null>; onQuote: (selection: ReplySelection) => void;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const [selection, setSelection] = useState<(ReplySelection & { range: Range }) | null>(null);
  useEffect(() => {
    function update() {
      const selected = window.getSelection();
      const range = selected?.rangeCount === 1 && !selected.isCollapsed ? selected.getRangeAt(0) : null;
      const node = range?.commonAncestorContainer;
      const el = node?.nodeType === Node.ELEMENT_NODE ? node as Element : node?.parentElement;
      const message = el?.closest<HTMLElement>('[data-nf-assistant-message]');
      const text = selected?.toString();
      setSelection(range && message && content.current?.contains(message) && text?.trim()
        ? { text, message, range: range.cloneRange() } : null);
    }
    document.addEventListener('selectionchange', update);
    return () => document.removeEventListener('selectionchange', update);
  }, [content]);

  useLayoutEffect(() => {
    if (!selection || !button.current) return;
    const panel = button.current;
    const viewport = content.current!.closest<HTMLElement>('[data-nf-thread-scroll]')!;
    const { range, message } = selection;
    const anchor = {
      contextElement: message,
      getBoundingClientRect: () => range.getBoundingClientRect(),
      getClientRects: () => range.getClientRects(),
    };
    let active = true;
    panel.style.visibility = 'hidden';
    const stop = autoUpdate(anchor, panel, async () => {
      const { x, y, middlewareData } = await computePosition(anchor, panel, {
        placement: 'top',
        middleware: [inline(), offset(8), flip({ boundary: viewport, padding: 4 }),
          shift({ boundary: viewport, padding: 4 }), hide({ boundary: viewport })],
      });
      if (active) Object.assign(panel.style, {
        left: x + 'px', top: y + 'px', visibility: middlewareData.hide?.referenceHidden ? 'hidden' : 'visible',
      });
    });
    return () => { active = false; stop(); };
  }, [selection, content]);

  return selection && <Button ref={button} data-nf-selection-quote=""
    onMouseDown={event => event.preventDefault()} onClick={() => {
      onQuote({ text: selection.text, message: selection.message });
      window.getSelection()?.removeAllRanges();
      setSelection(null);
    }}><HugeiconsIcon icon={Quote} size={14} aria-hidden="true" />引用</Button>;
}

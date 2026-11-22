import type { ComponentPropsWithRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Close from '@hugeicons/core-free-icons/Cancel01Icon';
import Quote from '@hugeicons/core-free-icons/QuoteDownIcon';
import { PaneButton } from '../../layout/PaneButton/PaneButton.js';

export interface MessageQuoteProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  text: string;
  source?: string;
  onOpen?: () => void;
  onRemove?: () => void;
}

export function MessageQuote({ text, source, onOpen, onRemove, ...props }: MessageQuoteProps) {
  const excerpt = <>
    {source && <span data-nf-quote-source=""><HugeiconsIcon icon={Quote} size={13} aria-hidden="true" />{source}</span>}
    <span data-nf-quote-excerpt="">{text}</span>
  </>;
  return <div {...props} data-nf-message-quote="">
    {onOpen ? <button type="button" title={text} aria-label={'查看原消息：' + text} onClick={onOpen}>{excerpt}</button>
      : <span title={text}>{excerpt}</span>}
    {onRemove && <PaneButton icon={Close} aria-label="移除引用" onClick={onRemove} />}
  </div>;
}

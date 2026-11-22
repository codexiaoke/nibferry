import type { ComponentPropsWithRef, ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import File from '@hugeicons/core-free-icons/File01Icon';
import Close from '@hugeicons/core-free-icons/Cancel01Icon';
import { Button } from '../../input/Button/Button.js';

export interface AttachmentItemProps extends Omit<ComponentPropsWithRef<'li'>, 'children'> {
  name: string;
  detail?: ReactNode;
  icon?: ReactNode;
  onOpen?: () => void;
  onRemove?: () => void;
}

export function AttachmentItem({ name, detail, icon, onOpen, onRemove, ...props }: AttachmentItemProps) {
  const filename = <>{icon ?? <HugeiconsIcon icon={File} size={17} aria-hidden="true" />}
    <span data-nf-attachment-name="">{name}</span></>;
  return <li {...props} data-nf-attachment="">
    {onOpen ? <Button variant="ghost" data-nf-attachment-file="" onClick={onOpen}>{filename}</Button>
      : <span data-nf-attachment-file="">{filename}</span>}
    {detail && <small>{detail}</small>}
    {onRemove && <Button variant="ghost" aria-label={'移除 ' + name} onClick={onRemove}>
      <HugeiconsIcon icon={Close} size={14} aria-hidden="true" /></Button>}
  </li>;
}

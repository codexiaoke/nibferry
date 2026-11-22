import type { ComponentPropsWithRef, ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import File from '@hugeicons/core-free-icons/File01Icon';
import Close from '@hugeicons/core-free-icons/Cancel01Icon';
import { Progress } from '../../feedback/Progress/Progress.js';
import { Button } from '../../input/Button/Button.js';

export type AttachmentTransfer =
  | { state: 'uploading'; progress?: number; onCancel?: () => void }
  | { state: 'failed' | 'cancelled'; message?: string; onRetry?: () => void };

export interface AttachmentItemProps extends Omit<ComponentPropsWithRef<'li'>, 'children'> {
  name: string;
  detail?: ReactNode;
  transfer?: AttachmentTransfer;
  icon?: ReactNode;
  preview?: ReactNode;
  imageOnly?: boolean;
  onOpen?: () => void;
  onRemove?: () => void;
}

export function AttachmentItem({ name, detail, transfer, icon, preview, imageOnly, onOpen, onRemove, ...props }: AttachmentItemProps) {
  const rawProgress = transfer?.state === 'uploading' ? transfer.progress : undefined;
  const percent = rawProgress !== undefined && Number.isFinite(rawProgress)
    ? Math.round(Math.max(0, Math.min(100, rawProgress))) : undefined;
  const filename = <>{preview != null && <span data-nf-attachment-preview="" aria-hidden="true">{preview}</span>}
    <span data-nf-attachment-caption="">{icon ?? <HugeiconsIcon icon={File} size={17} aria-hidden="true" />}
      <span data-nf-attachment-name="">{name}</span></span></>;
  return <li {...props} data-nf-attachment="" data-image-only={imageOnly && preview != null || undefined}>
    {onOpen ? <Button variant="ghost" data-nf-attachment-file="" title={name} onClick={onOpen}>{filename}</Button>
      : <span data-nf-attachment-file="">{filename}</span>}
    {transfer && <div data-nf-transfer={transfer.state}>
      {transfer.state === 'uploading' ? <>
        <Progress label={name + ' 上传进度'} value={percent} />
        <span>上传中 {percent === undefined ? '' : percent + '%'}</span>
        {transfer.onCancel && <Button variant="ghost" aria-label={'取消上传 ' + name} onClick={transfer.onCancel}>取消</Button>}
      </> : <><span role="status">{transfer.message ?? (transfer.state === 'failed' ? '上传失败' : '已取消')}</span>
        {transfer.onRetry && <Button variant="ghost" aria-label={'重新上传 ' + name} onClick={transfer.onRetry}>重试</Button>}</>}
    </div>}
    {detail && <small>{detail}</small>}
    {onRemove && <Button variant="ghost" data-nf-attachment-remove="" aria-label={'移除 ' + name} onClick={onRemove}>
      <HugeiconsIcon icon={Close} size={14} aria-hidden="true" /></Button>}
  </li>;
}

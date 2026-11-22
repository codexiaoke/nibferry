import type { ComponentPropsWithRef } from 'react';

export interface AttachmentListProps extends ComponentPropsWithRef<'ul'> {
  layout?: 'list' | 'strip';
}
export function AttachmentList({ layout = 'list', ...props }: AttachmentListProps) {
  return <ul aria-label="附件" {...props} data-nf-attachment-list={layout} />;
}

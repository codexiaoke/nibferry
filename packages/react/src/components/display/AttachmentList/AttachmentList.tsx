import type { ComponentPropsWithRef } from 'react';

export type AttachmentListProps = ComponentPropsWithRef<'ul'>;
export function AttachmentList(props: AttachmentListProps) {
  return <ul aria-label="附件" {...props} data-nf-attachment-list="" />;
}

'use client';

import { useState, type ComponentPropsWithRef } from 'react';

export interface AvatarProps extends ComponentPropsWithRef<'span'> {
  name: string;
  src?: string;
}

export function Avatar({ name, src, children, ...props }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string>();
  return <span data-nf-avatar="" role="img" aria-label={name} {...props}>
    {src && src !== failedSrc
      ? <img src={src} alt="" onError={() => setFailedSrc(src)} />
      : children ?? Array.from(name.trim()).slice(0, 2).join('').toUpperCase()}
  </span>;
}

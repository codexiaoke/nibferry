'use client';

import { useRef, type ComponentPropsWithRef } from 'react';

export function AttachmentThumbnail({ onLoad, alt, ...props }: ComponentPropsWithRef<'img'>) {
  const layer = useRef<HTMLCanvasElement>(null);
  return <span data-nf-attachment-thumbnail="">
    <img {...props} alt={alt} onLoad={event => {
      onLoad?.(event);
      const image = event.currentTarget;
      const canvas = layer.current;
      if (!canvas || !image.naturalWidth || !image.naturalHeight) return;
      if (getComputedStyle(canvas).display === 'none') return;
      const scale = 20 / Math.max(image.naturalWidth, image.naturalHeight);
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const style = getComputedStyle(image);
      canvas.style.objectFit = style.objectFit;
      canvas.style.objectPosition = style.objectPosition;
      canvas.removeAttribute('data-loaded');
      void canvas.offsetWidth;
      canvas.setAttribute('data-loaded', '');
    }} />
    <canvas ref={layer} aria-hidden="true" />
  </span>;
}

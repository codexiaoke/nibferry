'use client';

import { createContext, useRef, useState, type ComponentPropsWithRef, type RefObject } from 'react';

type FileReceiver = (files: File[]) => void;
export const ConversationFileReceiver = createContext<RefObject<FileReceiver | undefined> | null>(null);

export function FileDropArea({ children, receiver, onDragEnter, onDragOver, onDragLeave, onDrop, ...props }:
  ComponentPropsWithRef<'div'> & { receiver: () => FileReceiver | undefined }) {
  const [over, setOver] = useState(false);
  const depth = useRef(0);

  return <div {...props} data-file-hover={over || undefined}
    onDragEnter={event => {
      onDragEnter?.(event);
      if (!event.defaultPrevented && receiver() && event.dataTransfer.types.includes('Files')) {
        depth.current++;
        setOver(true);
      }
    }}
    onDragOver={event => {
      onDragOver?.(event);
      if (!event.defaultPrevented && receiver() && event.dataTransfer.types.includes('Files')) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        setOver(true);
      }
    }}
    onDragLeave={event => {
      onDragLeave?.(event);
      depth.current = Math.max(0, depth.current - 1);
      if (!depth.current) setOver(false);
    }}
    onDrop={event => {
      onDrop?.(event);
      depth.current = 0;
      setOver(false);
      const receive = receiver();
      if (!event.defaultPrevented && receive && event.dataTransfer.files.length) {
        event.preventDefault();
        receive(Array.from(event.dataTransfer.files));
      }
    }}>
    {children}
    {over && <div data-nf-file-drop-hint="" role="status"><span>松开以添加附件</span></div>}
  </div>;
}

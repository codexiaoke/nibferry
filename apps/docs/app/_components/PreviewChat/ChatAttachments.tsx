'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import FileIcon from '@hugeicons/core-free-icons/File01Icon';
import PdfIcon from '@hugeicons/core-free-icons/Pdf01Icon';
import { type AttachmentTransfer, AttachmentItem, AttachmentList, AttachmentThumbnail, ScrollArea } from 'nibferry';
import { documentPreview, fileKind } from './local-file-preview';
import './ChatAttachments.css';

export interface ChatFile {
  title: string;
  path: string;
  file: File;
}

export function useChatFiles(field: RefObject<HTMLTextAreaElement | null>) {
  const [files, setFiles] = useState<ChatFile[]>([]);
  // The preview simulates transport locally. Ready files have no transfer entry.
  const [transfers, setTransfers] = useState<Record<string, number | 'failed' | 'cancelled'>>({});
  const active = Object.values(transfers).some(value => typeof value === 'number');
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setTransfers(current => {
      const next = { ...current };
      for (const [id, value] of Object.entries(current)) {
        if (typeof value !== 'number') continue;
        if (!navigator.onLine) next[id] = 'failed';
        else if (value >= 80) delete next[id];
        else next[id] = value + 20;
      }
      return next;
    }), 260);
    return () => window.clearInterval(timer);
  }, [active]);
  function transferFor(id: string): AttachmentTransfer | undefined {
    const value = transfers[id];
    if (value === undefined) return;
    if (typeof value === 'number') return { state: 'uploading', progress: value,
      onCancel: () => setTransfers(all => ({ ...all, [id]: 'cancelled' })) };
    return { state: value, onRetry: () => setTransfers(all => ({ ...all, [id]: 0 })) };
  }
  const ready = files.every(file => transfers[file.path] === undefined);
  const input = useRef<HTMLInputElement>(null);
  const pickerFromMenu = useRef(false);

  function add(selected: File[]) {
    const additions = selected.map(file => ({ title: file.name, path: 'attachment:' + crypto.randomUUID(), file }));
    setTransfers(current => ({ ...current, ...Object.fromEntries(additions.map(file => [file.path, 0])) }));
    setFiles(current => [...current, ...additions]);
    field.current?.focus();
  }
  function remove(path: string) {
    setTransfers(current => {
      const next = { ...current };
      delete next[path];
      return next;
    });
    setFiles(current => current.filter(item => item.path !== path));
    field.current?.focus();
  }
  const picker = <input type="file" multiple hidden ref={input} aria-label="选择附件" onChange={event => {
    add(Array.from(event.currentTarget.files ?? []));
    event.currentTarget.value = '';
  }} />;
  function choose() {
    pickerFromMenu.current = true;
    input.current?.click();
  }
  function onCloseAutoFocus(event: Event) {
    if (!pickerFromMenu.current) return;
    pickerFromMenu.current = false;
    event.preventDefault();
    field.current?.focus();
  }
  return { files, setFiles, ready, transferFor, add, remove, clear: () => setFiles([]), choose, onCloseAutoFocus, picker };
}

function useObjectUrl(blob: Blob | undefined) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!blob) { setUrl(undefined); return; }
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);
  return url;
}

function useDocument(file: File) {
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof documentPreview>>>();
  useEffect(() => {
    let mounted = true;
    documentPreview(file).then(result => { if (mounted) setPreview(result); });
    return () => { mounted = false; };
  }, [file]);
  return preview;
}

function FileThumbnail({ file }: { file: File }) {
  const kind = fileKind(file);
  const preview = useDocument(file);
  const url = useObjectUrl(kind === 'image' ? file : preview?.thumbnail);
  if (url) return <AttachmentThumbnail src={url} alt="" className={'chat-file-thumb-' + kind} draggable={false} />;
  if (preview?.text) return <span className="chat-file-thumb-text">{preview.text.slice(0, 1200)}</span>;
  return <HugeiconsIcon icon={kind === 'pdf' ? PdfIcon : FileIcon} size={28} className="chat-file-placeholder" />;
}

export function ChatAttachments({ files, onOpen, onRemove, transferFor }: {
  files: ChatFile[]; onOpen: (source: ChatFile) => void; onRemove?: (path: string) => void;
  transferFor?: (id: string) => AttachmentTransfer | undefined;
}) {
  if (!files.length) return null;
  return <AttachmentList layout="strip" aria-label={onRemove ? '待发送附件' : '消息附件'}>
    {files.map(source => {
      const kind = fileKind(source.file);
      const format = !onRemove && kind !== 'image' && (source.title.match(/\.([a-z\d]+)$/i)?.[1].toUpperCase()
        || (kind === 'pdf' ? 'PDF' : kind === 'text' ? '文本' : '文件'));
      return <AttachmentItem key={source.path} name={source.title} transfer={transferFor?.(source.path)}
        preview={<FileThumbnail file={source.file} />} imageOnly={kind === 'image'}
        icon={format ? <span className={'chat-file-format chat-file-icon-' + kind} aria-hidden="true">{format}</span>
          : <HugeiconsIcon icon={kind === 'pdf' ? PdfIcon : FileIcon} className={'chat-file-icon-' + kind} size={15} aria-hidden="true" />}
        onOpen={() => onOpen(source)} onRemove={onRemove && (() => onRemove(source.path))} />;
    })}
  </AttachmentList>;
}

export function FileViewer({ file }: { file: File }) {
  const kind = fileKind(file);
  // Keep the browser's PDF renderer even when the file picker omitted the MIME type.
  const [blob] = useState(() => kind === 'pdf' ? file.slice(0, file.size, 'application/pdf') : file);
  const url = useObjectUrl(blob);
  const preview = useDocument(file);
  if (kind === 'image' && url) return <img src={url} alt={file.name} className="chat-file-image" />;
  if (kind === 'pdf' && url) return <object type="application/pdf" data={url} aria-label={file.name} className="chat-file-pdf">
    <a href={url} download={file.name}>下载 PDF</a>
  </object>;
  if (preview?.text !== undefined) return <ScrollArea className="chat-file-scroll" viewportProps={{ 'aria-label': file.name, role: 'region' }}>
    <pre className="chat-file-text">{preview.text}</pre>
  </ScrollArea>;
  if (!preview || !url) return null;
  return <div className="chat-file-unavailable"><p>此文件暂时无法预览</p><a href={url} download={file.name}>下载原文件</a></div>;
}

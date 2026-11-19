'use client';

import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Folder from '@hugeicons/core-free-icons/Folder01Icon';
import Chevron from '@hugeicons/core-free-icons/ArrowDown01Icon';
import Share from '@hugeicons/core-free-icons/Upload01Icon';
import List from '@hugeicons/core-free-icons/LeftToRightListBulletIcon';
import { PaneButton, PaneHeader } from '@nibferry/react';
import PreviewConversationMenu from '../PreviewConversationMenu/PreviewConversationMenu';
import './PreviewConversationHeader.css';

interface Props {
  title: string;
  active: boolean;
  summaryId: string;
  summaryOpen: boolean;
  onToggleSummary: () => void;
}

export default function PreviewConversationHeader({
  title, active, summaryId, summaryOpen, onToggleSummary,
}: Props) {
  const [status, setStatus] = useState('');
  useEffect(() => {
    if (!status) return;
    const timeout = setTimeout(() => setStatus(''), 2200);
    return () => clearTimeout(timeout);
  }, [status]);

  async function copy(value: string, success: string, failure: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(success);
    } catch {
      setStatus(failure);
    }
  }

  const share = () => copy(window.location.href, '已复制预览链接', '请从地址栏复制预览链接');
  const summaryLabel = summaryOpen ? '收起会话摘要' : '查看会话摘要';
  return (
    <PaneHeader
      className="workspace-preview-toolbar"
      aria-label="主区域标题栏"
      aria-hidden={!active}
      actions={active && (
        <>
          <PaneButton icon={Share} aria-label="复制预览链接" title="复制预览链接" onClick={share} />
          <PaneButton
            icon={List}
            paneId={summaryId}
            aria-expanded={summaryOpen}
            aria-label={summaryLabel}
            title={summaryLabel}
            onClick={onToggleSummary}
          />
        </>
      )}
    >
      {active && (
        <>
          <PreviewConversationMenu
            onCopyLink={share}
            onCopyTitle={() => copy(title, '已复制会话标题', '复制会话标题失败')}
            summaryId={summaryId}
            summaryLabel={summaryLabel}
            onToggleSummary={onToggleSummary}
          >
            <PaneButton
              className="preview-conversation-title"
              icon={Folder}
              text={<><span>{title}</span><HugeiconsIcon icon={Chevron} size={12} aria-hidden="true" /></>}
              title={title}
            />
          </PreviewConversationMenu>
          <span className="preview-share-status" role="status">{status}</span>
        </>
      )}
    </PaneHeader>
  );
}

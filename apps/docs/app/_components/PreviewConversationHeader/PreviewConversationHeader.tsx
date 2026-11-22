'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Folder from '@hugeicons/core-free-icons/Folder01Icon';
import Chevron from '@hugeicons/core-free-icons/ArrowDown01Icon';
import Share from '@hugeicons/core-free-icons/Upload01Icon';
import { Toast, Tooltip, PaneButton, PaneHeader, SummaryToggle } from 'nibferry';
import PreviewConversationMenu from '../PreviewConversationMenu/PreviewConversationMenu';
import './PreviewConversationHeader.css';

interface Props {
  title: string;
  project: string;
  active: boolean;
  summaryId: string;
  summaryOpen: boolean;
  onToggleSummary: () => void;
}

export default function PreviewConversationHeader({
  title, project, active, summaryId, summaryOpen, onToggleSummary,
}: Props) {
  const [notice, setNotice] = useState({ id: 0, message: '' });
  function setStatus(message: string) {
    setNotice(previous => ({ id: previous.id + 1, message }));
  }

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
          <Tooltip content="复制预览链接"><PaneButton icon={Share} aria-label="复制预览链接" onClick={share} /></Tooltip>
          <SummaryToggle
            paneId={summaryId}
            expanded={summaryOpen}
            onClick={onToggleSummary}
          />
        </>
      )}
    >
      {active && (
        <>
          <PreviewConversationMenu
            project={project}
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
          <Toast notificationId={notice.id} className="preview-share-status" message={notice.message} duration={2200} onDismiss={() => setStatus('')} />
        </>
      )}
    </PaneHeader>
  );
}

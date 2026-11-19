'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Globe from '@hugeicons/core-free-icons/GlobalIcon';
import {
  LeftPane,
  LeftPaneToggle,
  MainPane,
  PaneHeader,
  RightPane,
  RightPaneFullscreenToggle,
  RightPaneToggle,
  WorkspaceLayout,
  type WorkspacePane,
} from '@nibferry/react';
import PreviewConversationHeader from '../PreviewConversationHeader/PreviewConversationHeader';
import './WorkspacePreview.css';

const conversationTitle = '梳理 Nibferry 项目交接';

export default function WorkspacePreview({ toolbarStart }: { toolbarStart?: ReactNode }) {
  const workspace = useRef<HTMLDivElement>(null);
  const titlebar = useRef<HTMLDivElement>(null);
  const leftPane = useRef<HTMLElement>(null);
  const mainPane = useRef<HTMLDivElement>(null);
  const rightPane = useRef<HTMLElement>(null);
  const [compact, setCompact] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [compactPane, setCompactPane] = useState<WorkspacePane>('main');
  const [rightMode, setRightMode] = useState<'closed' | 'split' | 'fullscreen'>('closed');
  const [summaryOpen, setSummaryOpen] = useState(false);

  useLayoutEffect(() => {
    const node = workspace.current!;
    const main = mainPane.current!;
    const left = leftPane.current!;
    const right = rightPane.current!;
    const bar = titlebar.current!;
    const sync = () => {
      const narrow = node.clientWidth < 768;
      setCompact(narrow);
      // A sliding pane can be partly outside the window.
      const bounds = node.getBoundingClientRect();
      function visibleWidth(element: HTMLElement) {
        const pane = element.getBoundingClientRect();
        return Math.max(0, Math.min(bounds.right, pane.right) - Math.max(bounds.left, pane.left));
      }
      bar.style.setProperty('--preview-left-header-width', (narrow ? 0 : visibleWidth(left)) + 'px');
      bar.style.setProperty('--preview-right-header-width', visibleWidth(right) + 'px');
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    observer.observe(left, { box: 'border-box' });
    observer.observe(main, { box: 'border-box' });
    observer.observe(right, { box: 'border-box' });
    return () => observer.disconnect();
  }, []);

  const leftOpen = compact ? compactPane === 'left' : !desktopCollapsed;
  const rightOpen = compact ? compactPane === 'right' : rightMode !== 'closed';
  const fullscreen = !compact && rightMode === 'fullscreen';
  return (
    <div className="workspace-preview">
      <div className="workspace-preview-titlebar" ref={titlebar}>
        <div className="workspace-preview-window-controls">
          {toolbarStart}
          <LeftPaneToggle
            paneId="preview-left"
            expanded={leftOpen}
            onClick={() => {
              if (compact) setCompactPane(leftOpen ? 'main' : 'left');
              else setDesktopCollapsed(leftOpen);
            }}
          />
        </div>
        <PreviewConversationHeader
          title={conversationTitle}
          active={compact ? compactPane === 'main' : !fullscreen}
          summaryId="preview-summary"
          summaryOpen={summaryOpen}
          onToggleSummary={() => setSummaryOpen(!summaryOpen)}
        />
        <PaneHeader className="workspace-preview-right-toolbar" role="group" aria-label="右侧工作区工具栏"
          actions={<>
            {!compact && rightOpen && (
              <RightPaneFullscreenToggle
                paneId="preview-right"
                fullscreen={fullscreen}
                onClick={() => setRightMode(fullscreen ? 'split' : 'fullscreen')}
              />
            )}
            {!fullscreen && (
              <RightPaneToggle
                paneId="preview-right"
                expanded={rightOpen}
                onClick={() => {
                  if (compact) setCompactPane(rightOpen ? 'main' : 'right');
                  else setRightMode(rightOpen ? 'closed' : 'split');
                }}
              />
            )}
          </>}
        >
          {rightOpen && (
            <span className="workspace-preview-tab">
              <HugeiconsIcon icon={Globe} size={14} aria-hidden="true" />
              <span>新标签页</span>
            </span>
          )}
        </PaneHeader>
      </div>
      <WorkspaceLayout ref={workspace} compactPane={compactPane}>
        <LeftPane
          ref={leftPane}
          id="preview-left"
          resizable
          collapsed={compact ? undefined : desktopCollapsed}
          aria-label="左侧"
        >
          左侧
        </LeftPane>
        <MainPane ref={mainPane} role="main" id="content" hidden={fullscreen}>
          主体
          <aside id="preview-summary" className="workspace-preview-summary" aria-label="会话摘要" hidden={!summaryOpen}>
            <strong>Nibferry</strong>
            <p>{conversationTitle}</p>
          </aside>
        </MainPane>
        <RightPane
          ref={rightPane}
          id="preview-right"
          className={fullscreen ? 'workspace-preview-fullscreen' : undefined}
          resizable
          collapsed={compact ? undefined : !rightOpen}
          fullscreen={compact ? undefined : fullscreen}
          aria-label="右侧"
        >
          右侧
        </RightPane>
      </WorkspaceLayout>
    </div>
  );
}

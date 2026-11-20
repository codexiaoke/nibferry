'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import Globe from '@hugeicons/core-free-icons/GlobalIcon';
import Chat from '@hugeicons/core-free-icons/BubbleChatIcon';
import File from '@hugeicons/core-free-icons/File01Icon';
import Changes from '@hugeicons/core-free-icons/FileEditIcon';
import {
  LeftPane,
  LeftPaneToggle,
  MainPane,
  PaneHeader,
  RightPane,
  RightPaneFullscreenToggle,
  RightPaneToggle,
  SummaryCard,
  SummaryGroup,
  SummaryItem,
  WorkspaceLayout,
  WorkspaceTab,
  WorkspaceTabAdd,
  WorkspaceTabList,
  type WorkspacePane,
} from '@nibferry/react';
import PreviewConversationHeader from '../PreviewConversationHeader/PreviewConversationHeader';
import { basePath } from '../../site-links';
import './WorkspacePreview.css';

const conversationTitle = '梳理 Nibferry 项目交接';
const sources = [
  { title: '组件与工作区设计规范', path: '/docs/component-design/' },
  { title: '基础布局组件', path: '/docs/layout/' },
];
type PreviewPage = { title: string; path?: string };
const blankPage: PreviewPage = { title: '新标签页' };
const firstTab = 'preview-tab-1';

export default function WorkspacePreview({ toolbarStart }: { toolbarStart?: ReactNode }) {
  const workspace = useRef<HTMLDivElement>(null);
  const titlebar = useRef<HTMLDivElement>(null);
  const leftPane = useRef<HTMLElement>(null);
  const mainPane = useRef<HTMLDivElement>(null);
  const rightPane = useRef<HTMLElement>(null);
  const rightToggle = useRef<HTMLButtonElement>(null);
  const [compact, setCompact] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [compactPane, setCompactPane] = useState<WorkspacePane>('main');
  const [rightMode, setRightMode] = useState<'closed' | 'split' | 'fullscreen'>('closed');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [pages, setPages] = useState<Record<string, PreviewPage>>({ [firstTab]: blankPage });
  const [order, setOrder] = useState([firstTab]);
  const [activeId, setActiveId] = useState<string | null>(firstTab);
  const nextId = useRef(2);
  const activeButton = useRef<HTMLButtonElement>(null);
  const restoreTabFocus = useRef(false);

  function addTab(page: PreviewPage) {
    const id = 'preview-tab-' + nextId.current++;
    setPages(current => ({ ...current, [id]: page }));
    setOrder(current => [...current, id]);
    setActiveId(id);
    restoreTabFocus.current = true;
  }

  function closeTab(id: string) {
    const remaining = order.filter(tab => tab !== id);
    setPages(current => {
      const updated = { ...current };
      delete updated[id];
      return updated;
    });
    setOrder(remaining);
    if (activeId === id) {
      setActiveId(remaining[Math.min(order.indexOf(id), remaining.length - 1)] ?? null);
    }
    if (!remaining.length) {
      setCompactPane('main');
      setRightMode('closed');
    }
    restoreTabFocus.current = true;
  }

  function openSource(selected: (typeof sources)[number]) {
    const existing = order.find(id => pages[id].path === selected.path);
    if (existing === activeId && rightOpen) {
      activeButton.current?.focus();
      return;
    }
    if (existing) setActiveId(existing);
    else if (activeId && !pages[activeId].path) {
      setPages(current => ({ ...current, [activeId]: selected }));
    } else addTab(selected);
    restoreTabFocus.current = true;
    if (compact) setCompactPane('right');
    else if (rightMode === 'closed') setRightMode('split');
  }

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
  useLayoutEffect(() => {
    const tab = activeButton.current;
    if (rightOpen) tab?.parentElement?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (restoreTabFocus.current) {
      (tab ?? rightToggle.current)?.focus();
      restoreTabFocus.current = false;
    }
  }, [activeId, order, pages, rightOpen]);

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
                ref={rightToggle}
                paneId="preview-right"
                expanded={rightOpen}
                onClick={() => {
                  if (!rightOpen && !order.length) addTab(blankPage);
                  if (compact) setCompactPane(rightOpen ? 'main' : 'right');
                  else setRightMode(rightOpen ? 'closed' : 'split');
                }}
              />
            )}
          </>}
        >
          {rightOpen && (
            <>
              <WorkspaceTabList aria-label="右侧工作区标签" onReorder={setOrder}>
                {order.map(id => (
                  <WorkspaceTab key={id} id={id} panelId={id + '-panel'} selected={id === activeId}
                    ref={id === activeId ? activeButton : undefined} label={pages[id].title} icon={Globe}
                    onClick={() => setActiveId(id)} onClose={() => closeTab(id)} />
                ))}
              </WorkspaceTabList>
              <WorkspaceTabAdd onClick={() => addTab(blankPage)} />
            </>
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
          <SummaryCard id="preview-summary" className="workspace-preview-summary" aria-label="会话摘要" hidden={!summaryOpen}>
            <SummaryGroup label="Nibferry">
              <SummaryItem icon={Changes} trailing={`${sources.length} 份文档`}>变更</SummaryItem>
            </SummaryGroup>
            <SummaryGroup label="侧边聊天">
              <SummaryItem icon={Chat}>{conversationTitle}</SummaryItem>
            </SummaryGroup>
            <SummaryGroup label="来源">
              {sources.map((entry) => (
                <SummaryItem key={entry.path} icon={File} onSelect={() => openSource(entry)}>
                  {entry.title}
                </SummaryItem>
              ))}
            </SummaryGroup>
          </SummaryCard>
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
          {/* Keep document frames in creation order so sorting tabs preserves reading positions. */}
          {Object.entries(pages).map(([id, page]) => (
            <div key={id} id={id + '-panel'} role="tabpanel" aria-labelledby={id}
              className="workspace-preview-tabpanel" hidden={id !== activeId}>
              {page.path ? (
                <iframe className="workspace-preview-source" title={page.title} src={basePath + page.path} />
              ) : (
                <SummaryGroup label="来源">
                  {sources.map(entry => (
                    <SummaryItem key={entry.path} icon={File} onSelect={() => openSource(entry)}>{entry.title}</SummaryItem>
                  ))}
                </SummaryGroup>
              )}
            </div>
          ))}
        </RightPane>
      </WorkspaceLayout>
    </div>
  );
}

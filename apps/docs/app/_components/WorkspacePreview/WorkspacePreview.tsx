'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import Globe from '@hugeicons/core-free-icons/GlobalIcon';
import Chat from '@hugeicons/core-free-icons/BubbleChatIcon';
import File from '@hugeicons/core-free-icons/File01Icon';
import Changes from '@hugeicons/core-free-icons/FileEditIcon';
import Home from '@hugeicons/core-free-icons/Home09Icon';
import Documents from '@hugeicons/core-free-icons/Copy01Icon';
import History from '@hugeicons/core-free-icons/Clock01Icon';
import More from '@hugeicons/core-free-icons/MoreHorizontalIcon';
import Branch from '@hugeicons/core-free-icons/GitBranchIcon';
import Grid from '@hugeicons/core-free-icons/DashboardSquare01Icon';
import {
  DropdownMenu,
  LeftPane,
  LeftPaneToggle,
  MainPane,
  MenuContent,
  MenuItem,
  MenuTrigger,
  NavigationRail,
  NavigationRailItem,
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
import PreviewConversationList, { initialProjects } from '../PreviewConversationList/PreviewConversationList';
import { basePath } from '../../site-links';
import type { SearchEntry } from '../../../lib/docs';
import './WorkspacePreview.css';

const sources = [
  { title: '组件与工作区设计规范', path: '/docs/component-design/' },
  { title: '基础布局组件', path: '/docs/layout/' },
];
const navigationGuide = { title: '项目与会话列表', path: '/docs/conversation-list/' };
type PreviewPage = { title: string; path?: string };
const blankPage: PreviewPage = { title: '新标签页' };
const firstTab = 'preview-tab-1';

export default function WorkspacePreview({ toolbarStart, searchEntries }: { toolbarStart?: ReactNode; searchEntries: SearchEntry[] }) {
  const workspace = useRef<HTMLDivElement>(null);
  const titlebar = useRef<HTMLDivElement>(null);
  const leftPane = useRef<HTMLElement>(null);
  const mainPane = useRef<HTMLDivElement>(null);
  const rightPane = useRef<HTMLElement>(null);
  const rightToggle = useRef<HTMLButtonElement>(null);
  const leftToggle = useRef<HTMLButtonElement>(null);
  const [projects, setProjects] = useState(initialProjects);
  const [conversationId, setConversationId] = useState(initialProjects[0].conversations[0].id);
  const project = projects.find(entry => entry.conversations.some(chat => chat.id === conversationId))!;
  const conversation = project.conversations.find(chat => chat.id === conversationId)!;
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
      const railWidth = bounds.left - bar.getBoundingClientRect().left;
      bar.style.setProperty('--preview-left-header-width', (narrow ? 0 : railWidth + visibleWidth(left)) + 'px');
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
  const currentPath = rightOpen && activeId ? pages[activeId].path : undefined;
  const visibleChats = project.conversations.filter(chat => !chat.archived);

  function selectConversation(id: string) {
    setConversationId(id);
    if (compact) {
      setCompactPane('main');
      leftToggle.current?.focus();
    } else if (fullscreen) {
      setRightMode('split');
    }
  }

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
            ref={leftToggle}
            paneId="preview-left"
            expanded={leftOpen}
            onClick={() => {
              if (compact) setCompactPane(leftOpen ? 'main' : 'left');
              else setDesktopCollapsed(leftOpen);
            }}
          />
        </div>
        <PreviewConversationHeader
          title={conversation.title}
          project={project.name}
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
      <NavigationRail label="主导航" className="workspace-preview-rail">
        <NavigationRailItem label="首页" icon={Home} className="workspace-preview-home" current={!currentPath}
          onClick={() => {
            setDesktopCollapsed(false);
            setRightMode('closed');
            setCompactPane('main');
          }} />
        <NavigationRailItem label="设计规范" icon={Documents} current={currentPath === sources[0].path}
          onClick={() => openSource(sources[0])} />
        <DropdownMenu modal={false}>
          <MenuTrigger asChild>
            <NavigationRailItem label="项目会话" icon={History} disabled={!visibleChats.length} />
          </MenuTrigger>
          <MenuContent side="right" className="preview-conversation-menu" aria-label="项目会话">
            {visibleChats.map(chat => <MenuItem key={chat.id} onSelect={() => selectConversation(chat.id)}>{chat.title}</MenuItem>)}
          </MenuContent>
        </DropdownMenu>
        <NavigationRailItem label="会话摘要" icon={Chat} paneId="preview-summary" aria-expanded={summaryOpen && !fullscreen}
          onClick={() => {
            if (fullscreen) setRightMode('split');
            setSummaryOpen(fullscreen || !summaryOpen);
          }} />
        <DropdownMenu modal={false}>
          <MenuTrigger asChild><NavigationRailItem label="更多导航" icon={More} /></MenuTrigger>
          <MenuContent side="right" className="preview-conversation-menu" aria-label="更多导航">
            <MenuItem onSelect={() => openSource({ title: '文档概览', path: '/docs/' })}>文档概览</MenuItem>
            <MenuItem onSelect={() => openSource({ title: '接入项目', path: '/docs/installation/' })}>接入项目</MenuItem>
          </MenuContent>
        </DropdownMenu>
        <hr aria-hidden="true" />
        <NavigationRailItem label="项目导航指南" icon={Branch} current={currentPath === navigationGuide.path}
          onClick={() => openSource(navigationGuide)} />
        <NavigationRailItem label="布局组件指南" icon={Grid} current={currentPath === sources[1].path}
          onClick={() => openSource(sources[1])} />
      </NavigationRail>
      <WorkspaceLayout ref={workspace} compactPane={compactPane}>
        <LeftPane
          ref={leftPane}
          id="preview-left"
          resizable
          collapsed={compact ? undefined : desktopCollapsed}
          aria-label="左侧"
        >
          <PreviewConversationList projects={projects} currentId={conversationId}
            searchEntries={searchEntries} onOpenPage={openSource}
            onProjectChange={next => setProjects(all => all.map(entry => entry.id === next.id ? next : entry))}
            onSelect={selectConversation} />
        </LeftPane>
        <MainPane ref={mainPane} role="main" id="content" hidden={fullscreen}>
          主体
          <SummaryCard id="preview-summary" className="workspace-preview-summary" aria-label="会话摘要" hidden={!summaryOpen}>
            <SummaryGroup label={project.name}>
              <SummaryItem icon={Changes} trailing={`${sources.length} 份文档`}>变更</SummaryItem>
            </SummaryGroup>
            <SummaryGroup label="侧边聊天">
              <SummaryItem icon={Chat}>{conversation.title}</SummaryItem>
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

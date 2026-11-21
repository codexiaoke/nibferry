'use client';

import { useId, useLayoutEffect, useRef, useState } from 'react';
import {
  Dialog, Inline, LeftPane, LeftPaneToggle, MainPane, PaneHeader, RightPane,
  RightPaneFullscreenToggle, RightPaneToggle, ScrollArea, Stack, SummaryCard,
  SummaryGroup, SummaryItem, SummaryToggle, WorkspaceLayout, type WorkspacePane,
} from 'nibferry';
import File from '@hugeicons/core-free-icons/File01Icon';

function WorkspaceSample() {
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const [compact, setCompact] = useState(true);
  const [pane, setPane] = useState<WorkspacePane>('main');
  const [left, setLeft] = useState(true);
  const [right, setRight] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  useLayoutEffect(() => {
    const element = root.current!;
    const measure = () => setCompact(element.clientWidth < 768);
    const observer = new ResizeObserver(measure);
    measure();
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const leftShown = !fullscreen && (compact ? pane === 'left' : left);
  const rightShown = fullscreen || (compact ? pane === 'right' : right);
  return (
    <div className="example-workspace">
      <PaneHeader actions={<>
        <LeftPaneToggle paneId={id + '-left'} expanded={leftShown} onClick={() => {
          setFullscreen(false);
          if (compact) setPane(leftShown ? 'main' : 'left');
          else setLeft(!leftShown);
        }} />
        <RightPaneToggle paneId={id + '-right'} expanded={rightShown} onClick={() => {
          setFullscreen(false);
          if (compact) setPane(rightShown ? 'main' : 'right');
          else setRight(!rightShown);
        }} />
        <RightPaneFullscreenToggle paneId={id + '-right'} fullscreen={fullscreen}
          onClick={() => setFullscreen(!fullscreen)} />
      </>}>工作区</PaneHeader>
      <WorkspaceLayout ref={root} compactPane={pane} expandedPane={fullscreen ? 'right' : undefined}>
        <LeftPane id={id + '-left'} aria-label="项目" collapsed={!compact && !left} defaultWidth={160} resizable>
          <strong>项目</strong><span>Nibferry</span>
        </LeftPane>
        <MainPane aria-label="当前对话">
          <strong>当前对话</strong><span>可以打开右栏并排阅读资料。</span>
        </MainPane>
        <RightPane id={id + '-right'} aria-label="资料" collapsed={!compact && !right && !fullscreen}
          fullscreen={fullscreen} defaultWidth={190} resizable>
          <strong>资料</strong><span>组件与工作区设计规范</span>
        </RightPane>
      </WorkspaceLayout>
    </div>
  );
}

export function WorkspaceDemo() {
  const [large, setLarge] = useState(false);
  return (
    <div className="component-demo example-workspace-stage">
      <WorkspaceSample />
      <button className="example-expand" type="button" aria-haspopup="dialog" onClick={() => setLarge(true)}>放大工作区示例</button>
      <Dialog aria-label="工作区布局示例" className="example-wide-dialog" open={large} onOpenChange={setLarge}>
        {large && <WorkspaceSample />}
        <button type="button" className="example-button" onClick={() => setLarge(false)}>关闭预览</button>
      </Dialog>
    </div>
  );
}

export function SpacingDemo() {
  const [wide, setWide] = useState(false);
  const gap = wide ? 'lg' : 'sm';
  return (
    <div className="component-demo">
      <Stack gap={gap} className="example-spacing">
        <Inline gap={gap} wrap>
          {['对话', '文档', '摘要'].map(label => <span key={label}>{label}</span>)}
        </Inline>
        <button type="button" className="example-button" aria-pressed={wide} onClick={() => setWide(!wide)}>
          加大间距
        </button>
      </Stack>
    </div>
  );
}

const outline = ['接入项目', '对话与消息', '输入与模型', '执行过程', '导航与工作区', '菜单与浮层', '摘要面板', '主题配置'];

export function ScrollDemo() {
  return (
    <div className="component-demo">
      <ScrollArea className="example-scroll" viewportProps={{ 'aria-label': '可滚动的文档目录', role: 'region' }}>
        <ul>{outline.map(label => <li key={label}>{label}</li>)}</ul>
      </ScrollArea>
    </div>
  );
}

export function SummaryDemo() {
  const [expanded, setExpanded] = useState(true);
  const id = useId();
  return (
    <div className="component-demo">
      <div className="example-summary">
        <PaneHeader actions={<SummaryToggle paneId={id} expanded={expanded} onClick={() => setExpanded(!expanded)} />}>
          会话摘要
        </PaneHeader>
        <SummaryCard id={id} hidden={!expanded} aria-label="摘要内容">
          <SummaryGroup label="来源">
            <SummaryItem icon={File} trailing="文档">组件指南</SummaryItem>
            <SummaryItem icon={File} trailing="文档">主题配置</SummaryItem>
          </SummaryGroup>
        </SummaryCard>
      </div>
    </div>
  );
}

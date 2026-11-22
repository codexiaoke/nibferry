'use client';

import { useId, useRef, useState } from 'react';
import { Button, MainPane, PaneHeader, RightPane, Stack, WorkspaceLayout } from 'nibferry';
import DocumentAssistant from './DocumentAssistant';

export default function HandbookPage() {
  const [readingSource, setReadingSource] = useState(false);
  const [pane, setPane] = useState<'main' | 'right'>('right');
  const titleId = useId();
  const title = useRef<HTMLHeadingElement>(null);
  const assistant = useRef<HTMLElement>(null);

  function openSource() {
    setReadingSource(true);
    setPane('main');
    requestAnimationFrame(() => title.current?.focus());
  }

  function resumeChat() {
    setPane('right');
    requestAnimationFrame(() => assistant.current?.focus());
  }

  return (
    <WorkspaceLayout compactPane={pane} style={{ height: '100%' }}>
      <MainPane style={{ padding: 'var(--nf-space-lg)' }}>
        <Stack>
          <PaneHeader actions={<Button variant="ghost" onClick={resumeChat}>继续提问</Button>}>
            开发手册
          </PaneHeader>
          <article aria-labelledby={titleId}>
            <h3 id={titleId} ref={title} tabIndex={-1}>{readingSource ? '接入项目' : '组件接入约定'}</h3>
            {readingSource ? <>
              <p>项目使用 React 19 和 React DOM 19。</p>
              <p>在应用入口引入一次 <code>nibferry/styles.css</code>。</p>
            </> : <p>新页面共用项目的 React 版本和全局样式入口。具体版本和样式路径见接入说明。</p>}
          </article>
        </Stack>
      </MainPane>
      <RightPane width={336} ref={assistant} tabIndex={-1} aria-label="知识库助手"
        style={{ borderInlineStart: '1px solid var(--nf-line)' }}>
        <DocumentAssistant onOpenLink={openSource} />
      </RightPane>
    </WorkspaceLayout>
  );
}

import type { Metadata } from 'next';
import { LeftPane, MainPane, RightPane, WorkspaceLayout } from '@nibferry/react';
import './playground.css';

export const metadata: Metadata = { title: '交互预览 · Nibferry' };

export default function PlaygroundPage() {
  return (
    <WorkspaceLayout className="layout-preview">
      <LeftPane aria-label="左侧">左侧</LeftPane>
      <MainPane role="main" id="content">主体</MainPane>
      <RightPane aria-label="右侧">右侧</RightPane>
    </WorkspaceLayout>
  );
}

import { basePath } from '../../site-links';
import { layoutSource } from '../WorkspacePreview/preview-sources';

export const layoutCitations = ['调整分栏宽度', '展开与还原'].map(section => ({
  ...layoutSource, section, href: basePath + layoutSource.path + '#' + encodeURIComponent(section),
}));

export const layoutMarkdownLines = [
  '### 工作区布局',
  '',
  '1. 左栏列出项目和会话。',
  '2. 主区域保留对话，右栏按需打开资料。',
  '',
  '| 区域 | 组件 |',
  '| --- | --- |',
  '| 项目 | `LeftPane` |',
  '| 对话 | `MainPane` |',
  '| 资料 | `RightPane` |',
  '',
  '```tsx',
  '<WorkspaceLayout>',
  '  <MainPane>对话</MainPane>',
  '  <RightPane resizable>资料</RightPane>',
  '</WorkspaceLayout>',
  '```',
  '',
  '拖动分隔线可以[调整分栏宽度](' + layoutCitations[0].href + ')。窄屏下可用[展开与还原](' + layoutCitations[1].href + ')切换到资料。',
];

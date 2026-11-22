export interface PreviewSource {
  title: string;
  path: string;
  section?: string;
  file?: File;
}

export const layoutSource: PreviewSource = { title: '基础布局组件', path: '/docs/layout/' };

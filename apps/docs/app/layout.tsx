import type { Metadata } from 'next';
import '@nibferry/react/styles.css';
import './site.css';

export const metadata: Metadata = {
  title: 'Nibferry',
  description: 'Nibferry 通用 React UI 组件库文档。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

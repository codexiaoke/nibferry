import type { Metadata } from 'next';
import 'nibferry/styles.css';
import './site.css';
import './docs.css';
import './motion.css';

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

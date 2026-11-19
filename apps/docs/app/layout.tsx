import type { Metadata } from 'next';
import '@nibferry/react/styles.css';
import './site.css';
import './docs.css';
import './motion.css';
import SiteHeader from './_components/SiteHeader/SiteHeader';

import { getSearchIndex } from '../lib/docs';

export const metadata: Metadata = {
  title: 'Nibferry',
  description: 'Nibferry 通用 React UI 组件库文档。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteHeader entries={getSearchIndex()} />
        {children}
      </body>
    </html>
  );
}

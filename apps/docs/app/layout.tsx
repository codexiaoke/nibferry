import type { Metadata } from 'next';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import FeatherIcon from '@hugeicons/core-free-icons/FeatherIcon';
import '@nibferry/react/styles.css';
import './site.css';

export const metadata: Metadata = {
  title: 'Nibferry · Agent 任务组件',
  description: '为 React 应用提供任务输入、执行步骤和用户决策界面。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="site-header">
          <div className="header-inner">
            <Link href="/" className="brand" aria-label="Nibferry 首页">
              <span className="brand-icon">
                <HugeiconsIcon icon={FeatherIcon} size={21} aria-hidden="true" />
              </span>
              Nibferry
            </Link>
            <nav aria-label="主导航">
              <Link href="/">组件示例</Link>
              <Link href="/#design">设计参数</Link>
              <Link href="/guide">接入指南</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}

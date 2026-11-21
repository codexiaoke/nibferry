import Link from 'next/link';
import SiteHeader from './_components/SiteHeader/SiteHeader';
import { getSearchIndex } from '../lib/docs';
import { HugeiconsIcon } from '@hugeicons/react';
import Layers from '@hugeicons/core-free-icons/Layers01Icon';
import Arrow from '@hugeicons/core-free-icons/ArrowRight02Icon';
import { palettes, theme } from 'nibferry/theme';
import BuildCommand from './_components/BuildCommand/BuildCommand';
import CodeExample from './_components/CodeExample/CodeExample';
import { repository } from './site-links';

const resources = [
  {
    label: '颜色与表面',
    detail: Object.keys(theme.color).length + ' 个颜色角色',
    href: '/docs/colors',
  },
  {
    label: '边框与层级',
    detail: '边框、焦点、阴影与遮罩',
    href: '/docs/surfaces',
  },
  {
    label: '动效与过渡',
    detail: Object.keys(theme.motion).length + ' 个时长与三次贝塞尔曲线',
    href: '/docs/motion',
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader entries={getSearchIndex()} />
      <main className="frame" id="content">
        <section className="hero">
          <div className="hero-copy">
            <h1>
              可定制的 React
              <br />
              界面组件库
            </h1>
            <p>
              用设计 Token 管理配色与动效，
              <br className="wide-break" />
              在多个产品中共享主题。
            </p>
            <div className="hero-actions">
              <BuildCommand />
              <Link className="text-link" href="/playground/">
                打开交互预览
                <HugeiconsIcon icon={Arrow} size={17} aria-hidden="true" />
              </Link>
            </div>
            <div className="hero-meta">
              <span>React 19</span>
              <span>TypeScript</span>
              <span>CSS 变量</span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <HugeiconsIcon icon={Layers} size={336} strokeWidth={2.4} />
          </div>
        </section>
        <section className="package-section" id="package">
          <h2>nibferry</h2>
          <p>读取主题数据，或在 CSS 中覆盖默认值。</p>
          <CodeExample />
          <section className="palette-section">
            <div className="example-heading">
              <h3>浅色与石墨配色</h3>
              <Link className="text-link" href="/docs/colors">
                读取预设 <HugeiconsIcon icon={Arrow} size={14} aria-hidden="true" />
              </Link>
            </div>
            <div className="palette-board">
              <pre>
                <code>
                  {'import { palettes } from "nibferry/theme";\n\nconst light = '}
                  <b>palettes.neutral</b>
                  {';\nconst dark = '}
                  <b>palettes.graphite</b>
                  {';\n\nconst background = light.canvas;\nconst foreground = light.ink;'}
                </code>
              </pre>
              <div className="palette-samples">
                {Object.entries(palettes).map(([name, palette]) => (
                  <div
                    key={name}
                    className="palette-sample"
                    style={{
                      background: palette.canvas,
                      color: palette.ink,
                      borderColor: palette.line,
                    }}
                  >
                    <strong>{name === 'neutral' ? '浅色' : '石墨'}</strong>
                    <div>
                      {(['canvas', 'line', 'muted', 'ink', 'accent'] as const).map((role) => (
                        <span
                          key={role}
                          title={role + ' ' + palette[role]}
                          style={{ background: palette[role], borderColor: palette.line }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <div className="resource-section">
            <h3>设计规范</h3>
            <div className="resource-links">
              {resources.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span>
                    {item.label}
                    <small>{item.detail}</small>
                  </span>
                  <HugeiconsIcon icon={Arrow} size={16} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="start-section">
          <h2>开始使用 Nibferry</h2>
          <div className="hero-actions">
            <BuildCommand />
            <Link className="text-link" href="/docs/installation">
              接入指南
              <HugeiconsIcon icon={Arrow} size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="frame footer-inner">
          <Link href="/" className="wordmark">
            <HugeiconsIcon icon={Layers} size={22} aria-hidden="true" />
            Nibferry
          </Link>
          <div>
            <h2>文档</h2>
            <Link href="/docs/installation">接入指南</Link>
            <Link href="/docs/theme">设计规范</Link>
          </div>
          <div>
            <h2>资源</h2>
            <Link href="/docs/theme/#variables">Token 浏览器</Link>
            <a href={repository}>GitHub</a>
          </div>
          <div>
            <h2>项目</h2>
            <Link href="/docs/contributing">贡献指南</Link>
            <a href={repository + '/issues'}>反馈问题</a>
          </div>
        </div>
      </footer>
    </>
  );
}

import Link from 'next/link';
import { theme } from '@nibferry/react/theme';
import { NoteDemo } from '../components/NoteDemo';

const colors = [
  ['主操作', theme.color.primary],
  ['正文', theme.color.ink],
  ['次要文字', theme.color.secondary],
  ['分隔线', theme.color.line],
  ['局部强调', theme.color.accent],
];

export default function Home() {
  return (
    <main className="page">
      <div className="intro">
        <h1>任务输入与决策</h1>
        <p>在同一个输入区交代任务、查看进度，并在 Agent 需要选择时接手。</p>
      </div>
      <NoteDemo />
      <section className="design-section" id="design">
        <div className="section-title">
          <h2>设计参数</h2>
          <Link href="/guide">接入指南</Link>
        </div>
        <div className="specs">
          <div>
            <h3>颜色</h3>
            <div className="swatches">
              {colors.map(([name, value]) => (
                <div className="swatch" key={name}>
                  <i aria-hidden="true" style={{ backgroundColor: value }} />
                  <span>
                    {name}
                    <code>{value}</code>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3>动效</h3>
            <dl className="timings">
              {[
                ['操作反馈', theme.motion.feedback],
                ['步骤展开', theme.motion.reveal],
                ['输入区切换', theme.motion.surface],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value} ms</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </main>
  );
}

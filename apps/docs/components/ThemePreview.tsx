'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeProvider } from '@nibferry/react';
import { palettes, theme, type ThemeColors } from '@nibferry/react/theme';
import { NoteDemo } from './NoteDemo';

const colorFields = [
  ['primary', '主操作'],
  ['onPrimary', '按钮文字'],
  ['ink', '正文'],
  ['secondary', '次要文字'],
  ['line', '分隔线'],
  ['accent', '局部强调'],
  ['accentText', '强调文字'],
] as const;
const motionFields = [
  ['feedback', '操作反馈'],
  ['reveal', '步骤展开'],
  ['surface', '输入区切换'],
] as const;

export function ThemePreview() {
  const [palette, setPalette] = useState<keyof typeof palettes>('neutral');
  const [overrides, setOverrides] = useState<Partial<ThemeColors>>({});
  const [timing, setTiming] = useState(theme.motion);
  const [disabled, setDisabled] = useState(false);
  const colors = { ...palettes[palette], ...overrides };

  return (
    <>
      <ThemeProvider colors={colors} motion={disabled ? false : timing}>
        <NoteDemo />
      </ThemeProvider>
      <section className="design-section" id="design">
        <div className="section-title">
          <h2>设计参数</h2>
          <Link href="/guide#theme">配置用法</Link>
        </div>
        <div className="specs">
          <div>
            <div className="config-heading">
              <h3>颜色</h3>
              <label className="palette-select">
                配色
                <select
                  value={palette}
                  onChange={(event) => {
                    setPalette(event.target.value as keyof typeof palettes);
                    setOverrides({});
                  }}
                >
                  <option value="neutral">默认黑白</option>
                  <option value="graphite">石墨深色</option>
                </select>
              </label>
            </div>
            <div className="swatches">
              {colorFields.map(([role, name]) => (
                <label className="swatch" key={role}>
                  <input
                    type="color"
                    aria-label={name + '颜色'}
                    value={colors[role]}
                    onChange={(event) =>
                      setOverrides({ ...overrides, [role]: event.target.value.toUpperCase() })
                    }
                  />
                  <span>
                    {name}
                    <code>{colors[role]}</code>
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="config-heading">
              <h3>动效</h3>
              <label className="motion-toggle">
                <input
                  type="checkbox"
                  checked={disabled}
                  onChange={(event) => setDisabled(event.target.checked)}
                />
                关闭示例动效
              </label>
            </div>
            <div className="timings">
              {motionFields.map(([key, label]) => (
                <label key={key}>
                  <span>{label}</span>
                  <input
                    type="range"
                    min="0"
                    max="600"
                    step="10"
                    aria-label={label + '时长'}
                    aria-valuetext={timing[key] + ' 毫秒'}
                    value={timing[key]}
                    disabled={disabled}
                    onChange={(event) =>
                      setTiming({ ...timing, [key]: event.target.valueAsNumber })
                    }
                  />
                  <output>{timing[key]} ms</output>
                </label>
              ))}
            </div>
            <p className="system-motion">系统已启用减少动态效果。</p>
          </div>
        </div>
      </section>
    </>
  );
}

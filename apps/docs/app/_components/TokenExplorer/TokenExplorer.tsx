'use client';

import { useRef, useState } from 'react';
import { Inline } from 'nibferry';
import { palettes, theme } from 'nibferry/theme';
import { HugeiconsIcon } from '@hugeicons/react';
import Clock from '@hugeicons/core-free-icons/Time02Icon';
import Curve from '@hugeicons/core-free-icons/Activity01Icon';
import Search from '@hugeicons/core-free-icons/Search01Icon';
import Close from '@hugeicons/core-free-icons/Cancel01Icon';

const groups = [
  { id: 'all', name: '全部' },
  { id: 'color', name: '颜色' },
  { id: 'space', name: '间距' },
  { id: 'layout', name: '布局' },
  { id: 'motion', name: '动效时长' },
  { id: 'easing', name: '缓动曲线' },
] as const;
type Group = (typeof groups)[number]['id'];
type Entry = { key: string; label: string; value: string; group: Exclude<Group, 'all'> };
const colorLabels: Record<keyof typeof theme.color, string> = {
  canvas: '页面背景',
  subtle: '次级表面',
  ink: '正文',
  secondary: '辅助文字',
  muted: '弱化文字',
  line: '边框',
  primary: '主操作',
  onPrimary: '主操作文字',
  accent: '强调色',
  accentText: '强调文字',
  shadow: '投影颜色',
};
const layoutLabels: Record<keyof typeof theme.layout, string> = {
  leftPaneWidth: '左栏宽度',
  rightPaneWidth: '右栏宽度',
};
const motionLabels: Record<keyof typeof theme.motion, string> = {
  feedback: '操作反馈',
  reveal: '内容展开',
  surface: '表面过渡',
};

export default function TokenExplorer({ view }: { view: 'colors' | 'tokens' }) {
  const [dark, setDark] = useState(false);
  const paletteSwitch = (
    <button
      className="doc-example-switch"
      type="button"
      aria-pressed={dark}
      onClick={() => setDark(!dark)}
    >
      石墨配色
    </button>
  );
  const [group, setGroup] = useState<Group>('all');
  const [query, setQuery] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const palette = dark ? palettes.graphite : palettes.neutral;
  const entries: Entry[] = [
    ...Object.entries(colorLabels).map(([key, label]) => ({
      key: 'color.' + key,
      label,
      value: palette[key as keyof typeof palette],
      group: 'color' as const,
    })),
    ...Object.entries(theme.space).map(([key, px]) => ({
      key: 'space.' + key,
      label: '布局间距',
      value: px + 'px',
      group: 'space' as const,
    })),
    ...Object.entries(layoutLabels).map(([key, label]) => ({
      key: 'layout.' + key,
      label,
      value: theme.layout[key as keyof typeof theme.layout] + 'px',
      group: 'layout' as const,
    })),
    ...Object.entries(motionLabels).map(([key, label]) => ({
      key: 'motion.' + key,
      label,
      value: theme.motion[key as keyof typeof theme.motion] + 'ms',
      group: 'motion' as const,
    })),
    {
      key: 'easing',
      label: '缓动曲线',
      value: 'cubic-bezier(' + theme.easing.join(', ') + ')',
      group: 'easing',
    },
  ];
  const term = query.trim().toLowerCase();
  const results = entries.filter(
    (item) =>
      (group === 'all' || group === item.group) &&
      (item.key + ' ' + item.label + ' ' + item.value).toLowerCase().includes(term),
  );
  if (view === 'colors') {
    return (
      <div className="doc-theme-example" data-dark={dark}>
        {paletteSwitch}
        <div className="pg-swatches">
          {(['canvas', 'ink', 'line', 'primary', 'accent'] as const).map((role) => (
            <div className="pg-swatch" key={role}>
              <i style={{ backgroundColor: palette[role] }} />
              <span>{colorLabels[role]}</span>
              <code>{palette[role]}</code>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="doc-theme-example lookup" data-dark={dark}>
      {paletteSwitch}
      <Inline wrap className="pg-token-groups" role="group" aria-label="变量分类">
        {groups.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={group === item.id}
            onClick={() => {
              setGroup(item.id);
              setQuery('');
            }}
          >
            {item.name}
          </button>
        ))}
      </Inline>
      <div className="lookup-box">
        <HugeiconsIcon icon={Search} size={19} aria-hidden="true" />
        <input
          id="token-search"
          ref={input}
          aria-label="按名称、用途或值搜索"
          placeholder="输入变量名、用途或颜色值"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setQuery('');
          }}
        />
        {query && (
          <button
            className="icon-button"
            type="button"
            aria-label="清除搜索"
            onClick={() => {
              setQuery('');
              input.current?.focus();
            }}
          >
            <HugeiconsIcon icon={Close} size={15} aria-hidden="true" />
          </button>
        )}
      </div>
      {!term && group === 'all' ? (
        <div className="lookup-hints">
          {['页面背景', '主操作', '边框', '操作反馈', '缓动曲线'].map((label) => (
            <button key={label} type="button" onClick={() => setQuery(label)}>
              {label}
            </button>
          ))}
        </div>
      ) : (
        <div className="result-region" aria-live="polite">
          {results.length ? (
            <ul className="token-results">
              {results.map((item) => (
                <li key={item.key}>
                  {item.group === 'color' ? (
                    <i className="color-sample" style={{ backgroundColor: item.value }} />
                  ) : (
                    <HugeiconsIcon
                      icon={item.group === 'motion' ? Clock : Curve}
                      size={16}
                      aria-hidden="true"
                    />
                  )}
                  <span>
                    <strong>{item.label}</strong>
                    <code>{item.key}</code>
                  </span>
                  <code className="token-value">{item.value}</code>
                </li>
              ))}
            </ul>
          ) : (
            <p>没有匹配的变量。</p>
          )}
        </div>
      )}
    </div>
  );
}

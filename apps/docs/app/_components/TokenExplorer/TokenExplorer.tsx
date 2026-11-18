'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { palettes, theme } from '@nibferry/react/theme';
import { HugeiconsIcon } from '@hugeicons/react';
import Layers from '@hugeicons/core-free-icons/Layers01Icon';
import Grid from '@hugeicons/core-free-icons/GridViewIcon';
import Colors from '@hugeicons/core-free-icons/ColorsIcon';
import Clock from '@hugeicons/core-free-icons/Time02Icon';
import Curve from '@hugeicons/core-free-icons/Activity01Icon';
import Search from '@hugeicons/core-free-icons/Search01Icon';
import Sun from '@hugeicons/core-free-icons/Sun03Icon';
import Moon from '@hugeicons/core-free-icons/Moon02Icon';
import Arrow from '@hugeicons/core-free-icons/ArrowDown01Icon';
import Close from '@hugeicons/core-free-icons/Cancel01Icon';

import Monitor from '@hugeicons/core-free-icons/ComputerIcon';
import Sidebar from '@hugeicons/core-free-icons/SidebarLeft01Icon';
import Maximize from '@hugeicons/core-free-icons/FullScreenIcon';
import Minimize from '@hugeicons/core-free-icons/MinimizeScreenIcon';
import MotionPreview from '../MotionPreview/MotionPreview';

const groups = [
  { id: 'preview', name: '动效预览', icon: Monitor },
  { id: 'all', name: '搜索变量', icon: Grid },
  { id: 'color', name: '颜色', icon: Colors },
  { id: 'motion', name: '动效时长', icon: Clock },
  { id: 'easing', name: '缓动曲线', icon: Curve },
] as const;

type Group = (typeof groups)[number]['id'];
type Entry = {
  key: string;
  label: string;
  value: string;
  group: Exclude<Group, 'all' | 'preview'>;
};
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
const motionLabels: Record<keyof typeof theme.motion, string> = {
  feedback: '操作反馈',
  reveal: '内容展开',
  surface: '表面过渡',
};

export default function TokenExplorer() {
  const [group, setGroup] = useState<Group>('preview');
  const [query, setQuery] = useState('');
  const [dark, setDark] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const picker = useRef<HTMLDetailsElement>(null);
  const frame = useRef<HTMLElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  useEffect(() => {
    function readHash() {
      if (window.location.hash === '#tokens') setGroup('all');
      if (window.location.hash === '#playground') setGroup('preview');
    }
    function syncFullscreen() {
      setFullscreen(document.fullscreenElement === frame.current);
    }
    readHash();
    setCanExpand(document.fullscreenEnabled);
    window.addEventListener('hashchange', readHash);
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => {
      window.removeEventListener('hashchange', readHash);
      document.removeEventListener('fullscreenchange', syncFullscreen);
    };
  }, []);
  const palette = dark ? palettes.graphite : palettes.neutral;
  const entries: Entry[] = [
    ...Object.entries(colorLabels).map(([key, label]) => ({
      key: 'color.' + key,
      label,
      value: palette[key as keyof typeof palette],
      group: 'color' as const,
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
  function selectGroup(next: Group) {
    setGroup(next);
    window.history.replaceState(
      window.history.state,
      '',
      next === 'preview' ? '#playground' : '#tokens',
    );
    setQuery('');
  }
  const style = {
    '--site-bg': palette.canvas,
    '--site-soft': palette.subtle,
    '--site-ink': palette.ink,
    '--site-muted': palette.secondary,
    '--site-line': palette.line,
    '--site-action': palette.primary,
    '--demo-bg': palette.canvas,
    '--demo-rail': palette.subtle,
    '--demo-ink': palette.ink,
    '--demo-muted': palette.secondary,
    '--demo-line': palette.line,
    '--demo-focus': palette.accent,
  } as CSSProperties;
  return (
    <section
      ref={frame}
      data-collapsed={collapsed}
      className="explorer"
      id="playground"
      style={style}
      aria-label="设计 Token 交互预览"
    >
      <span id="tokens" className="token-anchor" />
      <aside className="explorer-rail" id="preview-sidebar">
        <div className="rail-heading">
          <HugeiconsIcon icon={Layers} size={18} aria-hidden="true" />
          Nibferry
        </div>
        <div className="rail-items">
          {groups.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={group === item.id}
              onClick={() => selectGroup(item.id)}
            >
              <HugeiconsIcon icon={item.icon} size={16} aria-hidden="true" />
              {item.name}
            </button>
          ))}
        </div>
        <span className="rail-foot">@nibferry/react</span>
      </aside>
      <div className="explorer-main">
        <div className="explorer-toolbar">
          <button
            type="button"
            className="icon-button rail-toggle"
            aria-label={collapsed ? '展开预览侧栏' : '收起预览侧栏'}
            aria-controls="preview-sidebar"
            aria-expanded={!collapsed}
            onClick={() => setCollapsed(!collapsed)}
          >
            <HugeiconsIcon icon={Sidebar} size={17} aria-hidden="true" />
          </button>
          <span className="preview-name">{group === 'preview' ? '交互预览' : 'Token 浏览器'}</span>
          <details
            ref={picker}
            className="mobile-groups"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                event.currentTarget.open = false;
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.currentTarget.open = false;
                event.currentTarget.querySelector('summary')?.focus();
              }
            }}
          >
            <summary aria-label="选择变量分类">
              {groups.find((item) => item.id === group)?.name}
              <HugeiconsIcon icon={Arrow} size={14} aria-hidden="true" />
            </summary>
            <div className="choice-list">
              {groups.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={item.id === group}
                  onClick={() => {
                    selectGroup(item.id);
                    if (picker.current) picker.current.open = false;
                    picker.current?.querySelector('summary')?.focus();
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </details>
          <button
            className="icon-button"
            type="button"
            aria-label={dark ? '切换为浅色预览' : '切换为深色预览'}
            onClick={() => setDark(!dark)}
          >
            <HugeiconsIcon icon={dark ? Sun : Moon} size={17} aria-hidden="true" />
          </button>
          {canExpand && (
            <button
              className="icon-button"
              type="button"
              aria-label={fullscreen ? '退出全屏' : '全屏预览'}
              onClick={async () => {
                if (fullscreen) await document.exitFullscreen();
                else await frame.current?.requestFullscreen();
              }}
            >
              <HugeiconsIcon icon={fullscreen ? Minimize : Maximize} size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        {group === 'preview' ? (
          <div className="preview-demo">
            <MotionPreview />
          </div>
        ) : (
          <div className="explorer-body">
            <div className="lookup">
              <h2>查找设计 Token</h2>
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
          </div>
        )}
      </div>
    </section>
  );
}

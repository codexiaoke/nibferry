'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Layers from '@hugeicons/core-free-icons/Layers01Icon';
import Menu from '@hugeicons/core-free-icons/Menu01Icon';
import Close from '@hugeicons/core-free-icons/Cancel01Icon';
import Down from '@hugeicons/core-free-icons/ArrowDown01Icon';
import type { SearchEntry } from '../../../lib/docs';
import { repository } from '../../site-links';
import DocSearch from '../DocSearch/DocSearch';

const menus = [
  {
    title: '设计规范',
    links: [
      ['设计 Token', '/docs/theme'],
      ['颜色与文字', '/docs/colors'],
      ['边框与层级', '/docs/surfaces'],
      ['动效与过渡', '/docs/motion'],
    ],
  },
  {
    title: '资源',
    links: [
      ['贡献指南', '/docs/contributing'],
      ['反馈问题', repository + '/issues'],
    ],
  },
];

export default function SiteHeader({ entries }: { entries: SearchEntry[] }) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState('');
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);

  function close() {
    setOpen(false);
    setMenu('');
  }

  useEffect(() => {
    if (!open && !menu) return;
    function keydown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (menu) {
        header.current
          ?.querySelector<HTMLButtonElement>('.nav-dropdown button[aria-expanded="true"]')
          ?.focus();
        setMenu('');
      } else {
        setOpen(false);
        menuButton.current?.focus();
      }
    }
    function outside(event: Event) {
      if (!header.current?.contains(event.target as Node)) close();
    }
    document.addEventListener('keydown', keydown);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    return () => {
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
    };
  }, [open, menu]);

  return (
    <header className="site-header" ref={header}>
      <a className="skip-link" href="#content">
        跳到正文
      </a>
      <div className="frame header-inner">
        <Link href="/" className="wordmark" onClick={close}>
          <HugeiconsIcon icon={Layers} size={22} aria-hidden="true" />
          Nibferry
        </Link>
        <nav id="site-nav" aria-label="主导航" className="main-nav" data-open={open}>
          <Link href="/docs" onClick={close}>
            文档
          </Link>
          <a href="/#playground" onClick={close}>
            交互预览
          </a>
          {menus.map(({ title, links }, i) => (
            <div className="nav-dropdown" key={title}>
              <button
                type="button"
                aria-controls={'nav-menu-' + i}
                aria-expanded={menu === title}
                onClick={() => setMenu(menu === title ? '' : title)}
              >
                {title}
                <HugeiconsIcon icon={Down} size={12} aria-hidden="true" />
              </button>
              <div id={'nav-menu-' + i} className="nav-options" hidden={menu !== title}>
                {links.map(([name, href]) => (
                  <Link key={href} href={href} onClick={close}>
                    {name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="header-actions">
          <DocSearch entries={entries} onOpen={close} />
          <a href={repository} className="repo-link">
            GitHub
          </a>
          <button
            ref={menuButton}
            className="menu-toggle icon-button"
            type="button"
            aria-label={open ? '关闭导航' : '打开导航'}
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => {
              setOpen(!open);
              setMenu('');
            }}
          >
            <HugeiconsIcon icon={open ? Close : Menu} size={19} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}

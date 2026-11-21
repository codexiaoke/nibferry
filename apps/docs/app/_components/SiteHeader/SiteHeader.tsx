'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Layers from '@hugeicons/core-free-icons/Layers01Icon';
import Menu from '@hugeicons/core-free-icons/Menu01Icon';
import Close from '@hugeicons/core-free-icons/Cancel01Icon';
import type { SearchEntry } from '../../../lib/docs';
import { basePath, repository } from '../../site-links';
import DocSearch from '../DocSearch/DocSearch';

export default function SiteHeader({ entries }: { entries: SearchEntry[] }) {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);

  const path = usePathname();
  const current = entries.find(entry => entry.url === path.replace(/\/$/, ''))?.location;

  // Previously published links opened the explorer using a fragment on the home page.
  useEffect(() => {
    if (path !== '/') return;
    function followPreviewLink() {
      const hash = window.location.hash;
      if (hash === '#playground' || hash === '#tokens') {
        window.location.replace(
          basePath + (hash === '#tokens' ? '/docs/theme/#variables' : '/playground/'),
        );
      }
    }
    followPreviewLink();
    window.addEventListener('hashchange', followPreviewLink);
    return () => window.removeEventListener('hashchange', followPreviewLink);
  }, [path]);

  function close() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function keydown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setOpen(false);
      menuButton.current?.focus();
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
  }, [open]);

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
          <Link href="/docs/components" aria-current={current === '组件' ? 'location' : undefined} onClick={close}>组件</Link>
          <Link href="/docs" aria-current={current === '指南' ? 'location' : undefined} onClick={close}>指南</Link>
          <Link href="/docs/theme" aria-current={current === '主题' ? 'location' : undefined} onClick={close}>主题</Link>
          <Link href="/playground/" onClick={close}>示例</Link>
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
            onClick={() => setOpen(!open)}
          >
            <HugeiconsIcon icon={open ? Close : Menu} size={19} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}

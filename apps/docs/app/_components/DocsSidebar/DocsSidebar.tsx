'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Down from '@hugeicons/core-free-icons/ArrowDown01Icon';
import Menu from '@hugeicons/core-free-icons/Menu02Icon';
import { catalog } from '../../../lib/component-catalog';
import type { DocGroup } from '../../../lib/docs';

export default function DocsSidebar({ groups }: { groups: DocGroup[] }) {
  const current = usePathname().replace(/\/$/, '');
  const activeCategory = catalog.find(category => category.entries.some(page => page.url === current));
  const navigation = useRef<HTMLElement>(null);
  useEffect(() => {
    let group = navigation.current?.querySelector('[aria-current="page"]')?.closest('details');
    while (group) {
      group.open = true;
      group = group.parentElement?.closest('details');
    }
  }, [current]);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  function pageLink({ title, url }: { title: string; url: string }) {
    return (
      <Link key={url} href={url} prefetch={false}
        aria-current={url === current ? 'page' : undefined}
        onClick={() => setOpen(false)}>
        {title}
      </Link>
    );
  }
  return (
    <aside
      className="docs-sidebar"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (open && event.key === 'Escape') {
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        type="button"
        ref={trigger}
        className="docs-disclosure"
        aria-expanded={open}
        aria-controls="docs-navigation"
        onClick={() => setOpen(!open)}
      >
        <HugeiconsIcon icon={Menu} size={16} aria-hidden="true" />
        文档目录
        <HugeiconsIcon icon={Down} size={14} aria-hidden="true" />
      </button>
      <nav ref={navigation} id="docs-navigation" aria-label="文档目录" data-open={open}>
        {groups.map((group) => (
          <details key={group.title}
            open={group.pages.some(page => page.url === current) || (group.title === '组件' && !!activeCategory)}>
            <summary>
              {group.title}
              <HugeiconsIcon icon={Down} size={14} aria-hidden="true" />
            </summary>
            <div>
              {group.pages.map(pageLink)}
              {group.title === '组件' && catalog.map(category => (
                <details className="sidebar-category" key={category.title} open={category === activeCategory}>
                  <summary>{category.title}<HugeiconsIcon icon={Down} size={14} aria-hidden="true" /></summary>
                  <div>{category.entries.map(pageLink)}</div>
                </details>
              ))}
            </div>
          </details>
        ))}
      </nav>
    </aside>
  );
}

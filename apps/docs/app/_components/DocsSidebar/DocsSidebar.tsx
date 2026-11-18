'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Down from '@hugeicons/core-free-icons/ArrowDown01Icon';
import Menu from '@hugeicons/core-free-icons/Menu02Icon';
import type { DocGroup } from '../../../lib/docs';

export default function DocsSidebar({ groups }: { groups: DocGroup[] }) {
  const current = usePathname();
  const navigation = useRef<HTMLElement>(null);
  useEffect(() => {
    const group = navigation.current?.querySelector('[aria-current="page"]')?.closest('details');
    if (group) group.open = true;
  }, [current]);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
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
          <details open key={group.title}>
            <summary>
              {group.title}
              <HugeiconsIcon icon={Down} size={14} aria-hidden="true" />
            </summary>
            <div>
              {group.pages.map(({ title, url }) => (
                <Link
                  key={url}
                  href={url}
                  aria-current={url === current ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {title}
                </Link>
              ))}
            </div>
          </details>
        ))}
      </nav>
    </aside>
  );
}

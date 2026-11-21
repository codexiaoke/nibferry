'use client';

import { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import List from '@hugeicons/core-free-icons/TextAlignLeftIcon';
import Down from '@hugeicons/core-free-icons/ArrowDown01Icon';
import CopyContent from '../CopyContent/CopyContent';
import Source from '@hugeicons/core-free-icons/SourceCodeSquareIcon';

interface Heading {
  title: string;
  id: string;
}
export default function PageOutline({
  headings,
  markdown,
  markdownUrl,
}: {
  headings: Heading[];
  markdown: string;
  markdownUrl: string;
}) {
  const [active, setActive] = useState<string | undefined>(headings[0]?.id);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const sections = headings
      .map(({ id }) => document.getElementById(id))
      .filter((el) => el !== null);
    function update() {
      const selected = sections
        .filter((section) => section.getBoundingClientRect().top <= 120)
        .at(-1);
      const atEnd =
        Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight;
      const target = sections.find(
        (section) => section.matches(':target') && section.getBoundingClientRect().top >= 0,
      );
      const lastVisible = target ?? (window.scrollY > 0 ? sections.at(-1) : sections[0]);
      setActive((atEnd ? lastVisible : (selected ?? sections[0]))?.id);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('hashchange', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('hashchange', update);
    };
  }, [headings]);
  return (
    <aside
      className="page-outline"
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
      {headings.length > 0 && <div className="outline-title">
        <HugeiconsIcon icon={List} size={16} aria-hidden="true" />
        本页内容
      </div>}
      <button
        type="button"
        ref={trigger}
        className="docs-disclosure"
        aria-controls="outline-panel"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <HugeiconsIcon icon={List} size={16} aria-hidden="true" />
        {headings.length ? '本页内容' : '页面操作'}
        <HugeiconsIcon icon={Down} size={14} aria-hidden="true" />
      </button>
      <div id="outline-panel" data-open={open}>
        <nav aria-label="本页内容">
          {headings.map(({ title, id }) => (
            <a
              key={id}
              href={'#' + id}
              aria-current={active === id ? 'location' : undefined}
              onClick={() => {
                setOpen(false);
                document.getElementById(id)?.focus({ preventScroll: true });
              }}
            >
              {title}
            </a>
          ))}
        </nav>
        <div className="page-actions">
          <CopyContent markdown={markdown} />
          <a href={markdownUrl} target="_blank" rel="noreferrer">
            <HugeiconsIcon icon={Source} size={15} aria-hidden="true" />
            查看 Markdown
          </a>
        </div>
      </div>
    </aside>
  );
}

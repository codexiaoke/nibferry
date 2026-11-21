'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import Search from '@hugeicons/core-free-icons/Search01Icon';
import Arrow from '@hugeicons/core-free-icons/ArrowRight01Icon';
import { getExample } from '../ComponentDemos/examples';
import type { CatalogGroup } from '../../../lib/component-catalog';

export default function ComponentCatalog({ groups }: { groups: CatalogGroup[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const words = query.trim().toLowerCase().split(/\s+/);
  const results = groups
    .filter(group => !category || group.title === category)
    .map(group => ({
      ...group,
      entries: group.entries.flatMap(page => {
        const matches = page.parts.filter(part => {
          const text = [group.title, page.title, part.title, part.name].join(' ').toLowerCase();
          return words.every(word => text.includes(word));
        });
        if (!matches.length) return [];
        const target = matches.find(part => part.name.toLowerCase() === query.trim().toLowerCase()) ?? matches[0];
        return [{ page, target }];
      }),
    }))
    .filter(group => group.entries.length > 0);
  return (
    <div className="component-catalog">
      <label className="catalog-input">
        <HugeiconsIcon icon={Search} size={17} aria-hidden="true" />
        <input
          type="text"
          aria-label="筛选组件"
          placeholder="搜索组件，如「模型」或 MenuItem"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
      </label>
      <div className="catalog-filters" role="group" aria-label="组件分类">
        {['', ...groups.map(group => group.title)].map(title => (
          <button
            key={title}
            type="button"
            aria-pressed={category === title}
            onClick={() => setCategory(title)}
          >
            {title || '全部'}
          </button>
        ))}
      </div>
      {results.length === 0 && <p role="status">没有找到匹配的组件。</p>}
      {results.map(group => (
        <section key={group.title} aria-label={group.title} id={group.title}>
          <h2>{group.title} <small>{group.entries.length}</small></h2>
          {group.entries.map(({ page, target }) => {
            const Demo = getExample(page.name);
            return (
              <div className="catalog-example" key={page.name}>
                <Demo />
                <div className="catalog-links">
                  <Link href={target.url} prefetch={false}>
                    <span>{page.title}<code>{target.name === page.name ? page.name : target.title + ' · ' + target.name}</code></span>
                    <HugeiconsIcon icon={Arrow} size={15} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

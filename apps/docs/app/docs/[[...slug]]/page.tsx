import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import Right from '@hugeicons/core-free-icons/ArrowRight01Icon';
import Next from '@hugeicons/core-free-icons/ArrowRight02Icon';
import Previous from '@hugeicons/core-free-icons/ArrowLeft02Icon';
import { getGroups, getMarkdown, markdownFile, source } from '../../../lib/docs';
import CopyContent from '../../_components/CopyContent/CopyContent';
import PageOutline from '../../_components/PageOutline/PageOutline';
import { basePath } from '../../site-links';

type Route = { params: Promise<{ slug?: string[] }> };
export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: Route) {
  const page = source.getPage((await params).slug);
  if (page) return { title: page.data.title + ' · Nibferry', description: page.data.description };
}

export default async function DocsPage({ params }: Route) {
  const page = source.getPage((await params).slug);
  if (!page) notFound();
  const groups = getGroups();
  const pages = groups.flatMap((group) => group.pages);
  const index = pages.findIndex((item) => item.url === page.url);
  const group = groups.find((group) => group.pages.some((item) => item.url === page.url));
  const { body: Body, title, description, structuredData } = page.data;
  const headings = structuredData.headings.map(({ id, content }) => ({ id, title: content }));
  return (
    <>
      <main className="docs-main" id="content">
        <nav className="docs-breadcrumb" aria-label="面包屑">
          <Link href="/docs">文档</Link>
          <HugeiconsIcon icon={Right} size={12} aria-hidden="true" />
          <span>{group?.title}</span>
        </nav>
        <article className={page.url === '/docs' ? 'docs-overview' : undefined}>
          <header>
            <h1>{title}</h1>
            <p className="docs-lede">{description}</p>
          </header>
          <div className="docs-prose">
            <Body
              components={{
                pre: (props) => (
                  <CopyContent>
                    <pre {...props} />
                  </CopyContent>
                ),
                h2: (props) => <h2 tabIndex={-1} {...props} />,
                a: ({ href, children, ...props }) =>
                  href?.startsWith('/') ? (
                    <Link href={href} {...props}>
                      {children}
                    </Link>
                  ) : (
                    <a href={href} {...props}>
                      {children}
                    </a>
                  ),
              }}
            />
          </div>
        </article>
        <nav className="doc-neighbors" aria-label="相邻文档">
          {index > 0 && (
            <Link href={pages[index - 1].url}>
              <small>
                <HugeiconsIcon icon={Previous} size={14} aria-hidden="true" />
                上一篇
              </small>
              {pages[index - 1].title}
            </Link>
          )}
          {index >= 0 && index < pages.length - 1 && (
            <Link className="doc-next" href={pages[index + 1].url}>
              <small>
                下一篇
                <HugeiconsIcon icon={Next} size={14} aria-hidden="true" />
              </small>
              {pages[index + 1].title}
            </Link>
          )}
        </nav>
      </main>
      <PageOutline
        key={'outline-' + page.url}
        headings={headings}
        markdown={await getMarkdown(page)}
        markdownUrl={basePath + '/markdown/' + markdownFile(page.slugs)}
      />
    </>
  );
}

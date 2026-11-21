import Link from 'next/link';
import type { MDXComponents } from 'mdx/types';
import TokenExplorer from '../../_components/TokenExplorer/TokenExplorer';
import MotionPreview from '../../_components/MotionPreview/MotionPreview';
import { notFound } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import Right from '@hugeicons/core-free-icons/ArrowRight01Icon';
import Next from '@hugeicons/core-free-icons/ArrowRight02Icon';
import Previous from '@hugeicons/core-free-icons/ArrowLeft02Icon';
import { getExample } from '../../_components/ComponentDemos/examples';
import { catalog, movedComponents } from '../../../lib/component-catalog';
import { ComponentAnchorRedirect } from '../../_components/ComponentCatalog/ComponentAnchorRedirect';
import ComponentCatalog from '../../_components/ComponentCatalog/ComponentCatalog';
import { docPaths, getComponentReadme, getGroups, getMarkdown, markdownFile, resolveComponentLink, source } from '../../../lib/docs';
import CopyContent from '../../_components/CopyContent/CopyContent';
import PageOutline from '../../_components/PageOutline/PageOutline';
import { basePath } from '../../site-links';

type Route = { params: Promise<{ slug?: string[] }> };
export function generateStaticParams() {
  return docPaths().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Route) {
  const { slug = [] } = await params;
  if (movedComponents.has('/docs/' + slug.join('/'))) return { robots: { index: false } };
  const page = source.getPage(slug);
  if (page) return { title: page.data.title + ' · Nibferry', description: page.data.description };
}

export default async function DocsPage({ params }: Route) {
  const { slug = [] } = await params;
  const moved = movedComponents.get('/docs/' + slug.join('/'));
  if (moved) return <>
    <meta httpEquiv="refresh" content={'0;url=' + basePath + moved.url} />
    <main id="content"><Link href={moved.url}>{moved.title}</Link></main>
  </>;
  const page = source.getPage(slug);
  if (!page) notFound();
  const group = getGroups().find(group => group.pages.some(item => item.url === page.url));
  const category = catalog.find(group => group.entries.some(entry => entry.url === page.url));
  const component = category?.entries.find(entry => entry.url === page.url);
  const reference = page.url.startsWith('/docs/components/');
  const Demo = component && reference ? getExample(component.name) : undefined;
  const pages = category?.entries ?? group?.pages ?? [];
  const index = pages.findIndex(item => item.url === page.url);
  const { body: Body, title, description, structuredData } = page.data;
  const headings = structuredData.headings
    .filter(({ content }) => content !== component?.name)
    .map(({ id, content }) => ({ id, title: content }));
  if (Demo) headings.unshift({ id: 'preview', title: '交互预览' });
  const parts = component?.parts.slice(1) ?? [];
  headings.push(...parts.map(part => ({ id: part.name, title: part.title })));
  const bodyComponents: MDXComponents = {
    pre: props => <CopyContent><pre {...props} /></CopyContent>,
    h2: props => <h2 tabIndex={-1} {...props} />,
    h3: props => <h3 tabIndex={-1} {...props} />,
    ...(reference && { h1: () => null }),
    a: ({ href, children, ...props }) => {
      const url = href && resolveComponentLink(href);
      return url?.startsWith('/') ? <Link href={url} {...props}>{children}</Link>
        : <a href={url} {...props}>{children}</a>;
    },
  };
  return (
    <>
      <main className="docs-main" id="content">
        <nav className="docs-breadcrumb" aria-label="面包屑">
          <Link href="/">Nibferry</Link>
          <HugeiconsIcon icon={Right} size={12} aria-hidden="true" />
          <Link href={category ? '/docs/components' : group?.pages[0].url ?? '/docs'}>{category ? '组件' : group?.title}</Link>
          {category && <>
            <HugeiconsIcon icon={Right} size={12} aria-hidden="true" />
            <Link href={'/docs/components#' + category.title}>{category.title}</Link>
          </>}
        </nav>
        <article className={page.url === '/docs' ? 'docs-overview' : undefined}>
          <header>
            <h1>{title}</h1>
            {component && <code className="component-export">{component.name}</code>}
            {!reference && <p className="docs-lede">{description}</p>}
          </header>
          {page.url === '/docs/components' && <ComponentCatalog groups={catalog} />}
          <div className="docs-prose">
            {headings.some(heading => heading.title === '相关组件') && <ComponentAnchorRedirect />}
            {Demo && <>
              <h2 id="preview" tabIndex={-1}>交互预览</h2>
              <Demo />
            </>}
            <Body components={bodyComponents} />
            {parts.map(part => {
              const PartBody = getComponentReadme(part.name).body;
              return (
                <section key={part.name} aria-labelledby={part.name}>
                  <h2 id={part.name} tabIndex={-1}>{part.title} <code>{part.name}</code></h2>
                  <PartBody components={{
                    ...bodyComponents,
                    h1: () => null,
                    h2: ({ id, children }) => id === '用法' ? null :
                      <h3 id={part.name + '-' + id}>{children}</h3>,
                  }} />
                </section>
              );
            })}
          </div>
          {page.url === '/docs/theme' && (
            <section id="variables" aria-label="主题变量">
              <TokenExplorer view="tokens" />
            </section>
          )}
          {page.url === '/docs/colors' && (
            <section aria-label="配色预设示例">
              <TokenExplorer view="colors" />
            </section>
          )}
          {page.url === '/docs/motion' && <MotionPreview />}
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

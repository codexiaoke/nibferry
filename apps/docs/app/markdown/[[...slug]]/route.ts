import { docPaths, getMarkdown, markdownFile, source } from '../../../lib/docs';
import { movedComponents } from '../../../lib/component-catalog';
import { basePath } from '../../site-links';

export const dynamic = 'force-static';
export function generateStaticParams() {
  return docPaths().map(slugs => ({ slug: markdownFile(slugs).split('/') }));
}

export async function GET(_: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const file = (await params).slug?.join('/') || 'index';
  const slug = file.replace(/\.txt$/, '');
  const moved = movedComponents.get('/docs/' + slug);
  if (moved) return new Response(`[${moved.title}](${basePath}${moved.url})\n`);
  const page = source.getPage(slug === 'index' ? [] : slug.split('/'));
  if (!page) return new Response(null, { status: 404 });
  return new Response(await getMarkdown(page), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

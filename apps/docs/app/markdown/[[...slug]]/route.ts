import { getMarkdown, markdownFile, source } from '../../../lib/docs';

export const dynamic = 'force-static';
export function generateStaticParams() {
  return source.getPages().map((page) => ({ slug: markdownFile(page.slugs).split('/') }));
}

export async function GET(_: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const file = (await params).slug?.join('/') || 'index';
  const slug = file.replace(/\.txt$/, '');
  const page = source.getPage(slug === 'index' ? [] : slug.split('/'));
  if (!page) return new Response(null, { status: 404 });
  return new Response(await getMarkdown(page), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

import { getMarkdown, source } from '../../../lib/docs';

export const dynamic = 'force-static';
export function generateStaticParams() {
  return source.generateParams();
}

export async function GET(_: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const page = source.getPage((await params).slug);
  if (!page) return new Response(null, { status: 404 });
  return new Response(await getMarkdown(page), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

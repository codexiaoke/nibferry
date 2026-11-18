import { loader } from 'fumadocs-core/source';
import { basePath } from '../app/site-links';
import { docs } from '../.source/server';

export const source = loader({ baseUrl: '/docs', source: docs.toFumadocsSource() });

export interface DocGroup {
  title: string;
  pages: { title: string; url: string }[];
}

export function getGroups() {
  const groups: DocGroup[] = [];
  for (const item of source.getPageTree().children) {
    if (item.type === 'separator') groups.push({ title: String(item.name), pages: [] });
    if (item.type === 'page') {
      if (!groups.length) groups.push({ title: '文档', pages: [] });
      groups[groups.length - 1].pages.push({ title: String(item.name), url: item.url });
    }
  }
  return groups;
}

export interface SearchEntry {
  url: string;
  title: string;
  location: string;
  text: string;
  section: boolean;
}

export function getSearchIndex(): SearchEntry[] {
  return source.getPages().flatMap(({ url, data }) => {
    const { headings, contents } = data.structuredData;
    const body = (heading?: string) =>
      contents
        .filter((item) => item.heading === heading)
        .map((item) => item.content)
        .join(' ');
    return [
      {
        url,
        title: data.title,
        location: '文档',
        text: [data.description, body()].join(' ').trim(),
        section: false,
      },
      ...headings.map(({ id, content }) => ({
        url: url + '#' + id,
        title: content,
        location: data.title,
        text: body(id),
        section: true,
      })),
    ];
  });
}

export function markdownFile(slugs: string[]) {
  return (slugs.join('/') || 'index') + '.txt';
}

export async function getMarkdown(page: NonNullable<ReturnType<typeof source.getPage>>) {
  return (
    '# ' +
    page.data.title +
    '\n\n' +
    page.data.description +
    '\n\n' +
    (await page.data.getText('processed')).replace(/\]\(\/(?!\/)/g, '](' + basePath + '/')
  );
}

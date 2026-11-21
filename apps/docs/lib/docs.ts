import { loader } from 'fumadocs-core/source';
import { basePath } from '../app/site-links';
import { toFumadocsSource } from 'fumadocs-mdx/runtime/server';
import { catalog, componentPages, components, movedComponents } from './component-catalog';
import { componentReadmes, docs } from '../.source/server';

const readmes = new Map(componentReadmes.map(doc => [doc.info.path.split('/').at(-2), doc]));
export function getComponentReadme(name: string) {
  const doc = readmes.get(name);
  if (!doc) throw new Error('Missing README for ' + name);
  return doc;
}

const references = componentPages.filter(entry => entry.url.startsWith('/docs/components/')).map(entry => {
  const doc = getComponentReadme(entry.name);
  return {
    ...doc,
    info: { ...doc.info, path: entry.url.slice('/docs/'.length) + '.md' },
    title: entry.title,
    description: doc.structuredData.contents[0]?.content,
  };
});

export const source = loader({
  baseUrl: '/docs',
  source: toFumadocsSource([...docs.docs, ...references], docs.meta),
});

export function resolveComponentLink(href: string) {
  const match = /^\.\.\/([^/]+)\/README\.md$/.exec(href);
  return (match && components.find(entry => entry.name === match[1])?.url) || href;
}

export interface DocGroup {
  title: string;
  pages: { title: string; url: string }[];
}

export function getGroups() {
  const groups: DocGroup[] = [];
  for (const item of source.getPageTree().children) {
    if (item.type === 'separator') {
      groups.push({ title: String(item.name), pages: [] });
      continue;
    }
    const page = item.type === 'folder' ? item.index : item;
    if (!page) continue;
    if (!groups.length) groups.push({ title: '文档', pages: [] });
    groups[groups.length - 1].pages.push({ title: String(page.name), url: page.url });
  }
  return groups;
}

export interface SearchEntry {
  url: string;
  title: string;
  location: string;
  text: string;
  section: boolean;
  exportName?: string;
}

export function getSearchIndex(): SearchEntry[] {
  const groups = getGroups();
  return source.getPages().flatMap(({ url, data }) => {
    const { headings, contents } = data.structuredData;
    const component = componentPages.find(entry => entry.url === url);
    const body = (heading?: string) =>
      contents
        .filter((item) => item.heading === heading)
        .map((item) => item.content)
        .join(' ');
    return [
      {
        url,
        title: data.title,
        exportName: component?.name,
        location: component ? '组件' : groups.find(group => group.pages.some(page => page.url === url))?.title ?? '文档',
        text: [data.description, component?.parts[0].title, body()].filter(Boolean).join(' '),
        section: false,
      },
      ...(component?.parts.slice(1) ?? []).map(part => ({
        url: part.url,
        title: part.title,
        exportName: part.name,
        location: data.title,
        text: getComponentReadme(part.name).structuredData.contents.map(item => item.content).join(' '),
        section: true,
      })),
      ...headings.filter(heading => heading.content !== component?.name).map(({ id, content }) => ({
        url: url + '#' + id,
        title: content,
        location: data.title,
        text: body(id),
        section: true,
      })),
    ];
  });
}

export function docPaths() {
  return [
    ...source.getPages().map(page => page.slugs),
    ...Array.from(movedComponents.keys(), url => url.slice('/docs/'.length).split('/')),
  ];
}

export function markdownFile(slugs: string[]) {
  return (slugs.join('/') || 'index') + '.txt';
}

function readmeBody(markdown: string) {
  return markdown.trim().replace(/^# [^\n]+\n+/, '').replace(/\]\((\.\.\/[^/]+\/README\.md)\)/g,
    (_, href: string) => '](' + resolveComponentLink(href) + ')');
}

export async function getMarkdown(page: NonNullable<ReturnType<typeof source.getPage>>) {
  const component = componentPages.find(entry => entry.url === page.url);
  const reference = page.url.startsWith('/docs/components/');
  let body = reference ? readmeBody(await page.data.getText('raw')) : await page.data.getText('processed');
  if (page.url === '/docs/components') {
    body = catalog.map(group =>
      '## ' + group.title + '\n\n' + group.entries.map(({ title, url }) => `- [${title}](${url})`).join('\n')
    ).join('\n\n');
  }
  for (const part of component?.parts.slice(1) ?? []) {
    const text = readmeBody(await getComponentReadme(part.name).getText('raw'));
    body += '\n\n## ' + part.title + ' · ' + part.name + ' [#' + part.name + ']\n\n' +
      text.replace(/^## 用法\n+/, '').replace(/^## /gm, '### ');
  }
  return ['# ' + page.data.title, reference ? component?.name : page.data.description,
    body.replace(/\]\(\/(?!\/)/g, '](' + basePath + '/')
  ].filter(Boolean).join('\n\n');
}

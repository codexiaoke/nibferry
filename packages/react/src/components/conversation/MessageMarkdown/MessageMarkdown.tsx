'use client';

import { cloneElement, isValidElement, type ComponentPropsWithRef } from 'react';
import Markdown, { type Components, type ExtraProps } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CopyButton } from '../../input/CopyButton/CopyButton.js';
import { Checkbox } from '../../selection/Checkbox/Checkbox.js';
import { ScrollArea } from '../../layout/ScrollArea/ScrollArea.js';
import { Table } from '../../display/Table/Table.js';

function CodeBlock({ node, children }: ComponentPropsWithRef<'pre'> & ExtraProps) {
  const code = node?.children[0];
  const content = code?.type === 'element' ? code.children[0] : undefined;
  const classes = code?.type === 'element' ? code.properties.className : undefined;
  const languageClass = Array.isArray(classes) && classes.find(name => typeof name === 'string' && name.startsWith('language-'));
  const language = typeof languageClass === 'string' ? languageClass.slice(9) : undefined;
  let lines = children;
  if (isValidElement<ComponentPropsWithRef<'code'>>(children) && children.type === 'code' && typeof children.props.children === 'string') {
    lines = cloneElement(children, {}, children.props.children.split(/(?<=\n)/).map((line, i) =>
      <span key={i} data-nf-code-line="">{line}</span>));
  }
  return <div data-nf-message-code="">
    <div data-nf-code-toolbar=""><span>{language ?? '代码'}</span>
      <CopyButton label="复制代码" text={content?.type === 'text' ? content.value.replace(/\n$/, '') : ''} />
    </div>
    <ScrollArea orientation="horizontal" viewportProps={{ role: 'region', 'aria-label': '代码内容' }}>
      <pre>{lines}</pre>
    </ScrollArea>
  </div>;
}

const defaults: Components = {
  pre: CodeBlock,
  table: ({ node, ...props }) => <Table {...props} />,
  input: ({ checked }) => <Checkbox checked={checked} disabled aria-label={checked ? '已完成' : '未完成'} />,
};

export interface MessageMarkdownProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  children: string;
  components?: Components;
  onOpenLink?: (href: string) => void;
}

export function MessageMarkdown({ children, components, onOpenLink, onClick, ...props }: MessageMarkdownProps) {
  return <div {...props} data-nf-message-markdown="" onClick={event => {
    onClick?.(event);
    if (!onOpenLink || event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
    const href = link?.getAttribute('href');
    if (!href || !link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
    event.preventDefault();
    onOpenLink(href);
  }}>
    <Markdown skipHtml remarkPlugins={[remarkGfm]} components={{ ...defaults, ...components }}>{children}</Markdown>
  </div>;
}

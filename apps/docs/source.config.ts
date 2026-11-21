import { remarkStructureDefaultOptions } from 'fumadocs-core/mdx-plugins/remark-structure';
import { defineCollections, defineConfig, defineDocs } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content',
  docs: { postprocess: { includeProcessedMarkdown: true } },
});
export const componentReadmes = defineCollections({
  type: 'doc',
  dir: '../../packages/react/src/components',
  files: ['*/*/README.md'],
});
export default defineConfig({
  mdxOptions: {
    remarkStructureOptions: { types: [...remarkStructureDefaultOptions.types, 'code'] },
  },
});

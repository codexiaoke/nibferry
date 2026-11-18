import { remarkStructureDefaultOptions } from 'fumadocs-core/mdx-plugins/remark-structure';
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content',
  docs: { postprocess: { includeProcessedMarkdown: true } },
});
export default defineConfig({
  mdxOptions: {
    remarkStructureOptions: { types: [...remarkStructureDefaultOptions.types, 'code'] },
  },
});

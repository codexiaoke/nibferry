import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import type { theme } from './src/theme/tokens';

const themePath = fileURLToPath(new URL('./src/theme/values.json', import.meta.url));
const kebab = (name: string) => name.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

export default defineConfig({
  plugins: [
    {
      name: 'nibferry-theme',
      enforce: 'pre',
      transform(source, id) {
        if (!id.endsWith('/components/controls.module.css')) return;
        this.addWatchFile(themePath);
        const values: typeof theme = JSON.parse(readFileSync(themePath, 'utf8'));
        const variables = [
          ...Object.entries(values.color).map(
            ([name, value]) => '--nf-' + kebab(name) + ':' + value,
          ),
          ...Object.entries(values.motion).map(
            ([name, ms]) => '--nf-motion-' + name + ':' + ms + 'ms',
          ),
          '--nf-ease:cubic-bezier(' + values.easing.join(',') + ')',
        ].join(';');
        return source.replace('@nibferry-theme;', ':global(:where(:root)){' + variables + '}');
      },
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'styles.css.d.ts', source: 'export {};\n' });
      },
    },
  ],
  build: {
    lib: {
      entry: { index: 'src/index.ts', theme: 'src/theme/tokens.ts' },
      formats: ['es'],
      fileName: (_, name) => name + '.js',
      cssFileName: 'styles',
    },
    rolldownOptions: {
      external: /^react(?:-dom)?(?:\/|$)/,
      output: { banner: (chunk) => (chunk.name === 'index' ? '"use client";' : '') },
    },
  },
});

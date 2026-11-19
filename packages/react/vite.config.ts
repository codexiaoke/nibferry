import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import type { theme } from './src/theme/tokens';
import { themeVariables } from './src/theme/config.ts';

const themePath = fileURLToPath(new URL('./src/theme/values.json', import.meta.url));

const layoutPath = fileURLToPath(
  new URL('./src/components/layout/WorkspaceLayout/WorkspaceLayout.css', import.meta.url),
);

export default defineConfig({
  plugins: [
    {
      name: 'nibferry-theme',
      buildStart() {
        this.addWatchFile(themePath);
        this.addWatchFile(layoutPath);
      },
      generateBundle() {
        const values: typeof theme = JSON.parse(readFileSync(themePath, 'utf8'));
        const variables = Object.entries(
          themeVariables({
            colors: values.color,
            space: values.space,
            layout: values.layout,
            motion: { ...values.motion, easing: values.easing },
          }),
        )
          .map(([name, value]) => name + ':' + value)
          .join(';');
        this.emitFile({
          type: 'asset',
          fileName: 'styles.css',
          source: ':where(:root){' + variables + '}\n' + readFileSync(layoutPath, 'utf8'),
        });
        this.emitFile({ type: 'asset', fileName: 'styles.css.d.ts', source: 'export {};\n' });
      },
    },
  ],
  build: {
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
    },
    lib: {
      entry: { index: 'src/index.ts', theme: 'src/theme/tokens.ts' },
      formats: ['es'],
      fileName: (_, name) => name + '.js',
    },
  },
});

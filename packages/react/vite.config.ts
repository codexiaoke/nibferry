import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import type { theme } from './src/theme/tokens';
import { themeVariables } from './src/theme/config.ts';

const themePath = fileURLToPath(new URL('./src/theme/values.json', import.meta.url));

const stylePaths = [
  new URL('./src/components/layout/WorkspaceLayout/WorkspaceLayout.css', import.meta.url),
  new URL('./src/components/layout/PaneButton/PaneButton.css', import.meta.url),
  new URL('./src/components/layout/PaneHeader/PaneHeader.css', import.meta.url),
  new URL('./src/components/menu/MenuContent/MenuContent.css', import.meta.url),
].map((url) => fileURLToPath(url));

export default defineConfig({
  plugins: [
    {
      name: 'nibferry-theme',
      buildStart() {
        this.addWatchFile(themePath);
        for (const path of stylePaths) this.addWatchFile(path);
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
          source: [
            ':where(:root){' + variables + '}',
            ...stylePaths.map((path) => readFileSync(path, 'utf8')),
          ].join('\n'),
        });
        this.emitFile({ type: 'asset', fileName: 'styles.css.d.ts', source: 'export {};\n' });
      },
    },
  ],
  build: {
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', '@hugeicons/react', '@radix-ui/react-dropdown-menu'],
    },
    lib: {
      entry: {
        index: 'src/index.ts',
        theme: 'src/theme/tokens.ts',
        // Separate client entries retain their directives in the published ESM.
        'side-pane': 'src/components/layout/SidePane/SidePane.tsx',
        'pane-resize-handle': 'src/components/layout/PaneResizeHandle/PaneResizeHandle.tsx',
      },
      formats: ['es'],
      fileName: (_, name) => name + '.js',
    },
  },
});

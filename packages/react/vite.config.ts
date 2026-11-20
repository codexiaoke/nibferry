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
  new URL('./src/components/overlay/Dialog/Dialog.css', import.meta.url),
  new URL('./src/components/search/SearchDialog/SearchDialog.css', import.meta.url),
  new URL('./src/components/summary/SummaryCard/SummaryCard.css', import.meta.url),
  new URL('./src/components/navigation/WorkspaceTabList/WorkspaceTabList.css', import.meta.url),
  new URL('./src/components/navigation/ConversationList/ConversationList.css', import.meta.url),
  new URL('./src/components/navigation/NavigationRail/NavigationRail.css', import.meta.url),
  new URL('./src/components/navigation/SidebarMenu/SidebarMenu.css', import.meta.url),
  new URL('./src/components/feedback/CountBadge/CountBadge.css', import.meta.url),
  new URL('./src/components/navigation/ProjectInfo/ProjectInfo.css', import.meta.url),
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
      // Shared icon data must stay outside client entries that are also imported by the server.
      output: { codeSplitting: { groups: [{ name: 'icons', test: /@hugeicons\/core-free-icons/ }] } },
      external: ['react', 'react/jsx-runtime', 'react-dom', '@radix-ui/react-slot', '@hugeicons/react', '@floating-ui/dom', '@radix-ui/react-dropdown-menu'],
    },
    lib: {
      entry: {
        index: 'src/index.ts',
        theme: 'src/theme/tokens.ts',
        // Separate client entries retain their directives in the published ESM.
        'side-pane': 'src/components/layout/SidePane/SidePane.tsx',
        'pane-resize-handle': 'src/components/layout/PaneResizeHandle/PaneResizeHandle.tsx',
        'context-menu': 'src/components/menu/ContextMenu/ContextMenu.tsx',
        'dialog': 'src/components/overlay/Dialog/Dialog.tsx',
        'search-dialog': 'src/components/search/SearchDialog/SearchDialog.tsx',
        'conversation-group': 'src/components/navigation/ConversationGroup/ConversationGroup.tsx',
        'workspace-tab-list': 'src/components/navigation/WorkspaceTabList/WorkspaceTabList.tsx',
        'workspace-tab': 'src/components/navigation/WorkspaceTab/WorkspaceTab.tsx',
      },
      formats: ['es'],
      fileName: (_, name) => name + '.js',
    },
  },
});

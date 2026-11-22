import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import type { theme } from './src/theme/tokens';
import { themeVariables } from './src/theme/config.ts';

const themePath = fileURLToPath(new URL('./src/theme/values.json', import.meta.url));

const stylePaths = [
  new URL('./src/components/overlay/Popover/Popover.css', import.meta.url),
  new URL('./src/components/overlay/AlertDialog/AlertDialog.css', import.meta.url),
  new URL('./src/components/selection/Combobox/Combobox.css', import.meta.url),
  new URL('./src/components/feedback/Spinner/Spinner.css', import.meta.url),
  new URL('./src/components/feedback/Skeleton/Skeleton.css', import.meta.url),
  new URL('./src/components/display/AttachmentList/AttachmentList.css', import.meta.url),
  new URL('./src/components/display/AttachmentItem/AttachmentItem.css', import.meta.url),
  new URL('./src/components/input/NumberField/NumberField.css', import.meta.url),
  new URL('./src/components/display/Table/Table.css', import.meta.url),
  new URL('./src/components/navigation/Pagination/Pagination.css', import.meta.url),
  new URL('./src/components/input/Button/Button.css', import.meta.url),
  new URL('./src/components/input/Field/Field.css', import.meta.url),
  new URL('./src/components/input/Input/Input.css', import.meta.url),
  new URL('./src/components/selection/Slider/Slider.css', import.meta.url),
  new URL('./src/components/disclosure/Disclosure/Disclosure.css', import.meta.url),
  new URL('./src/components/navigation/Tabs/Tabs.css', import.meta.url),
  new URL('./src/components/feedback/Progress/Progress.css', import.meta.url),
  new URL('./src/components/selection/RadioGroup/RadioGroup.css', import.meta.url),
  new URL('./src/components/selection/Checkbox/Checkbox.css', import.meta.url),
  new URL('./src/components/selection/Switch/Switch.css', import.meta.url),
  new URL('./src/components/selection/Select/Select.css', import.meta.url),
  new URL('./src/components/overlay/Tooltip/Tooltip.css', import.meta.url),
  new URL('./src/components/feedback/Toast/Toast.css', import.meta.url),
  new URL('./src/components/display/Avatar/Avatar.css', import.meta.url),
  new URL('./src/components/display/Tag/Tag.css', import.meta.url),
  new URL('./src/components/feedback/Alert/Alert.css', import.meta.url),
  new URL('./src/components/feedback/EmptyState/EmptyState.css', import.meta.url),
  new URL('./src/components/layout/ScrollArea/ScrollArea.css', import.meta.url),
  new URL('./src/components/conversation/ConversationView/ConversationView.css', import.meta.url),
  new URL('./src/components/conversation/ComposerModelSelect/ComposerModelSelect.css', import.meta.url),
  new URL('./src/components/feedback/ContextUsage/ContextUsage.css', import.meta.url),
  new URL('./src/components/layout/WorkspaceLayout/WorkspaceLayout.css', import.meta.url),
  new URL('./src/components/layout/PaneButton/PaneButton.css', import.meta.url),
  new URL('./src/components/layout/PaneHeader/PaneHeader.css', import.meta.url),
  new URL('./src/components/menu/MenuContent/MenuContent.css', import.meta.url),
  new URL('./src/components/overlay/Dialog/Dialog.css', import.meta.url),
  new URL('./src/components/overlay/FloatingPanel/FloatingPanel.css', import.meta.url),
  new URL('./src/components/overlay/FloatingPanelTrigger/FloatingPanelTrigger.css', import.meta.url),
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
      external: ['react', 'react/jsx-runtime', 'react-dom', '@radix-ui/react-presence', '@radix-ui/react-slot', '@hugeicons/react', '@floating-ui/dom', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover', '@radix-ui/react-scroll-area', '@radix-ui/react-tooltip'],
    },
    lib: {
      entry: {
        index: 'src/index.ts',
        theme: 'src/theme/tokens.ts',
        // Separate client entries retain their directives in the published ESM.
        'popover': 'src/components/overlay/Popover/Popover.tsx',
        'pagination': 'src/components/navigation/Pagination/Pagination.tsx',
        'alert-dialog': 'src/components/overlay/AlertDialog/AlertDialog.tsx',
        'combobox': 'src/components/selection/Combobox/Combobox.tsx',
        'number-field': 'src/components/input/NumberField/NumberField.tsx',
        'field': 'src/components/input/Field/Field.tsx',
        'slider': 'src/components/selection/Slider/Slider.tsx',
        'tabs': 'src/components/navigation/Tabs/Tabs.tsx',
        'radio-group': 'src/components/selection/RadioGroup/RadioGroup.tsx',
        'select': 'src/components/selection/Select/Select.tsx',
        'tooltip': 'src/components/overlay/Tooltip/Tooltip.tsx',
        'toast': 'src/components/feedback/Toast/Toast.tsx',
        'avatar': 'src/components/display/Avatar/Avatar.tsx',
        'scroll-area': 'src/components/layout/ScrollArea/ScrollArea.tsx',
        'conversation-view': 'src/components/conversation/ConversationView/ConversationView.tsx',
        'activity-disclosure': 'src/components/conversation/ActivityDisclosure/ActivityDisclosure.tsx',
        'action-group': 'src/components/conversation/ActionGroup/ActionGroup.tsx',
        'conversation-composer': 'src/components/conversation/ConversationComposer/ConversationComposer.tsx',
        'composer-action-menu': 'src/components/conversation/ComposerActionMenu/ComposerActionMenu.tsx',
        'composer-model-select': 'src/components/conversation/ComposerModelSelect/ComposerModelSelect.tsx',
        'composer-select': 'src/components/conversation/ComposerSelect/ComposerSelect.tsx',
        'side-pane': 'src/components/layout/SidePane/SidePane.tsx',
        'pane-resize-handle': 'src/components/layout/PaneResizeHandle/PaneResizeHandle.tsx',
        'context-menu': 'src/components/menu/ContextMenu/ContextMenu.tsx',
        'dropdown-menu': 'src/components/menu/DropdownMenu/DropdownMenu.tsx',
        'menu-trigger': 'src/components/menu/MenuTrigger/MenuTrigger.tsx',
        'menu-content': 'src/components/menu/MenuContent/MenuContent.tsx',
        'dialog': 'src/components/overlay/Dialog/Dialog.tsx',
        'floating-panel': 'src/components/overlay/FloatingPanel/FloatingPanel.tsx',
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

# nibferry

## 0.4.0

### Minor Changes

- 2b321ca: 会话视图支持选区引用和向上加载历史。新增可标注来源的 MessageQuote，ConversationComposer 可在输入区上方放置引用和听写状态。附件卡支持上传进度、取消和重试，分页按钮支持自定义版本标签。
- 2b321ca: ConversationComposer 支持在文字上方放置附件，并通过 onFilesAdd 接收拖入或粘贴的文件。放在 ConversationView 中时，整个聊天区都可以接收拖入的文件。AttachmentList 新增横向卡片布局，AttachmentItem 支持自定义缩略图和纯图片卡片。

  UserMessage 支持通过 attachments 展示已发送的文件，图片缩略图与下方的文字气泡右对齐。
- 2b321ca: 新增 MessageMarkdown、MessageCard 和 CopyButton，支持 Markdown 回复排版、代码复制、正文引用回调和流内交互卡片。
- 2b321ca: UserMessage 和 AssistantMessage 支持 actions 插槽。新增 MessageActions，用于组合消息时间、操作按钮和菜单，并适配悬停、键盘和触屏。
- 2b321ca: 在会话输入框中发送消息会回到底部并恢复跟随回复。自定义输入区可使用 useConversationScrollToLatest 接入相同行为。
- 2b321ca: 新增 StreamingText 的像素显影、流光笔尖和轻量文字动效，支持助手回复中的卡片和 Markdown 行入场、附件缩略图清晰过渡。

## 0.3.0

### Minor Changes

- 56ebd1b: Add reusable form, selection, identity, and feedback components. Share selection, avatar, and empty-state rendering with the existing workspace controls.

  Add Textarea, Slider, Disclosure, Tabs, and Progress. The composer shares the multiline input and the model selector uses the stepped slider.
- 014aa00: Add an optional movable title bar to FloatingPanel with bounded pointer dragging and keyboard movement.

  Give the collapsed FloatingPanelTrigger a high-contrast launcher and support an unread reply indicator.
- 17b3096: Add a pinned NavigationRail footer and a composable account menu with an avatar trigger for icon rails and a full-width account row for expanded sidebars.
- 17b3096: Add a two-column SettingsDialog with configurable navigation and section content.
- 56ebd1b: Add anchored popovers, searchable selection, confirmation dialogs, loading indicators with text, circle, and block skeletons, attachments, numeric inputs, tables and pagination. Coordinate tab and menu highlights, selection feedback, overlay transitions, and toast dismissal with the motion theme.

## 0.2.0

### Minor Changes

- f115adf: Add optional collapsed content to LeftPane and a badge slot to PaneButton and NavigationRailItem.
- f115adf: Add composable conversation turns, an input dock, scrollable activity groups, and inline text and JSON results for tool actions.

  Anchor the configurable action menu above the full composer and keep the composer border steady when editing.
  Open the menu from configurable text triggers, with the matched query and draft range available to menu items.
  Compose independent left and right tool groups, provide an empty-draft action, and display controlled model or permission choices and context usage.

  Add a composer model picker with a discrete reasoning slider and a scrollable model list with optional provider groups.

  Export a themed vertical ScrollArea with an overlay thumb, shared by the conversation, activity groups and summary cards.

  Preserve the first activity in a streaming group and the reader's scroll position. Compose multiple text-triggered menus, use dialog-scoped pickers, and customize composer submission, search results, summary actions and project icons. Export floating panels and the themeVariables helper.
- 209c9fc: Add a conversation list with independently collapsible project groups and selectable conversations. Project and conversation rows support custom actions and context menus. Project rows also support hover details with a composable project information view.

  Add a vertical navigation rail and configurable icon buttons that can remain visible beside a collapsed pane.

  Add SidebarMenu and CountBadge for grouped sidebar shortcuts, counts, and status lists.
- fbf7069: Add composable dropdown menus and submenus.
- f1b2382: Add resizable, collapsible side panes and controls for toggling and maximizing the right pane.
  Add composable pane headers and toolbar buttons.
- a2fdcdf: 移除现有 React 组件及其专属类型。包根入口和主题入口均导出主题数据、配色预设及配置类型，样式入口提供默认 Token 的 CSS 变量。
- 209c9fc: Add Dialog for controlled modal content and SearchDialog for grouped, filterable results with keyboard navigation and action shortcuts.
- 94e56c7: Add composable workspace panes with configurable widths, single-pane views, and flex layouts.
- 209c9fc: Add composable summary cards, groups, items, and a controlled toolbar toggle.
- 209c9fc: Add composable workspace tabs with add, close, and reorder controls.

### Patch Changes

- f115adf: Respect hidden navigation controls, report the source of pane width changes, and focus the first available item when a dropdown opens from the keyboard during hydration.

# PreviewConversationMenu

用 Nibferry 的公开菜单部件搭建桌面会话菜单，展示带快捷键的操作、子菜单、分组标签与危险项。

```tsx
import PreviewConversationMenu from './PreviewConversationMenu';

<PreviewConversationMenu project="Nibferry" onCopyTitle={copyTitle} onCopyLink={copyLink} summaryId="summary"
  summaryLabel="查看会话摘要" onToggleSummary={toggleSummary}>
  <button type="button">当前会话</button>
</PreviewConversationMenu>
```

单个子元素作为触发器。复制链接、复制标题、摘要开关由传入的回调处理，其余会话操作和快捷键用于展示。

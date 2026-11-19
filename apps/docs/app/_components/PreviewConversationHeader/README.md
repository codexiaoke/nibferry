# PreviewConversationHeader

预览页用 `PaneHeader` 和 `PaneButton` 排列会话标题与操作，由 PreviewConversationMenu 将标题按钮接到公开的弹出菜单。标题栏窄于 184px 时，可从「复制」子菜单复制链接，从主菜单切换摘要。

```tsx
import PreviewConversationHeader from './PreviewConversationHeader';

<PreviewConversationHeader title="当前会话" active summaryId="summary"
  summaryOpen={open} onToggleSummary={() => setOpen(!open)} />
```

`active` 表示主体是否可用。右栏全屏或窄屏单独打开侧栏时，隐藏会话操作。`summaryId` 指向主体内的摘要。`summaryOpen` 和 `onToggleSummary` 在菜单与工具栏按钮之间共享。标题可用 Enter 或空格打开菜单，Escape 收起。

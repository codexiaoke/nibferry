# SidebarMenu

## 用法

在侧栏内组织一组带标题和操作的导航入口。可在同一个 LeftPane 中依次放置多个菜单和项目列表。

```tsx
import Inbox from '@hugeicons/core-free-icons/InboxIcon';
import { CountBadge, PaneButton, SidebarMenu, SummaryItem } from 'nibferry';

<SidebarMenu label="工作区菜单" heading="我的工作区">
  <PaneButton icon={Inbox} onClick={openInbox}
    text={<><span>待办</span><CountBadge count={pending.length} /></>} />
</SidebarMenu>
<SidebarMenu label="搜索结果">
  {matches.map(chat => <SummaryItem key={chat.id} trailing={chat.project}
    onSelect={() => openChat(chat.id)}>{chat.title}</SummaryItem>)}
</SidebarMenu>
```

## 参数与交互

`label` 是导航区的无障碍名称，也是默认标题。`heading` 可以替换标题内容，`actions` 放置标题右侧的操作，`children` 用于排列入口。标准 nav 属性、事件和 ref 透传给导航区。接入方控制数据、当前视图和每一项的回调。

用 Tab 移动焦点，原生按钮支持 Enter 和空格。间距继承主题的 space，文字和图标继承 ink、muted，悬停和按压沿用 feedback 动效。

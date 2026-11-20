# ConversationItem

显示一条可选择的会话，可独立使用或放入项目分组。

```tsx
import { ConversationItem, PaneButton } from '@nibferry/react';
import Pin from '@hugeicons/core-free-icons/PinIcon';
import Archive from '@hugeicons/core-free-icons/ArchiveIcon';

<ConversationItem current={activeId === chat.id} onClick={() => select(chat.id)}
  actions={<>
    <PaneButton icon={Pin} aria-label="置顶聊天" aria-pressed={chat.pinned} onClick={() => togglePin(chat.id)} />
    <PaneButton icon={Archive} aria-label="归档聊天" onClick={() => archive(chat.id)} />
  </>}>
  {chat.title}
</ConversationItem>
```

`children` 是会话名称。`current` 为当前项设置选中样式和 `aria-current="page"`。接入方通过 `onClick` 更新当前会话。支持按钮属性和 ref，Enter 或空格均可选择。长标题显示省略号，悬停和读屏可获取完整名称。

当前会话用底色标识，文字沿用列表字重。悬停和切换选中项时，底色按 `--nf-motion-feedback` 过渡。系统启用减少动态效果或主题关闭动效时，底色立即切换。

`actions` 是可选的行尾插槽，图标、顺序和回调均由接入方提供。桌面上悬停该行或用 Tab 聚焦时显示，平时标题可使用整行宽度。触屏直接显示操作。标题按钮和行尾操作可以分别聚焦，点击行尾按钮只执行该按钮的回调。

设置 `contextMenuContent={<MenuContent aria-label="会话操作">…</MenuContent>}` 可为该条目提供右键菜单。用 `MenuItem` 的 `onSelect` 绑定本条会话的命令。右键或聚焦后按 Shift+F10 打开菜单，当前会话由接入方的选择状态决定。

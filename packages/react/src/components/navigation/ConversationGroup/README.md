# ConversationGroup

以文件夹按钮展开或收起一组会话。接入方持有每组的展开状态，收起时会话条目保留在原位。

```tsx
import { ConversationGroup, ConversationItem } from '@nibferry/react';

<ConversationGroup label="Nibferry" expanded={open} onToggle={() => setOpen(!open)}>
  <ConversationItem onClick={openChat}>工作区布局</ConversationItem>
</ConversationGroup>
```

`label` 标识项目，`expanded` 控制显隐，`onToggle` 报告标题按钮的点击，`children` 接收组内内容。Tab 可聚焦标题，Enter 或空格切换展开状态。

左侧文件夹图标表示展开状态。默认的右侧箭头在鼠标悬停或键盘聚焦标题按钮时显示。

可用 `actions` 替换箭头，例如传入项目菜单触发按钮和新建会话按钮。鼠标停在项目行或键盘焦点进入该行时显示操作。触屏展开项目后也可使用行尾操作。点击行尾按钮由接入方处理。

`details` 接收浮层内容。悬停标题片刻后，信息卡在项目行旁打开。指针可以移入卡片进行操作，移出后关闭。聚焦标题按 → 可进入信息卡，Tab 移动到卡内按钮，Esc 返回标题。点击项目名仍触发 `onToggle`。

```tsx
<ConversationGroup label={name} expanded={open} onToggle={toggle}
  details={<ProjectInfo name={name} chatCount={chats.length} activeChatCount={activeCount} />}
  actions={<PaneButton icon={composeIcon} aria-label="新建聊天" onClick={newChat} />}>
  {items}
</ConversationGroup>
```

`ProjectInfo` 和 `PaneButton` 均从 `@nibferry/react` 导入。

分组按内容高度展开和收起，使用 `--nf-motion-reveal` 控制高度和透明度过渡。过渡中再次切换会从当前位置反向。收起开始时，组内条目即退出键盘顺序。系统启用减少动态效果或主题关闭动效时，分组立即切换。

`contextMenuContent` 接收可选的 `MenuContent`。在项目标题行右键或聚焦后按 Shift+F10，会收起项目信息卡并打开菜单。分组继续保持原来的展开状态。行尾菜单和右键菜单可以传入同一组 `MenuItem`。

# PreviewConversationList

展开侧栏和窄栏的「会话」浮层都使用这个列表，由公开的 ConversationGroup、ConversationItem 和 ConversationList 组成。点击项目名收展分组，悬停或按右方向键显示 ProjectInfo。行尾分别放置项目菜单和新建聊天按钮。

工作区传入 `projects`、`currentId` 和已展开的项目 ID。项目行通过 `onToggle` 收展，`onProjectChange` 更新项目，`onNewChat` 和 `onSelect` 与收起后的会话入口共用。

会话行通过 `ConversationItem.actions` 放置置顶与归档按钮。置顶将会话排到所属项目组首。归档会从列表隐藏该行，标题栏和摘要继续显示当前会话。

项目标题和会话行均通过 `contextMenuContent` 接入右键菜单。项目标题复用「⋯」的命令，会话条目复用行尾按钮的回调。

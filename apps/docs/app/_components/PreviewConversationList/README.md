# PreviewConversationList

用公开的 ConversationGroup、ConversationItem 和 ConversationList 组成预览左栏。项目名负责折叠分组，悬停或按右方向键展示 ProjectInfo。行尾分别放置项目菜单和新建聊天按钮。

工作区传入 `projects` 和 `currentId`。预览用 `onProjectChange` 更新置顶、名称与会话列表，用 `onSelect` 切换当前会话 ID。展开状态在本地按项目 ID 记录，修改名称后仍保留。项目改动只作用于当前预览。

会话行通过 `ConversationItem.actions` 放置置顶与归档按钮。置顶将会话排到所属项目组首。归档会从列表隐藏该行，标题栏和摘要继续显示当前会话。

项目标题和会话行均通过 `contextMenuContent` 接入右键菜单。项目标题复用「⋯」的命令，会话条目复用行尾按钮的回调。

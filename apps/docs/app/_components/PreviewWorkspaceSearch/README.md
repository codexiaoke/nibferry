# PreviewWorkspaceSearch

桌面预览共用一个 SearchDialog。工作区通过 `open` 和 `onOpenChange` 控制显示，展开菜单和收起图标栏的放大镜都打开它。

聊天来自 `chats`，文档及章节来自 `searchEntries`。选择结果分别调用 `onNewChat`、`onOpenChat` 或 `onOpenPage`。

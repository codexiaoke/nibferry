# PreviewSidebarMenu

项目列表上方的工作区菜单由 SidebarMenu、PaneButton 和 CountBadge 组成。标题显示组件库版本。待办和消息通知从各自的入口打开列表，数量来自当前预览中的可见记录。点击记录会打开关联会话。

点击放大镜打开 SearchDialog。聊天来自父级可见的 `chats`，资料、文件和章节来自本地文档索引 `searchEntries`。选择聊天调用 `onOpenChat`，选择资料通过 `onOpenPage` 在右栏打开。快捷操作「新聊天」调用 `onNewChat`，在当前项目创建会话。

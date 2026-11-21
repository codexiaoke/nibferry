# PreviewSidebarMenu

项目列表上方的工作区菜单由 SidebarMenu、PaneButton 和 CountBadge 组成。标题显示组件库版本。待办和消息通知从各自的入口打开列表，数量来自当前预览中的可见记录。点击记录会打开关联会话。

传入 `collapsedProjects` 时使用 NavigationRail。搜索、待办和通知显示为图标，数量放在按钮右上角。「会话」在按钮旁打开 PreviewConversationList，沿用侧栏的项目展开状态、当前会话及行尾操作。选中或新建聊天后关闭浮层，焦点回到「会话」。

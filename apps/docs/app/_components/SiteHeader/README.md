# SiteHeader

官网首页和文档布局使用 `<SiteHeader entries={getSearchIndex()} />` 渲染主导航、文档搜索与仓库入口。entries 是文档搜索索引。

设计规范和资源菜单可点击或用键盘展开。Escape 收起当前菜单并恢复焦点；选择链接、点击导航外部或打开搜索都会收起菜单。手机端通过导航按钮访问相同入口。

首页的预览入口打开独立的 Agent 桌面。

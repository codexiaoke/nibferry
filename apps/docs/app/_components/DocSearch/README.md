# DocSearch

官网全局文档搜索。由 SiteHeader 渲染 `<DocSearch entries={entries} onOpen={closeNavigation} />`。entries 是从 MDX 标题、章节与正文生成的索引，onOpen 在打开前收起主导航。

单击搜索或按 Cmd/Ctrl + K 打开。输入关键词筛选，方向键移动，Enter 跳转，Escape 或点击遮罩关闭。对话框将焦点限制在内部；首页 Token 筛选有独立状态。

面板和遮罩使用表面过渡时长，退出使用操作反馈时长。结果区随内容调整高度，选中背景跟随鼠标或键盘。系统开启减少动态效果时直接切换到目标状态。

# SidePane

LeftPane 和 RightPane 的内部实现，负责保留侧栏内容和本地宽度，并在启用调宽时组合公开的 PaneResizeHandle。

使用方从包根入口导入对应区域，例如 `import { LeftPane } from 'nibferry'` 后使用 `<LeftPane resizable>左侧</LeftPane>`。两侧共用的属性和回调见 [LeftPane](../LeftPane/README.md) 与 [RightPane](../RightPane/README.md)。

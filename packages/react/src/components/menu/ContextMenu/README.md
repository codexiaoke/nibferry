# ContextMenu

在指针位置打开右键菜单。触发区域保留自己的左键操作和布局。接入方用公开的菜单部件配置命令和回调。

```tsx
import { ContextMenu, MenuContent, MenuItem } from '@nibferry/react';
import '@nibferry/react/styles.css';

<ContextMenu content={
  <MenuContent aria-label="文档操作">
    <MenuItem onSelect={rename}>重命名</MenuItem>
  </MenuContent>
}>
  <button type="button" onClick={openDocument}>文档</button>
</ContextMenu>
```

`children` 是一个接收 DOM 事件的元素。自定义触发组件应把传入属性透传到触发区域。`content` 接收一个 `MenuContent`，可在其中组合菜单项、分组和子菜单。`onOpen` 在菜单打开时调用，可用来收起触发区域的悬停浮层。

右键在光标处打开菜单。聚焦触发区域后按 Shift+F10 或菜单键，菜单在焦点元素旁打开。方向键移动焦点，Enter 执行，Esc 收起并返回触发项。点击外部可关闭菜单。浮层沿用 MenuContent 的主题、边界避让和动效设置。

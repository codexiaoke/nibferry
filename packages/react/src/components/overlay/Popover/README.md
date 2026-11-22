# Popover

## 用法

在触发按钮旁显示可以交互的内容，靠近边缘时自动避让。

```tsx
import { Button, Popover } from 'nibferry';

<Popover label="来源信息" trigger={<Button>查看来源</Button>}>
  文档来自当前工作区。
</Popover>
```

## 参数与交互

trigger 接收可聚焦且能转发 ref 的元素。label 命名浮层，children 提供内容。可用 open / onOpenChange 受控，或用 defaultOpen 指定初始状态。side、align、sideOffset 与 className 可调整位置和外观。Esc 关闭并返回触发按钮。在 Dialog 内默认挂载到当前弹框，也可指定 container。

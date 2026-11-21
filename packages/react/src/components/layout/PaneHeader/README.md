# PaneHeader

## 用法

在一行里排列区域标题和末端操作。主体可以放会话标题，右栏可以放当前标签。标题区域随可用宽度收缩，操作保留自身宽度。

```tsx
import { PaneHeader } from 'nibferry';

<PaneHeader aria-label="会话标题栏" actions={<a href="#sources">查看来源</a>}>
  当前会话
</PaneHeader>
```

## 参数与交互

`children` 是标题或自定义触发器，`actions` 接收可选的操作节点。其余属性、事件和 ref 传给 header。布局宽度、标题省略、菜单行为与窄屏操作取舍由接入方控制。按钮依照传入顺序获得焦点，操作间距为 `--nf-space-sm` 的一半。

# MenuItem

显示可选操作，向宿主报告选择。

```tsx
import { MenuItem } from '@nibferry/react';
import Trash from '@hugeicons/core-free-icons/Delete02Icon';

<MenuItem icon={Trash} danger onSelect={onDelete}>删除</MenuItem>
```

在 MenuContent 或 MenuSubContent 内使用。`children` 为标签，`icon` 接收 Hugeicons 图标，`shortcut` 在末端显示快捷键提示，快捷键绑定由宿主管理。`danger` 使用 `--nf-menu-danger`，`disabled` 跳过焦点与选择。鼠标、Enter 和空格触发 `onSelect`。在回调中调用 `event.preventDefault()` 可保持菜单打开。

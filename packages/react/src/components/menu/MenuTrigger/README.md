# MenuTrigger

打开同一个 DropdownMenu 中的面板。

```tsx
import { MenuTrigger, PaneButton } from '@nibferry/react';
import More from '@hugeicons/core-free-icons/MoreHorizontalIcon';

<MenuTrigger asChild><PaneButton icon={More} aria-label="更多操作" /></MenuTrigger>
```

默认渲染 button，支持 button 属性和 ref。`asChild` 复用已有按钮，该按钮需要将属性和 ref 传到 DOM。Enter、空格或向下键打开，Escape 关闭后焦点回到触发器。

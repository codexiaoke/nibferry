# MenuSubContent

在当前菜单旁展开下一层操作。

```tsx
import { MenuSubContent, MenuItem } from '@nibferry/react';

<MenuSubContent><MenuItem onSelect={copyTitle}>复制会话标题</MenuItem></MenuSubContent>
```

在 MenuSub 内与 MenuSubTrigger 配对。默认样式下，两层菜单的外边框之间留出 8px，子菜单首行与触发项的上沿对齐。自定义 `sideOffset` 时，偏移量从触发项边缘算起。遇到视口边缘时，子菜单自动调整位置。支持 `alignOffset`、`collisionPadding`、`container` 和 ref。面板主题变量与 MenuContent 相同。以从左往右排版为例，向左键退回上一级并聚焦原入口。

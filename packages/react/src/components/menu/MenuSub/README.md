# MenuSub

连接一个子菜单的入口和面板。

```tsx
import { MenuSub, MenuSubTrigger, MenuSubContent, MenuItem } from '@nibferry/react';

<MenuSub>
  <MenuSubTrigger>复制</MenuSubTrigger>
  <MenuSubContent><MenuItem onSelect={copyLink}>复制链接</MenuItem></MenuSubContent>
</MenuSub>
```

放在已打开的菜单内，可继续嵌套。支持 `defaultOpen` 或受控的 `open`、`onOpenChange`。

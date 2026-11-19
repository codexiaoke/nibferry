# DropdownMenu

保存菜单开合状态，连接触发器和面板。

```tsx
import { DropdownMenu, MenuTrigger, MenuContent, MenuItem } from '@nibferry/react';
import '@nibferry/react/styles.css';

<DropdownMenu>
  <MenuTrigger>操作</MenuTrigger>
  <MenuContent><MenuItem onSelect={copyLink}>复制链接</MenuItem></MenuContent>
</DropdownMenu>
```

`defaultOpen` 指定初始状态，也可用 `open`、`onOpenChange` 从外部控制。`modal={false}` 允许和外部页面交互。`dir` 指定书写方向。菜单项通过 `onSelect` 通知宿主。

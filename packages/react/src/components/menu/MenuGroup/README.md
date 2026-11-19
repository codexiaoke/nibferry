# MenuGroup

将同一组操作组织在一起，可显示分组名称。

```tsx
import { MenuGroup, MenuItem } from '@nibferry/react';

<MenuGroup label="项目"><MenuItem onSelect={move}>移至项目</MenuItem></MenuGroup>
```

在 MenuContent 或 MenuSubContent 内使用。`label` 作为可见标题和分组的可访问名称。`children` 接收菜单项和子菜单。分组名称跳过键盘导航。

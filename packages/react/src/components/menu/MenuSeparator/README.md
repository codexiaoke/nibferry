# MenuSeparator

在两组操作之间显示分隔线。

```tsx
import { MenuItem, MenuSeparator } from '@nibferry/react';

<><MenuItem>复制</MenuItem><MenuSeparator /><MenuItem>归档</MenuItem></>
```

放在 MenuContent 或 MenuSubContent 内。支持 `className`、`style` 和 ref，线色取 `--nf-line`。分隔线跳过键盘导航。

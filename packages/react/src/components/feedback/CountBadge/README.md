# CountBadge

显示条目数量，超过 99 时显示「99+」，悬停可查看完整数值。

```tsx
import { CountBadge } from '@nibferry/react';

<CountBadge count={notifications.length} />
```

`count` 为接入方提供的非负整数，零显示为 0。支持标准 span 属性和 ref。徽标使用主题的 `--nf-accent-text`、`--nf-canvas` 和 `--nf-space-sm`。操作由所在的菜单项处理。

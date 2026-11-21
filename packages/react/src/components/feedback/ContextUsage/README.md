# ContextUsage

用圆环显示上下文已使用的百分比。圆环在 16px 的图标区域内居中，间距由工具组控制。数值由接入方根据当前会话或模型提供。

```tsx
import { ContextUsage } from '@nibferry/react';

<ContextUsage value={38} title="上下文已使用 38%" />
```

`value` 的单位是百分比，显示范围为 0 到 100。非有限值隐藏圆环。悬停显示 `title`，读屏可读取用量和范围。通过 `aria-label`、`aria-valuetext` 自定义名称与读数，支持 span 的样式属性与 ref。

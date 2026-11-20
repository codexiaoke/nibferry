# SummaryCard

在页面中承载相关条目的摘要。卡片支持原生 `aside` 的属性和 ref，使用方通过 `id`、`aria-label` 和 `hidden` 关联开关、命名及控制显示。

```tsx
import { SummaryCard } from '@nibferry/react';
import '@nibferry/react/styles.css';

<SummaryCard id="sources" aria-label="来源摘要" hidden={!open}>
  {children}
</SummaryCard>
```

放在需要呈现摘要的容器内，由容器决定位置。默认宽 300px，并受父级宽度限制。内容可以是 SummaryGroup 或自定义节点。背景、文字和边框沿用 `--nf-canvas`、`--nf-ink` 和 `--nf-line`。投影可通过 `--nf-summary-shadow` 设置。展开时使用主题反馈时长，并遵循减少动态效果偏好。

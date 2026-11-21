# SummaryGroup

## 用法

用有名称的分组组织相关条目。可单独使用，放在 SummaryCard 中时，相邻分组之间有细分隔线。

```tsx
import { SummaryGroup, SummaryItem } from 'nibferry';

<SummaryGroup label="来源">
  <SummaryItem>布局规范</SummaryItem>
</SummaryGroup>
```

## 参数与交互

`label` 同时作为可见标题和分组的无障碍名称，`children` 可接收任意内容。其余属性和 ref 透传至分组容器。标题使用 `--nf-muted`。

`actions` 接受 React 节点，放在标题行末端，可用于「添加来源」等操作，按钮和回调由接入方提供。

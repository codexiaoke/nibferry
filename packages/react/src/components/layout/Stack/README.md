# Stack

## 用法

按顺序纵向排列直接子项。可以独立使用，也可以与 Inline 嵌套。

```tsx
import { Stack } from 'nibferry';

<Stack gap="md">
  <span>第一条消息</span>
  <span>第二条消息</span>
</Stack>
```

## 参数与交互

| 属性 | 含义 |
| --- | --- |
| `gap` | `sm`、`md`、`lg`，默认 `md`。默认间距分别为 8、16、24px。 |
| `align` | CSS `align-items`，控制横向对齐，默认由浏览器拉伸子项。 |
| `children` | 任意 React 子项，按传入顺序排列。 |

根元素接收标准 div 属性、事件、ref 和 style。组件仅负责布局；交互状态、键盘行为与焦点由子项管理。间距取自最近作用域的 `--nf-space-sm`、`--nf-space-md`、`--nf-space-lg`。

# Inline

## 用法

按顺序横向排列直接子项，可用于工具栏和操作组。可独立使用。

```tsx
import { Inline } from 'nibferry';

<Inline gap="sm" wrap>
  <button type="button">文件</button>
  <button type="button">链接</button>
</Inline>
```

## 参数与交互

| 属性 | 含义 |
| --- | --- |
| `gap` | `sm`、`md`、`lg`，默认 `sm`。默认间距分别为 8、16、24px。 |
| `align` | CSS `align-items`，控制纵向对齐，默认 `center`。 |
| `wrap` | 允许空间不足的子项换行，默认 `false`。 |
| `children` | 任意 React 子项，按传入顺序排列。 |

根元素接收标准 div 属性、事件、ref 和 style。组件仅负责布局；子项保留自身的事件与键盘焦点顺序。间距取自最近作用域的 `--nf-space-sm`、`--nf-space-md`、`--nf-space-lg`。

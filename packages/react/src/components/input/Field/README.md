# Field

## 用法

为单个表单控件关联标签、说明和错误信息。

```tsx
import { Field, Input } from 'nibferry';

<Field label="工作区名称" hint="显示在侧栏中"><Input name="name" /></Field>
```

## 参数与交互

`label` 是可点击的标签。`hint` 和 `error` 通过 `aria-describedby` 关联到控件；有错误时标记 `aria-invalid`。`children` 接受一个能转发 `id`、`aria-describedby`、`aria-invalid` 的控件，保留控件已有的说明和 ID。其余属性作用在外层 div。

# Input

## 用法

统一文本输入框的外观并保留原生表单行为。

```tsx
import { Input } from 'nibferry';

<Input aria-label="搜索项目" type="search" placeholder="搜索项目" />
```

## 参数与交互

`type` 支持 text、search、email、password、url 和 tel。支持 `value` / `onChange`、`defaultValue`、表单校验、禁用和 ref。有可见标签时可搭配 Field。

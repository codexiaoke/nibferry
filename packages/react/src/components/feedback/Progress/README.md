# Progress

## 用法

显示已完成的工作量；省略数值可展示总量未知的进行中状态。

```tsx
import { Progress } from 'nibferry';

<Progress label="导入进度" value={3} max={5} />
```

## 参数与交互

`label` 为无障碍名称。`max` 默认 100，`value` 限于 0 到上限之间。未知进度省略 `aria-valuenow`，启用减少动效时显示静止指示。外层支持 div 属性、ref 和 `aria-valuetext`，填充色可以用 `--nf-progress-fill` 覆盖。

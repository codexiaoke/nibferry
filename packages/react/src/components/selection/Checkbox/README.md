# Checkbox

## 用法

在多个独立选项中勾选一项。

```tsx
import { Checkbox } from 'nibferry';

<label><Checkbox name="mentions" defaultChecked /> 仅在提到我时通知</label>
```

## 参数与交互

支持原生复选框的 `checked`、`defaultChecked`、`onChange`、`name`、`value`、`disabled` 和 ref。回调通过 `event.currentTarget.checked` 读取新值。由外部 label 或 `aria-label` 命名，空格键切换。

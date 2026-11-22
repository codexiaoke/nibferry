# NumberField

## 用法

输入精确数值，或按设置的步长增减。

```tsx
import { Field, NumberField } from 'nibferry';

<Field label="每页条数"><NumberField value={size} onValueChange={setSize} min={1} max={50} /></Field>
```

## 参数与交互

value 为数字或 null（空值），onValueChange 报告输入。min、max 与 step 沿用原生数字输入的范围和约束验证，步进按钮遵守边界。转发 name、required、disabled、readOnly、ref 等原生属性。

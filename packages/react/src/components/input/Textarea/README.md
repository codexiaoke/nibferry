# Textarea

## 用法

用于输入多行文字。搭配 Field 关联名称、提示和错误信息。

```tsx
import { Field, Textarea } from 'nibferry';

<Field label="备注"><Textarea name="notes" defaultValue="" rows={4} /></Field>
```

## 参数与交互

转发原生 textarea 的属性和 ref。默认显示三行，支持 `value` 与 `onChange`、`defaultValue`、`maxLength`、禁用和只读。Enter 在文本中换行。

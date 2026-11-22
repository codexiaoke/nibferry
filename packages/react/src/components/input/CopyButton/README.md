# CopyButton

## 用法

复制消息或代码后显示勾选反馈。写入失败时提示手动复制。

```tsx
import { CopyButton } from 'nibferry';

<CopyButton label="复制代码" text={snippet} />
```

## 参数与交互

`text` 是要写入剪贴板的原文，`label` 设置按钮名称和提示，默认「复制」。空文本或 `disabled` 会禁用按钮。支持原生 button 属性、键盘操作和 `ref`。按钮使用 PaneButton 的颜色和动效。

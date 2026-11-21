# SummaryToggle

## 用法

控制页面中一张摘要卡片的显示。按钮可独立放在标题栏，多个入口可以共享同一份状态。

```tsx
import { SummaryToggle } from 'nibferry';

<SummaryToggle paneId="sources" expanded={open} onClick={() => setOpen(!open)} />
```

## 参数与交互

`paneId` 指向卡片的 `id`，`expanded` 同步按钮的展开状态和无障碍名称。接入方通过 `onClick` 更新状态。支持按钮属性、ref 和自定义 `aria-label`。沿用 PaneButton 的焦点和按压反馈，Enter 和空格可切换。

# SummaryItem

## 用法

展示一个摘要条目，可以用于卡片、来源列表或消息。传入 `onSelect` 时渲染原生按钮，鼠标点击、Enter 和空格均可触发。展示条目使用普通文本行。

```tsx
import { SummaryItem } from 'nibferry';

<SummaryItem trailing="2 份文档">变更</SummaryItem>
<SummaryItem onSelect={() => openFile(file.id)}>{file.name}</SummaryItem>
```

## 参数与交互

`children` 是标签。`icon` 接收 Hugeicons 图标数据，`trailing` 接收数量、状态等末端内容。`disabled` 禁用带操作的条目。`className` 作用于整行。操作后的导航或面板切换由接入方决定。条目继承文字色，末端使用 `--nf-muted`，键盘焦点使用 `--nf-accent`。

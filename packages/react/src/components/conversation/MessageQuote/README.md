# MessageQuote

显示草稿或已发送消息引用的原文。传入 `onOpen` 可回到引用来源，传入 `onRemove` 可在草稿中移除引用。来源消息 ID 和版本由宿主持有。

```tsx
import { MessageQuote } from 'nibferry';

<MessageQuote source="助手回复" text={quote.text} onOpen={() => showMessage(quote.id)} onRemove={clearQuote} />
```

`text` 为必填字符串。引文最多展示两行。`source` 可选，用于在引文上方显示来源名称。移除按钮紧邻引文。两项操作均支持键盘，其他 div 属性及 ref 传给外层。

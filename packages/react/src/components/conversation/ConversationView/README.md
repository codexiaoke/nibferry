# ConversationView

会话的独立滚动区和输入区。父容器需提供高度。

```tsx
import { ConversationView } from '@nibferry/react';

<ConversationView composer={<MyComposer />} empty={<h2>想先看什么？</h2>}>
  {turns.map(turn => <MyTurn key={turn.id} turn={turn} />)}
</ConversationView>
```

消息区使用 `ScrollArea` 的悬浮滑块。宿主可用 `--nf-conversation-inset-end` 为右侧摘要预留正文和输入区的空间，滑块仍位于整个消息区的外沿。

`children` 放回合，`composer` 放任意输入区，`empty` 在没有回合时显示。靠近底部时跟随新增内容，向上滚动后可用返回按钮回到底部。`latestLabel` 设置按钮的无障碍名称。`--nf-conversation-width` 同时调整正文和输入区的最大宽度。其余属性传给根 div。

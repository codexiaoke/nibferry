# ConversationView

## 用法

会话的独立滚动区和输入区。父容器需提供高度。

```tsx
import { ConversationView } from 'nibferry';

<ConversationView composer={<MyComposer />} empty={<h2>想先看什么？</h2>}>
  {turns.map(turn => <MyTurn key={turn.id} turn={turn} />)}
</ConversationView>
```

## 参数与交互

消息区使用 `ScrollArea` 的悬浮滑块。宿主可用 `--nf-conversation-inset-end` 为右侧摘要预留正文和输入区的空间，滑块仍位于整个消息区的外沿。

`children` 放回合，`composer` 放任意输入区，`empty` 在没有回合时显示。靠近底部时跟随新增内容。上翻阅读时保留位置，可用返回按钮回到底部。在 ConversationComposer 中发送消息会直接回到当前会话底部，并继续跟随后续回复。`latestLabel` 设置返回按钮的无障碍名称。`--nf-conversation-width` 同时调整正文和输入区的最大宽度。其余属性传给根 div。

在 `composer` 插槽内自定义发送入口时，可调用 `useConversationScrollToLatest()` 取得回到底部的函数，在提交消息后调用它。标准输入框的回车和发送按钮已接入这一行为。

当 `composer` 中的 `ConversationComposer` 配有 `onFilesAdd` 时，消息、空白区和输入框共同接收拖入的文件。文件进入时，聊天区显示淡色背景，中央提示「松开以添加附件」。移出或松开时提示消失，放入的文件交给该输入框的回调。

## 引用与向前分页

`onQuoteSelection({ text, message })` 启用选区旁的引用按钮。按钮在选中文字上方居中，顶部空间不足时移到下方。`text` 保留选区原文，`message` 指向对应的助手正文元素。可在 AssistantMessage 上设置来源 ID，通过回调把原文及其版本放入宿主的草稿。

传入 `onLoadEarlier` 后，向上滚至顶部或点击「加载更早消息」会调用该函数，可返回 Promise。将旧回合以稳定的 React key 插到列表前端，原先第一条消息会保留屏幕位置。请求失败可重试，最后一页加载完毕后移除回调。

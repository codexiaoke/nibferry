# AssistantMessage

## 用法

展示助手回答，按子元素的顺序排版。

```tsx
import { AssistantMessage } from 'nibferry';

<AssistantMessage><p>这是布局草图。</p><LayoutSketch /><p>可以继续编辑。</p></AssistantMessage>
```

## 参数与交互

支持原生 div 属性和 `ref`。`children` 可混排文本、Markdown 渲染结果或可交互的 React 元素。消息解析和流式数据更新由应用处理。

`actions` 放置回复下方的操作，可用 [MessageActions](../MessageActions/README.md) 组合复制、反馈、朗读与更多菜单。回复中断时，保留收到的内容并在其下方显示重试操作。

传入 `streaming` 后，新出现的 MessageCard 整块进入，Markdown 表格行和代码行轻淡入。用稳定的 key 追加内容可以保留审批结果和编辑焦点。纯文本使用 [StreamingText](../StreamingText/README.md) 选择出字效果。

# AssistantMessage

## 用法

展示助手回答，按子元素的顺序排版。

```tsx
import { AssistantMessage } from 'nibferry';

<AssistantMessage><p>这是布局草图。</p><LayoutSketch /><p>可以继续编辑。</p></AssistantMessage>
```

## 参数与交互

支持原生 div 属性和 `ref`。`children` 可混排文本、Markdown 渲染结果或可交互的 React 元素。消息解析和流式数据更新由应用处理。

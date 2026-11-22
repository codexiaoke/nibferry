# MessageMarkdown

## 用法

在助手回复中排版 Markdown 文本。支持标题、列表、行内代码、GFM 表格及可复制的围栏代码块。

```tsx
import { AssistantMessage, MessageMarkdown } from 'nibferry';

<AssistantMessage>
  <MessageMarkdown onOpenLink={openInWorkspace}>{reply.markdown}</MessageMarkdown>
</AssistantMessage>
```

## 参数与交互

`children` 是 Markdown 字符串，可随回复更新。`onOpenLink(href)` 接管普通点击和键盘打开链接，修饰键点击保留浏览器行为。未提供回调时使用标准链接。原始 HTML 会被跳过，链接沿用 react-markdown 的 URL 过滤。

`components` 可以覆盖单个 Markdown 元素的渲染，例如自定义链接或表格。外层支持 div 属性及 `ref`。默认表格和代码使用 Nibferry 的横向滚动区，代码复制保留缩进和换行。背景、正文、边框和链接读取当前主题。

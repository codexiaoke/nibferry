# StreamingText

展示持续追加的纯文本，可嵌入段落或自定义消息。每次将最新的完整文本传给组件。

```tsx
import { StreamingText } from 'nibferry';

<p><StreamingText streaming={running} effect="pixel">{reply}</StreamingText></p>
```

`children` 是累计文本。`streaming` 在完成、停止或失败时设为 `false`，立即显示当前正文。
`effect` 支持 `pixel`（默认，像素显影）、`pen`（流光笔尖）和 `plain`（只看文字）。已显示的文字可选择、复制。支持原生 span 属性与 ref。

动效采用主题的 feedback、reveal 时长并遵从系统减少动效设置。可用 CSS 变量 `--nf-stream-pixel`、`--nf-stream-ink` 和 `--nf-stream-trail` 修改显影、笔尖和尾迹颜色。

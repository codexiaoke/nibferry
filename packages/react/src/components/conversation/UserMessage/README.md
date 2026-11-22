# UserMessage

## 用法

展示靠右的用户消息。

```tsx
import { AttachmentItem, AttachmentList, UserMessage } from 'nibferry';

<UserMessage>帮我看一下工作区布局。</UserMessage>

<UserMessage attachments={
  <AttachmentList layout="strip" aria-label="消息附件">
    <AttachmentItem name="布局.png" imageOnly preview={<img src={imageUrl} alt="" />} onOpen={openInRightPane} />
  </AttachmentList>
}>按这张图调整布局。</UserMessage>
```

## 参数与交互

`children` 是气泡内容。`attachments` 放在气泡上方，与文字右对齐。只传附件即可展示一条文件消息。点击附件后的预览由 `onOpen` 决定。

已发送图片的缩略图默认边长 80px，可通过 `--nf-message-thumbnail-size` 调整。支持原生 div 属性和 `ref`。气泡背景与文字使用 `--nf-primary` 和 `--nf-on-primary`。

`actions` 放置靠右对齐的消息操作栏或发送失败提示。可用 [MessageActions](../MessageActions/README.md) 组合复制和编辑按钮。

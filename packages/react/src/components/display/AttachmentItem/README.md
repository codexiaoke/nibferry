# AttachmentItem

## 用法

显示文件名、说明与可选操作。

```tsx
import { AttachmentItem } from 'nibferry';

<AttachmentItem name="设计稿.pdf" detail="上传中" onOpen={preview} onRemove={remove} />
```

## 参数与交互

name 为文件名，icon 可替换文件图标，detail 接收大小、传输状态或自定义内容。传入 onOpen 或 onRemove 时显示对应按钮。上传、删除和确认流程由宿主管理。

在 `AttachmentList layout="strip"` 中，`preview` 可以传图片或文档首页。图片卡使用 `imageOnly` 铺满缩略图，文件名仍作为可访问名称。文档卡保留底部图标与文件名。移除按钮在悬停、键盘焦点进入卡片或触屏时显示，点击与打开文件是独立操作。

可用 `transfer={{ state: 'uploading', progress: 42, onCancel }}` 展示上传进度并允许取消，省略 progress 显示不定进度。失败或取消后传 `{ state: 'failed' | 'cancelled', message, onRetry }`，完成后移除 transfer。message 和操作回调均可省略。上传和发送策略由宿主持有，同一列表可同时展示不同文件的状态。

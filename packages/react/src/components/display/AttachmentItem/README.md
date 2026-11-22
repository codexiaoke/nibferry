# AttachmentItem

## 用法

显示文件名、说明与可选操作。

```tsx
import { AttachmentItem } from 'nibferry';

<AttachmentItem name="设计稿.pdf" detail="上传中" onOpen={preview} onRemove={remove} />
```

## 参数与交互

name 为文件名，icon 可替换文件图标，detail 接收大小、传输状态或自定义内容。传入 onOpen 或 onRemove 时显示对应按钮。上传、删除和确认流程由宿主管理。

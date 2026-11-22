# AttachmentThumbnail

在附件预留的位置展示缩略图。图片载入时，取原图的低分辨率采样并过渡到清晰图像。尺寸由预览区域控制。

```tsx
import { AttachmentItem, AttachmentThumbnail } from 'nibferry';

<AttachmentItem name={file.name} preview={<AttachmentThumbnail src={file.thumbnail} alt="" />} />
```

接受原生 img 属性，包含 `src`、`alt`、`onLoad`、`onError` 与 `ref`。缩略图采用主题 reveal 时长，减少动效时直接显示原图。

# AttachmentList

## 用法

将多个附件作为一组呈现。

```tsx
import { AttachmentList, AttachmentItem } from 'nibferry';

<AttachmentList aria-label="待发送附件"><AttachmentItem name="会议纪要.md" /></AttachmentList>
```

## 参数与交互

children 通常为 AttachmentItem。通过 aria-label 命名列表，透传 ul 的其他属性和 ref。附件顺序由接入方决定。

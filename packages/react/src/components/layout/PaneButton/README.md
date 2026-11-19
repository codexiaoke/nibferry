# PaneButton

用于标题、分享和摘要等栏内操作。左右栏开关与全屏按钮也使用这套点击区域、焦点和按压样式。

```tsx
import { PaneButton } from '@nibferry/react';
import List from '@hugeicons/core-free-icons/LeftToRightListBulletIcon';
import '@nibferry/react/styles.css';

<PaneButton icon={List} paneId="summary" aria-expanded={open}
  aria-label="会话摘要" onClick={() => setOpen(!open)} />
```

传入 Hugeicons 的 `icon`，可用 `text` 附加文字或标题节点。`children` 可替换按钮内容。控制页面区域时，可用 `paneId` 设置 `aria-controls`。纯图标按钮需要可访问名称。标准 button 属性、点击回调与 ref 直接传给按钮。焦点取 `--nf-accent`，图标和悬停底色取 `--nf-muted`。

悬停时底色渐变，按下时图标轻微缩小。时长取 `--nf-motion-feedback`，按钮的点击区域始终保持原尺寸。

# LeftPane

工作区的左侧区域。作为 WorkspaceLayout 的直接子元素时，默认宽度为 240px。通过 `width` 传入像素数值或 CSS 长度即可调整。区域内显示调用方传入的内容。

```tsx
import { WorkspaceLayout, LeftPane } from '@nibferry/react';
import '@nibferry/react/styles.css';

<WorkspaceLayout compactPane="left">
  <LeftPane width={224} aria-label="左侧">左侧</LeftPane>
</WorkspaceLayout>
```

支持 `children` 及标准 aside 属性，包括 `className`、`style`、DOM 事件和 `ref`。焦点顺序沿用子元素的 DOM 顺序，无专用回调。

默认宽度继承 `--nf-layout-left-pane-width`。传入 `width` 时使用该值，同时指定 `style.width` 时以样式为准。在 WorkspaceLayout 上设置 `expandedPane="left"` 可让左侧区域铺满容器。

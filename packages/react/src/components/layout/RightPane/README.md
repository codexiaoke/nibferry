# RightPane

工作区的右侧区域。作为 WorkspaceLayout 的直接子元素时，默认宽度为 320px。通过 `width` 传入像素数值或 CSS 长度即可调整。区域内显示调用方传入的内容。

```tsx
import { WorkspaceLayout, RightPane } from '@nibferry/react';
import '@nibferry/react/styles.css';

<WorkspaceLayout compactPane="right">
  <RightPane width="30%" aria-label="右侧">右侧</RightPane>
</WorkspaceLayout>
```

支持 `children` 及标准 aside 属性，包括 `className`、`style`、DOM 事件和 `ref`。焦点顺序沿用子元素的 DOM 顺序，无专用回调。

默认宽度继承 `--nf-layout-right-pane-width`。传入 `width` 时使用该值，同时指定 `style.width` 时以样式为准。在 WorkspaceLayout 上设置 `expandedPane="right"` 可让右侧区域铺满容器。

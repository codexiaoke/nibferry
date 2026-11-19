# MainPane

工作区的主体区域。作为 WorkspaceLayout 的直接子元素时，自动占据两侧之间的剩余宽度。作为页面主内容时可传入 role="main"。区域内显示调用方传入的内容。

```tsx
import { WorkspaceLayout, MainPane } from '@nibferry/react';
import '@nibferry/react/styles.css';

<WorkspaceLayout>
  <MainPane role="main">主体</MainPane>
</WorkspaceLayout>
```

支持 `children` 及标准 div 属性，包括 `className`、`style`、DOM 事件和 `ref`。焦点顺序沿用子元素的 DOM 顺序，无专用回调。

在 WorkspaceLayout 上设置 `expandedPane="main"` 可让主体铺满容器。切换到其他栏时，主体的子元素保留挂载。

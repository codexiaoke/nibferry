# RightPane

工作区的右侧区域。作为 WorkspaceLayout 的直接子元素时，默认宽度为 320px。通过 `width` 传入像素数值或 CSS 长度即可调整。区域内显示调用方传入的内容。

```tsx
import { WorkspaceLayout, RightPane } from '@nibferry/react';
import '@nibferry/react/styles.css';

<WorkspaceLayout compactPane="right">
  <RightPane width="30%" aria-label="右侧">右侧</RightPane>
</WorkspaceLayout>
```

支持 `children` 及标准 aside 属性，包括 `className`、`style`、DOM 事件和 `ref`。子元素沿用 DOM 焦点顺序。

默认宽度继承 `--nf-layout-right-pane-width`。传入 `width` 时使用该值，同时指定 `style.width` 时以样式为准。在 WorkspaceLayout 上设置 `expandedPane="right"` 可让右侧区域铺满容器。

设置 `collapsed` 可收起右栏，释放空间，并保留内容和调好的栏宽。收展使用主题动效，开启减少动态效果时立即切换。栏外可使用 [RightPaneToggle](../RightPaneToggle/README.md) 或宿主自己的按钮。将 `fullscreen` 和主体的 `hidden` 绑定到同一状态，可从当前栏宽平滑展开至左侧导航边缘，再还原。全屏组合见 [RightPaneFullscreenToggle](../RightPaneFullscreenToggle/README.md)。

## 调整宽度

在与 MainPane 并排的工作区中使用 `<RightPane resizable>右侧</RightPane>`，组件管理拖动后的宽度。可用 `defaultWidth` 设置起始宽度，或通过 `width` 和 `onWidthChange` 一起接管宽度。仅提供 `onWidthChange` 时仍由组件保存宽度，回调报告像素值和来源。来源为 `user` 时由用户调宽，为 `container` 时由容器压缩。自定义初始样式支持 `style.width`，受控时请用 `width` 作为唯一的宽度来源。

分隔线可通过 Tab 聚焦，支持左右方向键、Shift 加速、Home 和 End。窄屏与单栏展开时手柄自动收起，恢复分栏时沿用最近宽度。详细键盘与主题规则见 [PaneResizeHandle](../PaneResizeHandle/README.md)。

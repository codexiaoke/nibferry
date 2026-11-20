# LeftPane

工作区的左侧区域。作为 WorkspaceLayout 的直接子元素时，默认宽度为 240px。通过 `width` 传入像素数值或 CSS 长度即可调整。区域内显示调用方传入的内容。

```tsx
import { WorkspaceLayout, LeftPane } from '@nibferry/react';
import '@nibferry/react/styles.css';

<WorkspaceLayout compactPane="left">
  <LeftPane width={224} aria-label="左侧">左侧</LeftPane>
</WorkspaceLayout>
```

支持 `children` 及标准 aside 属性，包括 `className`、`style`、DOM 事件和 `ref`。子元素沿用 DOM 焦点顺序。

默认宽度继承 `--nf-layout-left-pane-width`。传入 `width` 时使用该值，同时指定 `style.width` 时以样式为准。在 WorkspaceLayout 上设置 `expandedPane="left"` 可让左侧区域铺满容器。

## 收起左栏

宿主通过 `collapsed` 收起左栏，并可在栏外放置 [LeftPaneToggle](../LeftPaneToggle/README.md) 切换状态。左栏内容保留挂载，收起期间退出键盘导航，重新展开时沿用上次的宽度。宽屏收起时左栏随滑动淡出，展开时同步淡入。两者共用主题的展开时长与缓动，系统偏好减少动态效果时立即切换。

## 调整宽度

在与 MainPane 并排的工作区中使用 `<LeftPane resizable>左侧</LeftPane>`，组件管理拖动后的宽度。可用 `defaultWidth` 设置起始宽度，或通过 `width` 和 `onWidthChange` 一起接管宽度。仅提供 `onWidthChange` 时仍由组件保存宽度，回调报告像素值。自定义初始样式支持 `style.width`，受控时请用 `width` 作为唯一的宽度来源。

分隔线可通过 Tab 聚焦，支持左右方向键、Shift 加速、Home 和 End。窄屏与单栏展开时手柄自动收起，恢复分栏时沿用最近宽度。详细键盘与主题规则见 [PaneResizeHandle](../PaneResizeHandle/README.md)。

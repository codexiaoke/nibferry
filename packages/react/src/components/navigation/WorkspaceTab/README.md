# WorkspaceTab

呈现一个可选择的标签，包括可选的图标和关闭按钮。在 WorkspaceTabList 中使用时支持方向键切换和排序。

```tsx
import { WorkspaceTab } from '@nibferry/react';

<WorkspaceTab id="layout-tab" panelId="layout-page" label="布局"
  selected={activeId === 'layout-tab'} onClick={() => select('layout-tab')}
  onClose={() => close('layout-tab')} />
```

`id` 是标签的唯一 DOM ID，`panelId` 指向对应内容区。内容区应设置 `role="tabpanel"`、`aria-labelledby` 并随选中状态切换 `hidden`。`label` 为可访问名称和可见标题，`icon` 接收 Hugeicons 图标，`selected` 设置选中样式和 Tab 停靠点。普通按钮属性和 ref 传给选择按钮。

传入 `onClose` 后显示独立的关闭按钮，在标签上按 Delete 也可关闭。选择和关闭分别触发各自的回调。关闭后的活动页和焦点由宿主决定。

`hidden` 隐藏整项及其关闭按钮，方向键切换时跳过该标签。

# FloatingPanel

## 用法

在工作区内显示非模态浮窗。内容和标题栏由接入方提供，收起后保留子元素和草稿状态。

```tsx
import { FloatingPanel, PaneHeader } from 'nibferry';

<FloatingPanel movable id="chat" open={open} aria-label="当前会话"
  header={<PaneHeader actions={<button onClick={() => setOpen(false)}>收起</button>}>当前会话</PaneHeader>}>
  {conversation}
</FloatingPanel>
```

## 参数与交互

`open` 控制显隐，`header`、`children` 分别放标题栏和内容。使用 `aria-label` 或 `aria-labelledby` 命名浮窗。支持原生 section 属性和 ref。宿主可在显隐切换后调用浮窗或恢复按钮的 `focus()` 管理键盘焦点。

传入 `movable` 和 `header` 后，标题栏右侧会显示拖动手柄。按住标题、空白处或手柄可在定位容器内移动浮窗。也可以用 Tab 聚焦标题栏，再按方向键每次移动 8 像素。标题栏按钮保留各自的点击行为；用 `open` 收起再展开会保留位置。

浮窗按最近的定位容器对齐到右下角，可通过 `style` 或 `className` 调整位置和尺寸。`--nf-canvas`、`--nf-ink`、`--nf-line` 和 `--nf-floating-shadow` 控制外观。显示过渡遵从 `--nf-motion-reveal` 和系统减少动效偏好。

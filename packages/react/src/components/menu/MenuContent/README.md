# MenuContent

## 用法

排列根菜单内容。DropdownMenu 以触发按钮定位，ContextMenu 以右键位置或键盘焦点定位。

```tsx
import { MenuContent, MenuItem } from 'nibferry';

<MenuContent align="start"><MenuItem onSelect={copyLink}>复制链接</MenuItem></MenuContent>
```

## 参数与交互

放在 DropdownMenu 内时，默认靠触发器下方起始侧，间隔 4px。也可作为 ContextMenu 的 `content`。到达视口边缘时自动调整，`side`、`align`、`sideOffset`、`collisionPadding` 可覆盖位置。上下键移动焦点，Home 和 End 跳至首尾。

在 Nibferry 的 Dialog 内，面板挂到最近的弹框，继承弹框的局部主题和焦点范围。其他场景默认挂到 document.body。局部主题可通过 `container` 指定挂载位置，或在面板上覆盖 `--nf-canvas`、`--nf-ink`、`--nf-muted`、`--nf-line`、`--nf-menu-shadow`、`--nf-menu-layer`。进入动效使用 `--nf-motion-feedback`、`--nf-motion-scale` 和 `--nf-ease`，遵循系统减少动效偏好。

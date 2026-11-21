# NavigationRailItem

## 用法

图标导航按钮，可独立使用，也可作为菜单触发器。

```tsx
import Home from '@hugeicons/core-free-icons/Home09Icon';
import { NavigationRailItem } from 'nibferry';

<NavigationRailItem label="首页" icon={Home} current={page === 'home'} onClick={() => navigate('home')} />
```

## 参数与交互

`icon` 接受 Hugeicons 图标，`label` 同时提供读屏名称和悬停提示。`current` 表示当前页面，并设置 `aria-current="page"`。用 `onClick` 处理导航，用 `paneId` 和 `aria-expanded` 关联可展开区域。支持原生按钮属性、事件和 ref。

可用 `badge={<CountBadge count={unread} />}` 显示右上角数量。通过 `aria-label` 将数量包含在按钮的无障碍名称中。

按 Tab 聚焦，按 Enter 或空格触发。默认按钮为 36px，粗指针设备上为 44px。悬停和按压沿用 PaneButton 的主题动效，遵循系统减少动效偏好。

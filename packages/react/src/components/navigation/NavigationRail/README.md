# NavigationRail

## 用法

在应用边缘纵向排列图标入口。将它放在可收起的侧栏旁边，两者可以独立显示。默认宽度为 52px，空间不足时栏内可以纵向滚动。

```tsx
import Home from '@hugeicons/core-free-icons/Home09Icon';
import { NavigationRail, NavigationRailItem } from 'nibferry';

<NavigationRail label="主导航">
  <NavigationRailItem label="首页" icon={Home} current={page === 'home'} onClick={() => navigate('home')} />
</NavigationRail>
```

## 参数与交互

`label` 提供导航区的无障碍名称。`children` 接受导航项、菜单触发器和用于视觉分组的 `<hr aria-hidden="true" />`。其余属性、事件和 ref 传给原生 nav。接入方控制入口顺序、选中项和侧栏显隐。

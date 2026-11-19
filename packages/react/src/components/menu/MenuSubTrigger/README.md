# MenuSubTrigger

显示子菜单入口和方向箭头。

```tsx
import { MenuSubTrigger } from '@nibferry/react';
import Copy from '@hugeicons/core-free-icons/Copy01Icon';

<MenuSubTrigger icon={Copy}>复制</MenuSubTrigger>
```

放在 MenuSub 内，与 MenuSubContent 配对。`children` 是标签，`icon` 可选。指针悬停、点击或键盘进入子菜单。支持 `disabled`、`textValue` 和 ref。箭头与键盘方向跟随书写方向。

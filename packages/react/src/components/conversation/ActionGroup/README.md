# ActionGroup

将一组相关操作放在一个可折叠的标题下。

标题默认带有叠层图标。可用 `icon` 替换，或传 `null` 让文字贴齐左边缘。收起时，悬停或键盘聚焦组标题会显示向右箭头。展开时向下箭头保持可见，动作行与组标题共用同一条左边线。

动作列表最高 216px。超出时可用滚轮滚动，也可用 Tab 聚焦列表后用方向键滚动。有更多内容的一侧会渐隐，滚到边缘后该侧渐隐消失。组标题与后续回复在列表外。

```tsx
import { ActionGroup } from '@nibferry/react';

<ActionGroup label="读取了两份文档" expanded={open} onExpandedChange={setOpen}>
  {actions}
</ActionGroup>
```

`label` 控制标题，`children` 接受操作行或自定义内容。省略 `expanded` 可使用 `defaultExpanded`，默认折叠。Enter 或空格控制焦点所在的标题。`onExpandedChange` 返回下一展开状态。

# TurnProcess

展示一个回合的运行过程，完成后可通过摘要行收展。

摘要收起时，悬停或键盘聚焦才显示行尾箭头。展开后箭头朝下，移开鼠标仍然可见。

生成结束时，耗时摘要及其下方的整行分隔线逐渐展开，同时收起执行过程。标题、内容和箭头跟随 `--nf-motion-reveal` 与 `--nf-ease`；开启减少动态效果时直接切换。

```tsx
import { TurnProcess } from '@nibferry/react';

<TurnProcess running={running} label="已处理 4 秒">
  <p>查看工作区布局</p>
</TurnProcess>
```

`running` 为真时展示内容并隐藏摘要按钮。完成后 `defaultExpanded` 决定初始展开状态，默认收起；用 `expanded` 和 `onExpandedChange` 受控。`label` 与 `children` 接受 React 节点。收起时保留内容实例并移出焦点顺序。

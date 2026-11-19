# WorkspaceLayout

给左侧、主体和右侧分配空间。两侧可分别省略，主体填满可用宽度。宿主决定容器高度与各栏内容。

```tsx
import { WorkspaceLayout, LeftPane, MainPane, RightPane } from '@nibferry/react';
import '@nibferry/react/styles.css';

<WorkspaceLayout style={{ height: '100dvh' }}>
  <LeftPane aria-label="左侧">左侧</LeftPane>
  <MainPane role="main">主体</MainPane>
  <RightPane aria-label="右侧">右侧</RightPane>
</WorkspaceLayout>
```

将各栏作为直接子元素，按阅读顺序排列。左侧默认 240px，右侧默认 320px，可通过对应栏的 `width` 属性指定像素值或 CSS 宽度。容器高度受限时，各栏内容独立滚动。

| 属性 | 作用 |
| --- | --- |
| `children` | 任意组合的 LeftPane、MainPane 和 RightPane，每个区域各一个。 |
| `compactPane` | 容器宽度小于 768px 时显示已渲染的指定栏，可取 `left`、`main` 或 `right`，默认 `main`。其余栏保留挂载。 |
| `expandedPane` | 在任何宽度下，让指定的 `left`、`main` 或 `right` 区域铺满容器。传回 `undefined` 恢复当前容器宽度对应的布局。 |
| 原生 div 属性 | 支持 `className`、`style`、`ref` 和标准 DOM 事件。 |

接入方管理展开状态，并决定用哪个入口切换。`expandedPane` 和 `compactPane` 都应指向当前组合中可见的区域。展开期间其他栏仍保持挂载，返回后可以继续编辑原有内容。键盘焦点由接入方的切换入口管理。

可在祖先容器设置 `--nf-layout-left-pane-width` 和 `--nf-layout-right-pane-width`。单个侧栏的 `width` 覆盖继承的默认宽度，`style.width` 优先于 `width`。

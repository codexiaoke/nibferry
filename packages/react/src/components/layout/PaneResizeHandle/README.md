# PaneResizeHandle

调整侧栏与主体之间的分界。传入侧栏的 id 和宽度回调，可以在已有受控布局中单独放置手柄。

```tsx
import { useState } from 'react';
import { WorkspaceLayout, LeftPane, MainPane, PaneResizeHandle } from '@nibferry/react';
import '@nibferry/react/styles.css';

export function Layout() {
  const [width, setWidth] = useState(240);
  return (
    <WorkspaceLayout style={{ height: '100dvh' }}>
      <LeftPane id="navigation" width={width}>左侧</LeftPane>
      <PaneResizeHandle side="left" paneId="navigation" onWidthChange={setWidth} />
      <MainPane>主体</MainPane>
    </WorkspaceLayout>
  );
}
```

| 属性 | 作用 |
| --- | --- |
| `side` | `left` 或 `right`。左栏手柄紧跟左栏，右栏手柄紧靠右栏之前。 |
| `paneId` | 同一 WorkspaceLayout 内对应侧栏的 DOM id，也用于读屏关联。 |
| `onWidthChange(width, source)` | 第一个参数是实际宽度，单位为 CSS 像素。拖动或按键时来源为 `user`，容器压缩侧栏时为 `container`。宿主可以同步显示宽度，并单独保存用户设置。 |
| `aria-label`、`title`、`className`、`style`、`ref` | 可自定义无障碍名称、显式添加提示、调整外观或取得分隔线元素。 |

分隔线宽 1px，颜色取自 `--nf-line`。鼠标悬停时，线色混入少量 `--nf-muted` 并显示调宽光标，移开后恢复。按 Tab 聚焦时用 `--nf-accent` 标明当前位置。

方向键每次移动 8px，按住 Shift 移动 32px。Home 和 End 调至侧栏的最小、最大宽度。侧栏默认至少 128px，主体至少 192px，容器上的 `--nf-resize-pane-min` 与 `--nf-resize-main-min` 可覆盖这两个值。

只在侧栏和主体并排时显示。LeftPane 与 RightPane 的 `resizable` 会自动加入同一个手柄。

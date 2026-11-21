# LeftPaneToggle

## 用法

切换左栏的图标按钮。将它放在左栏外，收起后仍可通过同一按钮展开。

```tsx
import { useState } from 'react';
import { LeftPane, LeftPaneToggle, MainPane, WorkspaceLayout } from 'nibferry';

export function Workspace() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <LeftPaneToggle paneId="sidebar" expanded={open} onClick={() => setOpen(!open)} />
      <WorkspaceLayout>
        <LeftPane id="sidebar" collapsed={!open} resizable>左侧</LeftPane>
        <MainPane>主体</MainPane>
      </WorkspaceLayout>
    </>
  );
}
```

## 参数与交互

`paneId` 对应左栏的 DOM id，`expanded` 表示当前是否展开，`onClick` 由宿主更新状态。按钮支持标准 button 属性、ref 和自定义子元素。默认显示 Hugeicons 侧栏图标，无障碍名称随状态切换。按 Enter 或空格触发操作，焦点留在按钮上。

默认图标为 16px。左栏展开时，图标内的箭头朝左，提示收起。收起后箭头朝右，提示重新展开。鼠标点击范围为 28 × 28px，触屏点按范围为 44 × 44px。

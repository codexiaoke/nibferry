# RightPaneToggle

放在右栏外的受控按钮。桌面可切换并排布局，窄屏可切换当前可见区域。

```tsx
import { useState } from 'react';
import { MainPane, RightPane, RightPaneToggle, WorkspaceLayout } from '@nibferry/react';
import '@nibferry/react/styles.css';

export function Workspace() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <RightPaneToggle paneId="details" expanded={open} onClick={() => setOpen(!open)} />
      <WorkspaceLayout compactPane={open ? 'right' : 'main'}>
        <MainPane>主体</MainPane>
        <RightPane id="details" collapsed={!open} resizable>详情</RightPane>
      </WorkspaceLayout>
    </>
  );
}
```

`paneId` 对应右栏的 id，`expanded` 控制动作图标、无障碍名称和 `aria-expanded`。用 `onClick` 接管切换，或传入 `children` 替换按钮内容。支持标准 button 属性和 ref。Enter 和空格均可操作，焦点留在按钮上。

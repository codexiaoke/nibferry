# RightPaneFullscreenToggle

在工具栏切换应用内的右栏全屏。宿主持有布局状态。以下组合将左侧导航留在原位，退出时右栏沿用进入前的宽度。

```tsx
import { useState } from 'react';
import { LeftPane, MainPane, RightPane, RightPaneFullscreenToggle, WorkspaceLayout } from '@nibferry/react';
import '@nibferry/react/styles.css';

export function Workspace() {
  const [fullscreen, setFullscreen] = useState(false);
  return (
    <>
      <RightPaneFullscreenToggle
        paneId="details"
        fullscreen={fullscreen}
        onClick={() => setFullscreen(!fullscreen)}
      />
      <WorkspaceLayout compactPane={fullscreen ? 'right' : 'main'}>
        <LeftPane>导航</LeftPane>
        <MainPane hidden={fullscreen}>主体</MainPane>
        <RightPane id="details" resizable fullscreen={fullscreen}>
          详情
        </RightPane>
      </WorkspaceLayout>
    </>
  );
}
```

`paneId` 关联右栏，`fullscreen` 控制图标和动作名称。进入全屏后按钮显示「退出全屏」。`onClick` 通知宿主切换，`children` 可替换默认内容。按钮支持标准 button 属性和 ref，Enter 或空格切换后保持焦点。

右栏的 `fullscreen` 和主体的 `hidden` 共用同一个布尔值。进出全屏时，边界连续移动，主体内容随之淡出或淡入。时长取 `--nf-motion-reveal`，缓动取 `--nf-ease`。系统开启减少动态效果或主题设置 `motion: false` 时直接到达目标布局。

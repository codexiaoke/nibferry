# FloatingPanelTrigger

## 用法

用于恢复或收起工作区浮窗。按钮可放在浮窗外，也可放进标题栏。

```tsx
import { FloatingPanel, FloatingPanelTrigger } from 'nibferry';

<div style={{ position: 'relative' }}>
  <FloatingPanelTrigger paneId="chat" expanded={open} unread={hasUnreadReply} onClick={() => {
    if (!open) setHasUnreadReply(false);
    setOpen(!open);
  }} />
  <FloatingPanel id="chat" open={open} aria-label="当前会话">{conversation}</FloatingPanel>
</div>
```

## 参数与交互

`paneId` 对应浮窗 ID，`expanded` 表达浮窗当前状态，`onClick` 通知宿主切换。默认显示聊天图标，可通过 `icon` 替换，或通过 `children` 提供按钮内容。支持按钮属性、键盘 Enter 和空格、可访问名称与 ref。按钮继承所在区域的画布、边框和焦点颜色。

收起时入口显示为高对比圆形按钮。宿主在浮窗收起期间收到完整回复后将 `unread` 设为 `true`，右上角会显示红点，并为读屏提供“有新的 Agent 回复”的描述。用户重新查看会话时，宿主清除未读状态。可通过 `--nf-floating-unread` 调整红点颜色。

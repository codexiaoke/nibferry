# MessageActions

## 用法

把操作栏传给消息的 `actions`。用户消息下方的时间在按钮左边，助手回复下方的时间在按钮右边。

```tsx
import { MessageActions, PaneButton, UserMessage } from 'nibferry';
import Edit from '@hugeicons/core-free-icons/PencilEdit01Icon';

<UserMessage actions={
  <MessageActions aria-label="用户消息操作" timestamp={<time dateTime={sentAt}>{localTime}</time>}>
    <PaneButton icon={Edit} aria-label="编辑消息" onClick={edit} />
  </MessageActions>
}>{text}</UserMessage>
```

## 参数与交互

`children` 接收按显示顺序排列的按钮和菜单。图标、操作名称、选中状态和回调由接入方提供。`timestamp` 可省略，接受已格式化的时间或 React 节点。支持原生 div 属性和 `ref`。

鼠标经过对应消息或键盘焦点进入时显示操作栏，菜单展开期间保持可见。触屏直接显示。错误提示和重试按钮可以与操作栏并列传入 `actions`，始终可见。

辅助文字使用 `--nf-muted`，淡入淡出使用 `--nf-motion-feedback`，遵从系统减少动效设置。

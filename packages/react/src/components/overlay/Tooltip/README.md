# Tooltip

## 用法

为可聚焦的控件提供简短操作提示。

```tsx
import { Button, Tooltip } from 'nibferry';

<Tooltip content="复制当前页地址"><Button>分享</Button></Tooltip>
```

## 参数与交互

`children` 接受一个能转发属性和 ref 的触发控件。`content` 可传文字或节点。鼠标停留 `delay` 毫秒后显示（默认 350），键盘聚焦时显示，Esc 隐藏。`side`、`container` 和 `className` 配置提示浮层。图标按钮仍需独立的无障碍名称。

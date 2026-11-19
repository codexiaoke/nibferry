# MacWindow

交互预览的 macOS 窗口外壳。`children` 从边框内沿开始，填满窗口内部。预览页把 [MacWindowControls](../MacWindowControls/README.md) 放进应用自己的工具栏。

```tsx
import MacWindow from './MacWindow';

<div style={{ width: 800, height: 500 }}>
  <MacWindow>
    <div style={{ width: '100%', height: '100%' }}>内容</div>
  </MacWindow>
</div>
```

由父容器提供宽高。子元素直接使用百分比宽高，应用自行安排顶部工具栏和正文。

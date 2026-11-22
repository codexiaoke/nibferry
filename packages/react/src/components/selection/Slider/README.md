# Slider

## 用法

在一个数值范围内拖动选择，松手后滑块对齐到选定的步长。

```tsx
import { useState } from 'react';
import { Slider } from 'nibferry';

function FontSize() {
  const [size, setSize] = useState(16);
  return <Slider aria-label="正文字号" min={12} max={24} step={2} value={size} onValueChange={setSize} />;
}
```

## 参数与交互

通过 `value` 与 `onValueChange` 受控。默认范围为 0 到 100，步长为 1。`marks` 是可选刻度的数值数组。通过 Field、`aria-label` 或 `aria-labelledby` 为输入命名。原生 range 接收 `name`、`disabled`、`aria-valuetext`、键盘事件和 ref，方向键按步长调整。外层接收 `className` 和 `style`，滑块直径与轨道高度分别由 `--nf-slider-thumb-size` 和 `--nf-slider-track-size` 控制。

# Dialog

## 用法

受控的模态弹框。适合编辑表单，也可以作为搜索弹框等组合组件的容器。

```tsx
import { useState } from 'react';
import { Dialog } from 'nibferry';

function Editor() {
  const [open, setOpen] = useState(false);
  return <>
    <button onClick={() => setOpen(true)}>编辑名称</button>
    <Dialog open={open} onOpenChange={setOpen} aria-labelledby="editor-title">
      <h2 id="editor-title">编辑名称</h2>
      <input aria-label="名称" autoFocus />
      <button onClick={() => setOpen(false)}>完成</button>
    </Dialog>
  </>;
}
```

## 参数与交互

用 `open` 控制显示，按 Esc 或点击遮罩会触发 `onOpenChange(false)`。原生 `dialog` 负责将焦点留在弹框内，并在关闭后返回原来的控件。传入 `aria-label` 或 `aria-labelledby` 命名弹框。支持原生属性、`children` 和指向弹框元素的 `ref`。

弹框使用宿主的颜色和动效 Token，可通过 `className` 设置尺寸，用 `--nf-dialog-shadow` 和 `--nf-dialog-backdrop` 设置投影和遮罩色。开启减少动态效果后会直接显示。

嵌套的 Nibferry 菜单、子菜单和模型选择器默认挂载在当前弹框内，沿用弹框的主题和键盘焦点范围。

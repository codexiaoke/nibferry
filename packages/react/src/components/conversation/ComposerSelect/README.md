# ComposerSelect

输入框底栏的受控单选菜单，可用于选择权限、模型或模型档位。

```tsx
import { ComposerSelect } from '@nibferry/react';

<ComposerSelect label="模型" value={model} onValueChange={setModel}
  options={[
    { value: 'fast', label: '快速模型' },
    { value: 'reason', label: '推理模型', detail: '高' },
  ]} />
```

`value` 对应选项的唯一值。`label` 标识控件，每个选项的 `label` 和可选 `detail` 决定按钮与菜单内的显示内容。`onValueChange` 返回所选值，由应用更新状态。可用 `disabled` 禁用整个控件或某个选项。空选项列表禁用按钮。

`className` 设置按钮样式，`menuClassName` 设置浮层样式。Enter 或空格打开，方向键浏览，Enter 确认，Esc 取消。

在 Nibferry 的 `Dialog` 内，选项面板挂载到最近的弹框。也可用 `container` 指定局部主题容器。

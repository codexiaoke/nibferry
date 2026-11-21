# ComposerModelSelect

输入框底栏的模型与推理强度选择器。按钮并排显示模型名和较淡的当前强度。悬停或键盘聚焦显示操作提示。

```tsx
import { ComposerModelSelect } from 'nibferry';

<ComposerModelSelect
  models={[
    { value: 'default', label: '默认' },
    { value: 'openai/astra', label: 'GPT-6.2 Astra', provider: 'OpenAI' },
    { value: 'deepseek/reasoner', label: 'DeepSeek Reasoner', provider: 'DeepSeek' },
  ]}
  model={model} onModelChange={setModel}
  levels={[{ value: 'low', label: '低' }, { value: 'high', label: '高' }]}
  level={level} onLevelChange={setLevel} resetLevel="high" />
```

应用持有 `model`、`level`，并分别通过 `onModelChange`、`onLevelChange` 更新。模型选项可带 `detail` 和 `disabled`。按强度从低到高传入 `levels`，当前值对应选项的 `value`。传入空档位列表时，按钮直接打开模型列表。`panelClassName` 可为挂载到页面的浮层设置局部主题。

在模型选项上填写 `provider` 即可按供应商分组。同一供应商的模型按传入顺序排列，供应商按首次出现的顺序展示。省略 `provider` 的选项排在列表顶部，适合放「默认」。所有模型的 `value` 应在整个列表中唯一，跨供应商的同名模型可以使用不同的 `value`。

点击按钮或在输入框内按 Ctrl+Shift+M 打开强度面板。拖动时滑块和填充跟随指针，经过相邻刻度的中点即更新档位。松开时滑块滑到最近刻度。点击轨道或用方向键也可切换，开启「减少动态效果」时直接到位。传入有效的 `resetLevel` 时显示恢复默认按钮。

点击面板中间的模型名打开可滚动的列表。勾选标识当前模型，方向键、Home、End 可浏览，Enter 或空格确认。Esc 关闭并将焦点还给底栏按钮。

在 Nibferry 的 `Dialog` 内，强度面板和模型列表挂载到最近的弹框。可通过 `container` 指定挂载元素来继承该区域的主题。

# RadioGroup

## 用法

在一组选项中选择一个值。行式选项和带预览的卡片共用同一个组件。

```tsx
import { RadioGroup } from 'nibferry';

const options = [{ value: 'sidebar', label: '项目侧栏' }, { value: 'rail', label: '常驻导航栏' }];

<>
<RadioGroup label="桌面导航" options={options} defaultValue="sidebar" />
<RadioGroup label="导航布局预览" variant="cards" defaultValue="rail" options={options.map(option => ({
  ...option, visual: <img alt="" src={'/layouts/' + option.value + '.svg'} />,
}))} />
</>
```

## 参数与交互

`label` 为组名，`options` 包含唯一 `value`、`label`，可带 `description`、`disabled`，卡片还可传入装饰性的 `visual`。`variant` 可选 `list` 或 `cards`。可用 `value` / `onValueChange` 受控或用 `defaultValue` 设置初值。`name`、`form`、`required` 和 `disabled` 支持原生表单。点击整行或卡片可选中，Tab 进入组，方向键切换。

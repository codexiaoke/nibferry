# Combobox

## 用法

在与按钮同宽的浮层中搜索并选择一项。

```tsx
import { Combobox } from 'nibferry';

<Combobox label="模型" value={model} onValueChange={setModel} options={models} />
```

## 参数与交互

options 接收 SelectOption 列表，支持 label、value、detail、disabled。按名称或说明过滤，方向键跳过禁用项，Enter 选择，Esc 返回按钮。value 由宿主持有。placeholder、emptyText、按钮属性与浮层 container 可定制。

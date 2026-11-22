# Spinner

## 用法

表示操作正在进行，可与按钮文字并排。

```tsx
import { Spinner } from 'nibferry';

<Spinner label="正在加载来源" />
```

## 参数与交互

label 提供状态名称。已有可见加载文字时可省略，环形指示将作为装饰。颜色继承 currentColor，通过 --nf-spinner-size 调整直径。减少动效时显示静止圆环。

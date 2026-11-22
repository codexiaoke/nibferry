# EmptyState

## 用法

在列表没有内容时显示原因和可用操作。

```tsx
import { Button, EmptyState } from 'nibferry';

<EmptyState title="还没有来源" action={<Button onClick={addSource}>添加来源</Button>} />
```

## 参数与交互

`title` 为必填说明。`icon` 是装饰图标，`children` 是补充说明，`action` 是可选操作。动态搜索结果可以添加 `role="status"`，由应用决定何时展示。

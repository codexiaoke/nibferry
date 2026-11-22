# Alert

## 用法

持续显示需要留在当前内容旁边的信息。

```tsx
import { Alert, Button } from 'nibferry';

<Alert tone="danger" title="同步失败" action={<Button onClick={retry}>重试</Button>}>请重新连接来源。</Alert>
```

## 参数与交互

`title` 为标题，`children` 是可选说明，`action` 是操作插槽。`tone="info"` 使用 status，`tone="danger"` 使用 alert。应用持有失败状态并处理重试。

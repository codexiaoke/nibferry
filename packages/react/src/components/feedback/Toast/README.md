# Toast

## 用法

短暂显示一次操作结果。

```tsx
import { useState } from 'react';
import { Button, Toast } from 'nibferry';

function Example() {
  const [message, setMessage] = useState('');
  return <><Button onClick={() => setMessage('已保存')}>保存</Button>
    <Toast message={message} onDismiss={() => setMessage('')} /></>;
}
```

## 参数与交互

`message` 为空时保留用于播报的 status 节点。默认 2600 毫秒后调用 `onDismiss`，由父级清空消息。`duration` 小于等于零时持续显示。相同消息连续触发时可传入新的 `notificationId` 重新计时并播报。使用 `className` 或 `style` 定位。

清空消息时原提示短暂淡出。退出期间到达的新提示立即显示并重新计时。

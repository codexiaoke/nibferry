# Switch

## 用法

切换立即生效的开关。

```tsx
import { Switch } from 'nibferry';

<label>桌面通知 <Switch name="notifications" defaultChecked /></label>
```

## 参数与交互

转发标准 input 属性和 ref。`checked` / `onChange` 为受控模式，`defaultChecked` 为初始值。语义为 switch，支持点击标签和空格键；`disabled` 禁止切换。

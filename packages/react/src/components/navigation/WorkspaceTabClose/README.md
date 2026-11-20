# WorkspaceTabClose

关闭指定标签的图标按钮。WorkspaceTab 接收 onClose 时自动组合此部件。

```tsx
import { WorkspaceTabClose } from '@nibferry/react';

<WorkspaceTabClose label="布局" onClick={() => close('layout-tab')} />
```

`label` 是标签名称，用于生成按钮的无障碍名称和悬停提示。支持按钮属性、ref、键盘焦点和禁用。独立使用时可将其放在内容区或其他工具栏。

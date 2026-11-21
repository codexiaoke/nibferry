# WorkspaceTabAdd

## 用法

放在标签栏旁的新增按钮。通过回调让接入方创建并选中页面。

```tsx
import { WorkspaceTabAdd } from 'nibferry';

<WorkspaceTabAdd onClick={addPage} />
```

## 参数与交互

默认可访问名称是「新增标签页」。支持 PaneButton 的按钮属性、ref、禁用及键盘反馈。可以独立放在工具栏的其他位置。

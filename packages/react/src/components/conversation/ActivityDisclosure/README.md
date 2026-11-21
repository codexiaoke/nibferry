# ActivityDisclosure

TurnProcess、ActionGroup 和 ActionRow 共用的内部折叠实现。它关联标题按钮与内容区，并在折叠时保留子组件状态。

通过公开组件使用，例如 `import { ActionGroup } from '@nibferry/react'` 后渲染 `<ActionGroup label="查看记录">{rows}</ActionGroup>`。展开状态、默认值和切换回调见 [ActionGroup](../ActionGroup/README.md)。

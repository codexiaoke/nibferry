# ActionRow

## 用法

显示一次动作，传入详情后可展开阅读。

收起时，悬停或键盘聚焦标题会显示行尾箭头。展开后，向下箭头持续显示。

详情与标题左对齐。传入 `ActionResult` 可展示工具返回的文本或 JSON，也可以直接传入产品自己的界面。

```tsx
import { ActionRow } from 'nibferry';

<ActionRow label="读取布局文档" icon={<FileIcon />}>
  工作区支持左栏、主体和右栏。
</ActionRow>
```

## 参数与交互

`icon`、`label` 和 `children` 接受 React 节点。省略详情时显示静态行。有详情时支持 `expanded`、`defaultExpanded` 和 `onExpandedChange`；可把打开右栏等按钮放进详情。

# Tabs

## 用法

在同一位置切换内容，隐藏面板中的输入和阅读状态会保留。

```tsx
import { Tabs } from 'nibferry';

<Tabs label="文档视图" defaultValue="edit" items={[
  { value: 'edit', label: '编辑', content: <Editor /> },
  { value: 'read', label: '预览', content: <Preview /> },
]} />
```

## 参数与交互

`label` 为标签栏的无障碍名称。每个选项有唯一的 `value`、文字 `label`、面板 `content` 和可选的 `disabled`。可传入 `defaultValue`，或使用 `value` / `onValueChange` 控制。当前值不可用时显示首个可用项。左右键切换并跳过禁用项，Home / End 切到首尾。外层支持 div 属性和 ref。

选中底色随标签移动，连续切换时从当前位置转向新标签。减少动效时直接切换。

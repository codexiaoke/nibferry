# ActionResult

在工具动作下显示可选取、可复制的文本或 JSON。结果卡与动作行左侧对齐，占满可用宽度。长行自动换行。

```tsx
import { ActionResult, ActionRow } from '@nibferry/react';
import '@nibferry/react/styles.css';

<ActionRow label="搜索文档">
  <ActionResult value={{ query: '布局', results: [{ title: '基础布局组件' }] }} />
</ActionRow>
```

`value` 接受字符串或其他 JSON 值。字符串按原文显示，对象和数组按两空格缩进。其余属性传给 `section`，可用 `aria-label` 替换默认名称「操作结果」。展开状态由外面的 `ActionRow` 管理。独立使用时长输出在卡内滚动，放进 `ActionGroup` 时由整个动作列表滚动。

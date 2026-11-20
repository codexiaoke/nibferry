# ConversationList

提供带可见标题的导航区域。可以直接放会话条目，也可以按项目分组。

```tsx
import { ConversationItem, ConversationList } from '@nibferry/react';

<ConversationList label="最近会话">
  <ConversationItem current onClick={openChat}>工作区布局</ConversationItem>
</ConversationList>
```

`label` 同时作为可见标题和导航的无障碍名称。`children` 接收列表内容，其余导航属性和 ref 传给 `nav`。从公开入口引入 `@nibferry/react/styles.css` 加载样式。

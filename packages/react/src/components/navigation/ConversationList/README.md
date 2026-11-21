# ConversationList

## 用法

提供带可见标题的导航区域。可以直接放会话条目，也可以按项目分组。

```tsx
import { ConversationItem, ConversationList } from 'nibferry';

<ConversationList label="最近会话">
  <ConversationItem current onClick={openChat}>工作区布局</ConversationItem>
</ConversationList>
```

## 参数与交互

`label` 同时作为可见标题和导航的无障碍名称。`children` 接收列表内容，其余导航属性和 ref 传给 `nav`。

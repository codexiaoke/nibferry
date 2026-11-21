# Nibferry

用于构建 Agent 对话、侧边助手和工作区的 React 组件库。

在 React 19 项目中安装：

```sh
pnpm install nibferry
```

在应用入口加载一次样式：

```ts
import 'nibferry/styles.css';
```

在业务组件中按需导入：

```tsx
import { Stack, UserMessage, AssistantMessage } from 'nibferry';

export function Conversation() {
  return (
    <Stack>
      <UserMessage>今天先看哪份文档？</UserMessage>
      <AssistantMessage>先看组件总览。</AssistantMessage>
    </Stack>
  );
}
```

[组件总览](https://codexiaoke.github.io/nibferry/docs/components/) · [主题配置](https://codexiaoke.github.io/nibferry/docs/theme/) · [交互示例](https://codexiaoke.github.io/nibferry/playground/)

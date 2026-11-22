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

## 交给 Agent 实现

把下面这句话交给编码 Agent，最后补上你的需求。

> 请读取 `node_modules/nibferry/skills/nibferry-ui/SKILL.md`，按其中的组件组合和视觉约定实现界面。

[Agent 组件使用指南](https://codexiaoke.github.io/nibferry/docs/agent-guide/)包含技能安装方式和三个可运行示例。

[组件总览](https://codexiaoke.github.io/nibferry/docs/components/) · [主题配置](https://codexiaoke.github.io/nibferry/docs/theme/) · [交互示例](https://codexiaoke.github.io/nibferry/playground/)

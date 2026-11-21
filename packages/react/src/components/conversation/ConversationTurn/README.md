# ConversationTurn

## 用法

把同一次用户提问、执行过程与回答放在一个回合内。

```tsx
import { ConversationTurn } from 'nibferry';

<ConversationTurn aria-label="第一轮对话">
  <p>用户的问题</p>
  <p>助手的回答</p>
</ConversationTurn>
```

## 参数与交互

支持原生 article 属性与 `ref`。`children` 顺序就是阅读顺序，可以省略过程或插入自定义内容。渲染多个回合时由调用方提供稳定的 `key`。

# ConversationComposer

提供受控文本输入、发送按钮和生成中停止按钮。

```tsx
import { ComposerModelSelect, ContextUsage, ConversationComposer } from '@nibferry/react';

<ConversationComposer value={draft} onValueChange={setDraft} onSend={send}
  running={running} onStop={stop}
  tools={<><AttachmentButton /><PermissionsMenu /></>}
  rightTools={<>
    <ContextUsage value={contextPercent} />
    <ComposerModelSelect models={models} model={model} onModelChange={setModel}
      levels={levels} level={level} onLevelChange={setLevel} />
    <DictationButton />
  </>}
  emptyAction={<VoiceChatButton />} />
```

`tools` 可传入 `ComposerActionMenu` 配置左下角的「＋」菜单，也支持在输入框键入 `@` 或 `/` 打开。`ref` 指向文本框，可用于读取选区或恢复输入焦点。输入时保留原有浅边框，工具按钮保留键盘焦点提示。

`rightTools` 放在底栏右侧，位于主按钮之前。两组均接收 React 节点，显示顺序与传入顺序一致。空间不足时工具组换行。`emptyAction` 可选，用于在空草稿时显示语音对话等主操作。省略时显示禁用的发送按钮。输入有效文字后可发送，生成中优先显示停止按钮。

`value` 与 `onValueChange` 控制草稿。Enter 触发 `onSend`，Shift+Enter 换行，输入法选字期间回车留给输入法。`running` 显示停止按钮，`onStop` 由调用方中断请求。`tools` 可放附件或其他操作，`sendLabel`、`stopLabel` 自定义按钮名称。`hidden` 隐藏整个输入区，`disabled` 禁用输入和发送或停止按钮。其余属性（含 `aria-label`）传给 textarea。

`canSend` 接管草稿是否可发送的判断。只带附件也可发送时，传入 `canSend={Boolean(draft.trim() || attachments.length)}`。发送按钮和 Enter 共用此条件。`running` 和 `disabled` 继续阻止重复发送。

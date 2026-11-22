# ConversationComposer

## 用法

提供受控文本输入、发送按钮和生成中停止按钮。

```tsx
import { ComposerModelSelect, ContextUsage, ConversationComposer, MessageQuote } from 'nibferry';

<ConversationComposer value={draft} onValueChange={setDraft} onSend={send}
  running={running} onStop={stop}
  contextContent={quote && <MessageQuote source="助手回复" text={quote} onRemove={clearQuote} />}
  tools={<><AttachmentButton /><PermissionsMenu /></>}
  rightTools={<>
    <ContextUsage value={contextPercent} />
    <ComposerModelSelect models={models} model={model} onModelChange={setModel}
      levels={levels} level={level} onLevelChange={setLevel} />
    <DictationButton />
  </>}
  emptyAction={<VoiceChatButton />} />
```

## 参数与交互

`tools` 可传入 `ComposerActionMenu` 配置左下角的「＋」菜单，也支持在输入框键入 `@` 或 `/` 打开。`ref` 指向文本框，可用于读取选区或恢复输入焦点。输入时保留原有浅边框，工具按钮保留键盘焦点提示。

`rightTools` 放在底栏右侧，位于主按钮之前。两组均接收 React 节点，显示顺序与传入顺序一致。空间不足时工具组换行。`emptyAction` 可选，用于在空草稿时显示语音对话等主操作。省略时显示禁用的发送按钮。输入有效文字后可发送，生成中优先显示停止按钮。

`value` 与 `onValueChange` 控制草稿。Enter 触发 `onSend`，Shift+Enter 换行，输入法选字期间回车留给输入法。`running` 显示停止按钮，`onStop` 由调用方中断请求。`tools` 可放附件或其他操作，`sendLabel`、`stopLabel` 自定义按钮名称。`hidden` 隐藏整个输入区，`disabled` 禁用输入和发送或停止按钮。其余属性（含 `aria-label`）传给 textarea。

`canSend` 接管草稿是否可发送的判断。只带附件也可发送时，传入 `canSend={Boolean(draft.trim() || attachments.length)}`。发送按钮和 Enter 共用此条件。`running` 和 `disabled` 继续阻止重复发送。

`contextContent` 放置引用或录音状态。即使显示这部分内容，空草稿仍可使用 `emptyAction`。

`attachments` 放在文字区上方，可组合横向的 `AttachmentList` 与 `AttachmentItem`。向 `onFilesAdd(files: File[])` 传回调后，放在 `ConversationView` 的 `composer` 插槽时，可向整个会话区域拖入文件。单独使用时可拖到输入框。两种布局都可在输入框中粘贴截图，普通文字继续按原样粘贴。文件选择器可以由左侧菜单打开，将所选文件交给同一个处理函数。无附件时省略此插槽。有待上传附件时，传入附件列表并设置 `canSend={false}`，主按钮显示为禁用的发送按钮。接入方管理文件限制、上传进度、重试及发送结果，发送成功后清空草稿。

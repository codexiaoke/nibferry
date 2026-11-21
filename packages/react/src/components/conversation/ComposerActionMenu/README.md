# ComposerActionMenu

## 用法

输入框的操作菜单。通过 `ConversationComposer` 的 `tools` 放入左下角，点击「＋」或在输入框键入 `@`、`/` 即可打开。也可以单独使用。

```tsx
import { ComposerActionMenu, ConversationComposer, MenuItem } from 'nibferry';

<ConversationComposer value={draft} onValueChange={setDraft} onSend={send}
  tools={<ComposerActionMenu>
    {actions.map(action => <MenuItem key={action.id} icon={action.icon}
      disabled={action.disabled} onSelect={action.onSelect}>{action.label}</MenuItem>)}
  </ComposerActionMenu>} />
```

## 参数与交互

传入的子项决定名称、图标、顺序、禁用状态和选择回调，也可以组合 `MenuGroup` 和 `MenuSeparator`。空列表隐藏入口。`label` 设置按钮和菜单的无障碍名称，`disabled` 禁用入口。其余属性传给 `MenuContent`。

默认在行首或空白后识别符号。`triggers={['/']}` 只启用斜杠，`triggers={[]}` 只启用按钮。固定子项由各入口共用。需要区分引用和操作时，可以传入 `children(match)`。点击「＋」时 `match` 为 `null`，此时返回完整菜单。输入符号时 `match.symbol` 为触发符，`match.query` 为符号到光标之间的文字。接入方可以按这两项筛选结果，用 `match.start` 和 `match.end` 替换草稿中的触发词。返回空列表会收起面板，继续编辑可重新匹配。

在 `ConversationComposer` 中，菜单贴齐整个输入框的左右边缘，在输入框上方留出 4px。可通过 `sideOffset` 调整间距。单独使用时以「＋」按钮定位。

在「＋」上按 Enter 或空格打开，Esc 关闭并返回按钮。由符号打开时可继续在输入框打字，按上下键进入菜单，或直接按 Enter 选择首项。Esc 取消，保留输入文字。可通过 `onCloseAutoFocus` 恢复插入内容后的光标位置。

一个输入框可挂载多个菜单，分别配置各自的 `triggers`。存在重叠前缀时，完整匹配的最长符号优先，例如 `@@` 优先于 `@`。使用函数子项时，若 `children(null)` 返回空值，组件隐藏加号入口，仍可用已配置的符号打开对应菜单。

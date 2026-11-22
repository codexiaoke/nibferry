# SearchDialog

## 用法

组合 Dialog、搜索框、分组结果和底部分类。接入方提供数据和选中回调，可把同一个搜索入口用于快捷操作、会话和文档。

```tsx
import { useState } from 'react';
import { Button, SearchDialog } from 'nibferry';

function ChatSearch({ newChat }: { newChat: () => void }) {
  const [open, setOpen] = useState(false);
  return <>
    <Button aria-haspopup="dialog" onClick={() => setOpen(true)}>搜索</Button>
    <SearchDialog open={open} onOpenChange={setOpen} label="搜索工作区"
      groups={[{ id: 'actions', label: '快捷操作', filterLabel: '操作', items: [
        { id: 'new-chat', label: '新聊天', shortcutKey: 'N', onSelect: newChat },
      ] }]} />
  </>;
}
```

## 参数与交互

- `label` 同时命名弹框和搜索框。`open`、`onOpenChange` 控制显示，`id`、`className` 传给弹框。
- 每组有唯一的 `id`、标题 `label` 和 `items`。可用 `filterLabel` 自定义底部按钮文字。`previewLimit` 控制空查询时「全部」中显示的条数；输入文字或选中分类后会搜索该范围的全部条目。
- 条目使用跨组唯一的 `id`、`label` 和 `onSelect`。可传 Hugeicons 的 `icon`、行尾说明 `detail`、搜索词 `keywords`、快捷键字母 `shortcutKey`。搜索匹配标题、说明和关键词，忽略大小写。
- 打开时聚焦搜索框。上下方向键移动高亮，Enter 执行，Esc 或点击遮罩关闭。点击分类会保留查询并将焦点放回输入框。选择结果时先关闭弹框，再调用条目的回调。重新打开时回到「全部」。
- 输入框聚焦时，可用 macOS 的 ⌘ 或其他平台的 Ctrl 加配置的字母执行对应操作。触屏支持直接点选。系统启用减少动态效果时，弹框直接显示。

可通过 `query` 与 `onQueryChange` 受控编辑查询。远程搜索时，接入方根据查询更新 `groups`，同时传 `filterItem={false}` 直接展示返回结果。本地搜索可用 `filterItem(item, query)` 自定义匹配。用 `renderItem(item)` 渲染缩略图或其他行内容，条目的可访问名称沿用 `item.label`，外层继续处理方向键和选择回调。

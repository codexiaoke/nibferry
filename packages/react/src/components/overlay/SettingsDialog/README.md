# SettingsDialog

## 用法

设置弹框居中显示，宽度和高度分别占视口的 80%。分类在左侧，当前分类的内容在右侧。

```tsx
import { useState } from 'react';
import { Button, SettingsDialog } from 'nibferry';

function Settings() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('general');
  return <>
    <Button onClick={() => setOpen(true)}>打开设置</Button>
    <SettingsDialog open={open} onOpenChange={setOpen} value={category} onValueChange={setCategory}
      sections={[
        { id: 'general', label: '通用', content: <GeneralPreferences /> },
        { id: 'account', label: '账户', content: <AccountDetails /> },
      ]} />
  </>;
}
```

## 参数与交互

`sections` 按传入顺序展示。每项提供唯一的 `id`、分类名 `label`、内容 `content`，也可提供 Hugeicons 的 `icon`。`value` 指定当前分类，点击分类通过 `onValueChange(id)` 通知接入方。设置值和需要跨分类保留的表单状态由接入方管理。

`label` 默认为「设置」。`open` 和 `onOpenChange` 沿用 `Dialog` 的交互。关闭按钮、Esc 和点击遮罩均可关闭。Tab 移动焦点，Enter 或空格选择分类。分类列表与正文独立滚动，窄屏使用紧凑的左栏。

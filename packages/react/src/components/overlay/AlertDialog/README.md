# AlertDialog

## 用法

对重要操作进行确认，默认聚焦取消按钮。

```tsx
import { AlertDialog } from 'nibferry';

<AlertDialog open={open} onOpenChange={setOpen} title="移除附件？"
  description="文件仍保存在工作区。" confirmLabel="移除" destructive onConfirm={removeFile} />
```

## 参数与交互

title、description 与 confirmLabel 由接入方提供。取消或 Esc 回调 onOpenChange(false)，点击遮罩保留弹框。确认时先调用 onConfirm，再请求关闭。destructive 控制危险操作配色。若操作移除了触发按钮，由接入方为列表选择下一个焦点。

# MessageCard

## 用法

在消息流中组合可操作的卡片。标题关联到卡片区域，可用键盘进入其中的控件。

```tsx
import { Button, MessageCard, Tag } from 'nibferry';

<MessageCard title="流程草案审批" status={<Tag role="status">{state}</Tag>}
  actions={pending && <Button onClick={approve}>通过</Button>}>
  <p>{summary}</p>
</MessageCard>
```

## 参数与交互

`title` 是可访问标题，`status` 放置状态，`children` 放置正文、表单或画布，`actions` 按传入顺序展示操作。支持 section 属性与 `ref`。表面、间距和边框使用当前主题。

审批决定和画布内容由接入方持有。组合 ActivitySequence 时，后续内容使用新 ID，同一张卡片持续使用原 ID 和组件类型，以保留编辑与焦点。

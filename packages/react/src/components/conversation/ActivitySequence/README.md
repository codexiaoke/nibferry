# ActivitySequence

## 用法

按接入方定义的顺序渲染流式内容，可合并连续同组的条目。

```tsx
import { ActivitySequence } from 'nibferry';

<ActivitySequence items={blocks} getKey={block => block.id} renderItem={renderBlock}
  group={{ by: block => block.group,
    render: (items, children) => <details><summary>{items.length} 个动作</summary>{children}</details> }} />
```

## 参数与交互

`items` 可以是任意应用数据类型。`getKey` 返回条目的稳定 ID。`renderItem` 决定单个条目如何显示。可选 `group.by` 返回分组键，`undefined` 中断当前组；从第一个带键条目开始调用 `group.render(items, children)`。流式追加同键条目时，使用同一类型的组容器即可保留已挂载表单或画布的本地状态。不传 `group` 时全部按原顺序呈现。更新同一条内容时复用 ID 和组件类型，可保留独立交互块的本地状态。

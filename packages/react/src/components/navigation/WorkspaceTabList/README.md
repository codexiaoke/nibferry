# WorkspaceTabList

在同一行排列工作区标签。标签过多时可以横向滚动。选中的标签、打开的页面和排列顺序由使用方持有。

```tsx
import { WorkspaceTabList, WorkspaceTab } from '@nibferry/react';
import '@nibferry/react/styles.css';

<WorkspaceTabList aria-label="文档标签" onReorder={setOrder}>
  {order.map(id => (
    <WorkspaceTab key={id} id={id} panelId={id + '-panel'} label={pages[id].title}
      selected={id === activeId} onClick={() => setActiveId(id)} onClose={() => close(id)} />
  ))}
</WorkspaceTabList>
```

`children` 直接放 WorkspaceTab。`onReorder` 接收按新顺序排列的完整标签 ID，接入方更新顺序后完成移动。省略此回调可关闭排序。拖动标签到另一项后松开即可移动，移出标签栏再松开或按 Escape 可取消。支持横向和从右向左的布局。

触屏上横滑可浏览超出宽度的标签，按住标签片刻再拖动可排序。左右方向键切换标签，Home 和 End 跳到首尾。Alt 加方向键将当前标签移动一位。使用 `aria-label` 或 `aria-labelledby` 命名标签栏，其他 div 属性和 ref 透传给容器。选中项使用画布、正文和分隔线颜色，排序指示线使用 `--nf-muted`，键盘焦点使用 `--nf-accent`。

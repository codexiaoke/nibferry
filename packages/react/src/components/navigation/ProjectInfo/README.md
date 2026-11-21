# ProjectInfo

## 用法

展示项目名称、聊天数量、仓库和本地目录。可放进项目分组的信息浮层或其他容器。

```tsx
import { ProjectInfo } from 'nibferry';

<ProjectInfo name="Nibferry" chatCount={3} activeChatCount={1}
  directory="~/code/project/Nibferry" pinned={pinned}
  onPinnedChange={setPinned} onEdit={editProject} />
```

## 参数与交互

`name`、`chatCount` 和 `activeChatCount` 由项目数据提供。`repository` 和 `directory` 可分别省略。设置 `onPinnedChange` 会显示置顶按钮，点击后报告新的布尔值，接入方更新 `pinned` 和项目顺序。设置 `onEdit` 会显示「编辑项目」按钮。两个按钮都能用 Tab 聚焦、用 Enter 或空格操作。

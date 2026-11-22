---
name: nibferry-ui
description: 在使用 nibferry 的 React 产品中搭建或修改界面。按需求选择公开组件，组合侧边助手、对话工作台、回复内操作与表单，并保持 Nibferry 的默认视觉和交互。
---

# 用 Nibferry 搭界面

先确定用户在哪里完成什么动作。已有页面只改涉及的区域；从下表选最接近的组合，读取对应示例。示例使用本地数据，接入时替换为宿主的真实数据和动作。

| 用户需求 | 从哪里开始 |
| --- | --- |
| 在已有页面旁提问、阅读引用 | 把 [DocumentAssistant.tsx](assets/DocumentAssistant.tsx) 放进有明确高度的宿主侧栏。沿用产品导航。[HandbookPage.tsx](assets/HandbookPage.tsx) 展示如何用 `MessageMarkdown.onOpenLink` 在阅读区打开来源，并在窄屏返回草稿。[侧栏效果图](references/handbook.png) |
| 从历史会话进入、继续提问 | [ChatWorkspace.tsx](assets/ChatWorkspace.tsx) 与 [ChatWorkspace.css](assets/ChatWorkspace.css) 组合左右分栏，主体复用上面的对话示例。窄屏可在会话列表与主体之间切换。[工作台效果图](references/workspace.png) |
| 在回复里通过或退回草案 | [DraftApproval.tsx](assets/DraftApproval.tsx) 演示正文与决策卡分开排版，决定后在原卡显示结果。实际审批按记录 ID 调用业务接口，成功后更新状态。[审批效果图](references/approval.png) |
| 设置、表单、记录列表或执行过程 | 设置分类选 `SettingsDialog`，字段选 `Field` 配 `Input` 或选择控件，行列记录选 `Table`，回合内的工具执行选 `TurnProcess`。按需在[组件目录](https://codexiaoke.github.io/nibferry/markdown/components.txt)查具体用法。 |

## 组合约定

- 在宿主入口加载一次 `nibferry/styles.css`。从 `nibferry` 根入口导入 UI；按已安装包的类型声明核对导出、插槽、回调及父组件。业务示例中的本地组件名只在示例内有效。
- 新增或改动的可见控件、卡片、浮层和面板只用 Nibferry 公开组件。用 `Stack`、`Inline` 和组件插槽排布局。段落、标题、链接、列表及宿主尺寸容器可使用语义 HTML。业务组件可以组合这些部件。不要借助原生控件、其他 UI 库或内部 CSS 选择器重画这些部件。
- 沿用主题的间距、表面、边框、圆角和动效；宿主负责高度、宽度和响应式布局。需要品牌适配时通过公开主题接口统一设置。同一级操作里突出当前主要动作。纯图标操作使用 Hugeicons 线性图标并提供可读名称。
- 普通回答直接放正文或 `MessageMarkdown`，有独立操作或结构化内容时才加卡片。模型选择、附件、语音、右侧资料栏等按实际需求加入。中文标题写内容，按钮写动作，保留表单标签、错误原因及操作后果，省去装饰英文和重复说明。
- 草稿、消息、选中的会话与审批决定由产品持有。切换会话时保留各自草稿；流式追加使用稳定 ID。仅呈现接入方能执行的动作。找不到部件时先查公开组合，仍有缺口就指出缺少的交互和受影响的需求。

交付时用实际界面走通用户要求的操作；涉及切栏就验证窄屏和草稿，涉及决策就验证操作后的状态与键盘焦点。视觉可对照[组件使用指南的可运行示例](https://codexiaoke.github.io/nibferry/docs/agent-guide/)。

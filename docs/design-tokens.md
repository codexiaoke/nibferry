# Nibferry UI Token 规范

Nibferry 是面向 Agent 产品的 React UI 组件库。主题按界面用途命名。按钮、选择器、导航项和弹层可以独立使用，也可以由应用组合。业务对象、流程和动作名称归使用方所有。

本文记录设计约定。下文的点分名称用于讨论 Token 的归属。当前可用的 React 配置以包内的类型声明为准。[当前主题接口](../packages/react/src/theme/config.ts)

## Token 的层次与覆盖

| 层次 | 职责 | 示例 |
| --- | --- | --- |
| 基础值 | 保存可复用的色值和单位 | 品牌蓝、基础字号、间距单位 |
| 梯度 | 组织同一属性的深浅、大小或快慢 | 暖灰色阶、字号梯度、圆角梯度 |
| 全局语义 | 表达可跨组件使用的视觉用途 | `text.secondary`、`border.input`、`focus.ring` |
| 组件与部件 | 在单个组件或部件内覆盖语义默认值 | `Select.trigger.border` 默认取 `border.input`，`Menu.content.shadow` 默认取 `shadow.popover` |

全局主题提供默认值，局部主题继承并覆盖指定项，组件覆盖只作用于对应组件。相同的默认颜色可以服务不同的角色。例如分隔线和输入边框在浅色下同值，深色下分别使用 10% 和 15% 的暖白。配色预设只包含颜色，密度和动效独立配置。分层方式参考 [Ant Design 定制主题](https://ant.design/docs/react/customize-theme-cn/)。

## 默认配色

采用 **assistant-ui 官网**的暖灰浅色与深色配色。下表 HEX 为 sRGB 近似值，精确值以来源中的 OKLCH 为准。品牌蓝为 `oklch(0.623 0.214 259.8)`。官网组件样式里的 `--accent` 用作弱强调底色，品牌页标注的蓝色对应 Nibferry 的 `brand.accent`。[品牌色板](https://www.assistant-ui.com/brand#colors) · [固定版本主题源码](https://github.com/assistant-ui/assistant-ui/blob/03c06506107f55a7bc11bed616a2fed06af8a8ba/apps/docs/styles/globals.css#L184-L267)

| 全局语义 | 浅色 | 深色 |
| --- | --- | --- |
| `surface.canvas` 页面 | `#FCFCFB` | `#0F0F0E` |
| `surface.sidebar` 侧栏 | `#F8F8F6` | `#1A1918` |
| `surface.card`、`surface.popover`、`surface.dialog` | `#FCFCFB` | `#1A1918` |
| `surface.muted` 弱强调底色 | `#F5F5F2` | `#282826` |
| `surface.code` 代码底色 | 在页面底色混入 4% 正文色 | 同一算法，使用深色主题的正文与页面色 |
| `text.primary`、`icon.default` | `#0A0A08` | `#FAFAF9` |
| `text.secondary`、`icon.muted` | `#74746F` | `#A1A19E` |
| `action.primary.background` / `foreground` | `#171714` / `#FAFAF8` | `#E5E5E4` / `#1A1918` |
| `action.secondary.background` / `foreground` | `#F5F5F2` / `#171714` | `#282826` / `#FAFAF9` |
| `brand.accent` 局部强调 | `#2B7FFF` | `#2B7FFF` |
| `feedback.danger` 危险色基准 | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` |

正文链接有独立的 `text.link`，按当前底色选可读的蓝阶并保留下划线。品牌蓝在浅色页面上的对比度约为 3.66∶1，普通字号链接需要更深的蓝阶才能达到 4.5∶1。文字选择高亮单独使用 `text.selection.background` 和 `text.selection.foreground`。[文字对比度](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

## 边框、阴影、遮罩与焦点

| Token | 默认约定 | 使用位置 |
| --- | --- | --- |
| `border.divider`、`border.surface` | 浅色 `#E5E5E2`，深色为暖白 `#FAFAF9` 的 10% | 分栏线、分组线、面板和浮层边框，各自可覆盖 |
| `border.input` | 浅色 `#E5E5E2`，深色为暖白的 15% | 输入框、选择器触发区 |
| `border.strong` | 浅色 `#74746F`，深色 `#A1A19E` | 依靠轮廓才能辨认的控件，如未选中的复选框 |
| `border.width`、`border.style` | 普通轮廓 1px 实线 | 输入、选择、分隔等共用同一基础宽度 |
| `focus.ring`、`focus.width`、`focus.offset` | Nibferry 采用品牌蓝、2px 线宽、2px 外偏移 | 键盘焦点与悬停、选中可同时呈现 |
| `shadow.surface`、`shadow.popover`、`shadow.dialog` | 默认均为 `none`，每项可覆盖为完整投影，包含偏移、模糊、扩散和颜色 | 常规表面、锚定浮层、模态弹层 |
| `overlay.scrim` | 单独配置遮罩颜色与透明度 | 打开模态对话框、模态抽屉时使用。普通下拉菜单和固定侧栏使用各自的表面与边框 |
| `layer.*` | 定义内容、吸顶区域、锚定浮层、模态层与提示层的叠放关系 | 模态里的菜单随同一模态层显示。每个模态遮罩紧邻其面板下方 |

assistant-ui 官网的七档标准阴影均设为透明。Nibferry 沿用平面默认外观，将完整投影留给使用方覆盖。深色边框保留 alpha 通道，落在页面和卡片上时随底色自然变化。焦点环和强轮廓是 Nibferry 的可访问性约定，关键状态在相邻表面上应达到 3∶1。[官网阴影定义](https://github.com/assistant-ui/assistant-ui/blob/03c06506107f55a7bc11bed616a2fed06af8a8ba/apps/docs/styles/globals.css#L168-L174) · [非文本对比度](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)

## 交互、反馈与数据色

- **交互状态**覆盖常态、悬停、按下、选中、键盘焦点、禁用、只读、加载和无效输入。按组件实际支持的状态指定背景、前景、边框或标记。`interaction.hover.background` 与 `interaction.selected.background` 可从同一暖灰阶取值；选择项另有勾选或选中指示，焦点可独立移动。
- **文字与图标**区分正文、辅助、占位、禁用、反色和链接。操作图标默认继承控件前景，独立状态指示可使用对应的反馈色。Hugeicons 线性 SVG 的视觉尺寸、线宽与按钮点击区域分别配置。
- **状态反馈**覆盖信息、成功、警告、错误；每种角色包含表面、文字、图标和边框。危险操作表达动作的后果，错误反馈表达已经发生的结果。两者可以引用同一危险色基准。具体状态用文字或图标同时表达。
- **数据色**按系列顺序提供浅深两组色槽，图例、形状或线型帮助区分系列。assistant-ui 官网给出了五个系列色槽，可作为这一组的基准。[图表色源码](https://github.com/assistant-ui/assistant-ui/blob/03c06506107f55a7bc11bed616a2fed06af8a8ba/apps/docs/styles/globals.css#L213-L217)

## 尺寸、排版、布局与动效

| 范围 | 覆盖项 | 应用规则 |
| --- | --- | --- |
| 间距与密度 | 间距梯度、内外边距、行列间隙、控件高度、点击区域 | 内外边距用偶数像素。紧凑模式可收窄间距，触屏仍保留足够的点击区域 |
| 圆角 | 直角、小圆角、控件、面板、胶囊和圆形 | 官网参考值为控件 8px、普通表面 10px；图标按钮可采用圆形。组件可局部覆盖 |
| 排版 | 正文与中文回退字体、等宽字体、字号、行高、字重、字距 | 标题、正文、标签、说明和代码分别组合这些值。官网以 Public Sans 和 JetBrains Mono 为参考字体，产品可替换字体族 |
| 布局 | 断点、容器宽度、页面边距、栏宽、阅读宽度、分栏最小宽度 | 同一布局同时考虑窄屏和宽屏，内容过长时允许收缩和折行 |
| 动效 | 时长、进入和退出缓动、位移、缩放、透明度 | 分别配置按压反馈、折叠展开、浮层进出。支持关闭动效并遵从系统减少动效偏好，状态变化仍即时可见 |

颜色、间距、尺寸和时长用平台可解释的值描述。Web 端映射到 CSS，未来的原生端可复用相同的语义角色。圆角和字体参考来自 [官网几何与字体配置](https://github.com/assistant-ui/assistant-ui/blob/03c06506107f55a7bc11bed616a2fed06af8a8ba/apps/docs/styles/globals.css#L107-L135)。

## 组件如何消费 Token

| 组件 | 正常状态 | 验证独立覆盖 |
| --- | --- | --- |
| Button | 主按钮取主操作前景、背景及控件圆角 | 在键盘聚焦并按下时，焦点与按压反馈都清楚 |
| Select | 触发器取输入边框；菜单取浮层表面、边框和投影 | 调整菜单投影只影响该菜单；键盘移动时已选项仍有标记 |
| Navigation | 导航项取侧栏表面、文字、悬停色和当前项指示 | 指针悬停另一项时仍能识别当前位置 |
| Dialog | 面板取弹层表面和投影，背景取模态遮罩 | 更改遮罩透明度不影响面板文字和按钮的对比度 |

每个组件的 README 列出实际消费的全局角色、可独立覆盖的部件及交互状态。文档示例用组件本身说明用法，完整应用场景放到场景示例页。

当前已确定默认色系、边框与焦点、默认无投影、Hugeicons 和配色与动效独立配置。遮罩透明度、完整状态色阶、尺寸与密度梯度、断点和动效曲线的最终数值留待各组定标。

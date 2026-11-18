# Nibferry

供多个 Agent 产品复用的 React 任务组件。Web 与 Electron 共用界面，任务数据和设计参数独立于浏览器。

## 本地开发

需要 Node.js 22.12 或更高版本和 pnpm 10。

```sh
pnpm install
pnpm dev
```

打开 [本地官网](http://127.0.0.1:3317)。组件库的 JS、CSS 和类型声明会随源码变化重新生成。官网里的三份资料使用固定数据，编辑内容仅保存在本次示例中。

## 项目结构

| 路径 | 职责 |
| --- | --- |
| `packages/react/src/task` | 任务附件和待决定事项的 TypeScript 类型 |
| `packages/react/src/theme` | 默认参数、配色预设与配置类型；构建和运行时采用相同的 CSS 变量映射 |
| `packages/react/src/components` | 输入框、决策区和原地切换容器；Web 键盘、焦点与动画 |
| `apps/docs` | Next.js 官网、Fumadocs MDX 接入指南和资料整理示例，均通过组件包的公开入口接入 |
| `tests` | 桌面与手机宽度下的浏览器交互验收 |

使用 `ThemeProvider` 可以在整个应用或单个工作区配置配色和动效。预设仅包含颜色；时长、缓动与关闭动效独立配置。示例见[接入指南](apps/docs/content/guide.mdx)。

应用持有任务、保存结果和错误状态，通过数据与回调使用组件。示例中的笔记合并、另存、阅读与编辑属于官网应用。RN 接入时可以复用任务类型和主题数据，并在原生组件中实现键盘、导航与动效。

## 验证与分发

```sh
pnpm typecheck
pnpm build
pnpm exec playwright install chromium
pnpm test
pnpm --filter @nibferry/react pack
```

将生成的 `.tgz` 安装到另一个 React 19 项目，入口引入 `@nibferry/react/styles.css`，按需从 `@nibferry/react` 导入组件。React 与 React DOM 由宿主提供；`@nibferry/react/theme` 可用于无需 DOM 的环境。

使用 `pnpm changeset` 记录公开接口改动，`pnpm version-packages` 更新版本与变更记录。注册表和访问范围由正式分发时确定。

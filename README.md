# Nibferry

Nibferry 是面向 Agent 产品的 React UI 组件库，用于搭建完整对话工作区，或在已有页面中嵌入侧边助手和悬浮助手。组件按界面能力划分，由应用按需组合。Web 与 Electron 共用界面，设计参数独立于浏览器。

组件拆分、状态归属和首页布局见[组件与工作区设计规范](apps/docs/content/component-design.mdx)。默认色系、边框、阴影和主题覆盖见 [UI Token 规范](docs/design-tokens.md)。

在线访问 [Nibferry 官网](https://codexiaoke.github.io/nibferry/) 、[组件总览](https://codexiaoke.github.io/nibferry/docs/components/)和[使用指南](https://codexiaoke.github.io/nibferry/docs/)。GitHub Actions 会在 PR 中构建并测试静态站点，合入 `main` 后自动部署到 GitHub Pages。

## 安装

在 React 19 项目中运行：

```sh
pnpm install nibferry
```

在应用入口引入一次 `nibferry/styles.css`，然后从 `nibferry` 导入需要的组件。

## 本地开发

需要 Node.js 22.12 或更高版本和 pnpm 10。

```sh
pnpm install
pnpm dev
```

打开[本地交互预览](http://127.0.0.1:3317/playground/) 查看桌面的左侧、主体和右侧布局，或在[组件总览](http://127.0.0.1:3317/docs/components/)中查找部件。包的 JS、CSS 和类型声明会随源码变化重新生成。

## 项目结构

| 路径 | 职责 |
| --- | --- |
| `packages/react/src/components/layout` | 工作区容器、左中右区域、Stack 与 Inline 及各自的用法说明 |
| `packages/react/src/theme` | 当前运行时默认值、配色预设、配置类型和 CSS 变量映射 |
| `docs/design-tokens.md` | 新组件采用的 UI Token 设计规范 |
| `apps/docs` | Next.js 官网、MDX 文档与全文搜索 |
| `tests` | 主题配置和官网加载 CSS 变量的验证 |

通过 `nibferry/theme` 读取主题数据和配色预设。Web 样式入口提供默认 CSS 变量，可按作用域覆盖。示例见[接入指南](apps/docs/content/theme.mdx)。

## 验证与分发

```sh
pnpm typecheck
pnpm build
pnpm exec playwright install chromium
pnpm test
```

使用 `pnpm changeset` 记录公开接口改动，`pnpm version-packages` 更新版本与变更记录。通过 npm 公共注册表分发 `nibferry`。

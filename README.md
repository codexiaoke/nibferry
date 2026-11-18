# Nibferry

Nibferry 是通用 React UI 组件库，可供多个产品及 Agent 界面复用。组件设计按输入、选择、导航、反馈等界面能力划分，由应用按需组合。Web 与 Electron 共用界面，设计参数独立于浏览器。

默认色系、边框、阴影、交互状态及组件覆盖约定见 [UI Token 规范](docs/design-tokens.md)。

在线访问 [Nibferry 官网](https://codexiaoke.github.io/nibferry/) 和[文档中心](https://codexiaoke.github.io/nibferry/docs/)。GitHub Actions 会在 PR 中构建并测试静态站点，合入 `main` 后自动部署到 GitHub Pages。

## 本地开发

需要 Node.js 22.12 或更高版本和 pnpm 10。

```sh
pnpm install
pnpm dev
```

打开 [本地官网](http://127.0.0.1:3317/) 查看交互预览，或阅读 [文档中心](http://127.0.0.1:3317/docs)。包的 JS、CSS 和类型声明会随源码变化重新生成。

## 项目结构

| 路径 | 职责 |
| --- | --- |
| `packages/react/src/theme` | 当前运行时默认值、配色预设、配置类型和 CSS 变量映射 |
| `docs/design-tokens.md` | 新组件采用的 UI Token 设计规范 |
| `apps/docs` | Next.js 官网、MDX 文档与全文搜索 |
| `tests` | 主题配置和官网加载 CSS 变量的验证 |

通过 `@nibferry/react/theme` 读取主题数据和配色预设。Web 样式入口提供默认 CSS 变量，可按作用域覆盖。示例见[接入指南](apps/docs/content/theme.mdx)。

## 验证与分发

```sh
pnpm typecheck
pnpm build
pnpm exec playwright install chromium
pnpm test
pnpm --filter @nibferry/react pack
```

将生成的 `.tgz` 安装到另一个 React 19 项目。Web 应用可引入 `@nibferry/react/styles.css`，无需 DOM 的环境可直接读取主题数据。

使用 `pnpm changeset` 记录公开接口改动，`pnpm version-packages` 更新版本与变更记录。注册表和访问范围由正式分发时确定。

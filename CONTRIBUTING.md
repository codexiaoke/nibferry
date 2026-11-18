# 贡献指南

## 提交说明

每个提交专注一个改动。标题用一行简短英文，以动词原形开头，点明改了什么，尽量控制在 50 个字符以内。默认只写标题。确有必要交代不兼容变更或原因时，用一两句英文补充，详细背景放在 PR 中。

示例：

- `Fix keyboard focus in menus`
- `Remove prototype components`
- `Document design tokens`

## 提交 PR

从最新的 `main` 创建工作分支。把实现、对应测试和必要的文档放在同一个改动中。PR 说明写清改动目的和验证方式。

代码改动先运行相关测试。改动涉及公共入口或构建时，运行 `pnpm typecheck`、`pnpm build` 和 `pnpm test`。公开包的 API 有变化时，使用 `pnpm changeset` 记录使用方需要了解的变更。开发环境见[项目说明](README.md)。

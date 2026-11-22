# NavigationRailAccount

## 用法

在常驻导航栏底部显示账户头像。点击头像，从右侧打开账户菜单。

```tsx
import { MenuItem, NavigationRail, NavigationRailAccount } from 'nibferry';

<NavigationRail label="主导航" footer={
  <NavigationRailAccount name="xiaoke" detail="Pro">
    <MenuItem onSelect={openProfile}>个人资料</MenuItem>
    <MenuItem onSelect={signOut}>退出登录</MenuItem>
  </NavigationRailAccount>
}>
  {navigationItems}
</NavigationRail>
```

普通项目侧栏展开时，在列表下方的固定区域使用整行入口。左侧显示同一账户的头像和名称，右侧显示设置图标。点击整行向上打开菜单。

```tsx
<NavigationRailAccount variant="sidebar" name="xiaoke" detail="Pro">
  <MenuItem onSelect={openProfile}>个人资料</MenuItem>
  <MenuItem onSelect={signOut}>退出登录</MenuItem>
</NavigationRailAccount>
```

## 参数与交互

`variant` 默认为 `rail`，适用于常驻导航栏或收起的项目侧栏。`sidebar` 适用于展开的项目侧栏。长用户名在行尾截断，菜单中展示账户信息。

`name` 是账户名。`detail` 可显示套餐或其他账户信息。`avatar` 接受图片或文字，同时用于入口和菜单顶部。省略时取账户名前两个字符，字母转大写。`label` 可替换头像按钮的无障碍名称。头像底色和文字颜色可分别通过 `--nf-account-avatar-bg` 和 `--nf-account-avatar-ink` 调整。

`children` 用现有菜单项、分隔线和子菜单组合。每项通过 `onSelect` 绑定操作。`menuProps` 传给 `MenuContent`，可调整弹出位置、挂载容器或样式。`open`、`defaultOpen` 和 `onOpenChange` 控制菜单的展开状态。

聚焦头像后按 Enter 或空格打开菜单。上下方向键切换操作，Esc 关闭并将焦点还给头像。

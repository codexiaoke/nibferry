# Disclosure

## 用法

把可选的说明或操作放在可展开的标题下。

```tsx
import { Disclosure } from 'nibferry';

<Disclosure label="来源说明"><p>资料由当前工作区的成员添加。</p></Disclosure>
```

## 参数与交互

`label` 是标题按钮的内容，`children` 是面板内容。通过 `defaultExpanded` 指定初始状态，或传入 `expanded` 和 `onExpandedChange` 受控。点击标题、Enter 或空格切换。收起时保留子组件状态并移出键盘导航。外层支持 div 属性和 ref。

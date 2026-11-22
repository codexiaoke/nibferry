# Avatar

## 用法

显示用户头像，缺少图片或加载失败时显示替代内容。

```tsx
import { Avatar } from 'nibferry';

<Avatar name="Xiaoke" src="/avatars/xiaoke.png" />
```

## 参数与交互

`name` 提供无障碍名称和默认文字，默认取名称前两个字符。`src` 提供头像图片，`children` 可替换文字。与旁边名称重复时可设 `aria-hidden`。`--nf-avatar-size`、`--nf-avatar-bg` 和 `--nf-avatar-ink` 控制尺寸和配色。

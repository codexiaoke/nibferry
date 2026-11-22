# Skeleton

## 用法

加载时为文字、头像和预览内容预留空间。默认文本骨架占一整行，色条在行内垂直居中。

```tsx
import { Avatar, Inline, Skeleton } from 'nibferry';

<section aria-label="作者" aria-busy={loading}>
  <Inline>
    {loading ? <Skeleton shape="circle" /> : <Avatar name={name} />}
    {loading ? <Skeleton style={{ width: '6em' }} /> : name}
  </Inline>
</section>
```

## 参数与交互

| 参数 | 用途 |
| --- | --- |
| `shape="text"` | 默认形状。继承排版行高，用 `style` 或 `className` 调整每行的宽度。 |
| `shape="circle"` | 圆形头像，默认直径与 `Avatar` 共用 `--nf-avatar-size`。 |
| `shape="block"` | 圆角内容块，默认高度为 4rem。缩略图和卡片可传入与实际内容相同的尺寸和圆角。 |

由接入方控制加载状态，在内容容器上设置 `aria-busy`。每块骨架都对读屏隐藏。局部主题可覆盖 `--nf-skeleton-base` 和 `--nf-skeleton-highlight`。开启系统减少动态效果或将主题的 `motion` 设为 `false` 时，骨架保持静止。

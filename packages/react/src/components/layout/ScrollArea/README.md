# ScrollArea

垂直滚动容器。滑块默认隐藏，滚动时浮现在视口边缘，停下约 0.8 秒后淡出。按住滑块拖动时保持可见。显隐时正文宽度保持稳定，开启减少动效后直接切换显隐。

```tsx
import { ScrollArea } from '@nibferry/react';
import '@nibferry/react/styles.css';

<ScrollArea style={{ maxHeight: 240 }} viewportProps={{ role: 'region', 'aria-label': '活动记录' }}>
  {records}
</ScrollArea>
```

`children` 是滚动内容。根元素接受 div 属性，可设置高度或最大高度。`viewportProps` 传给实际滚动的视口，用于设置焦点、读取 `ref` 或监听 `onScroll`。

支持拖动滑块、点击轨道、滚轮和触摸滚动。视口默认可用 Tab 聚焦，方向键、Page Up、Page Down、Home 和 End 使用浏览器的滚动行为。

默认颜色取自主题的弱文字色，可用 `--nf-scroll-thumb` 和 `--nf-scroll-thumb-active` 覆盖静止和交互颜色。

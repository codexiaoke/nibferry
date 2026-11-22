# Pagination

## 用法

在上一页和下一页间切换，显示当前页与总页数。

```tsx
import { Pagination } from 'nibferry';

<Pagination page={page} pageCount={pages} onPageChange={setPage} />
```

## 参数与交互

page 从 1 开始，pageCount 为总页数。首尾页分别禁用对应按钮。空列表传入 pageCount={0}，两个按钮均禁用。onPageChange 回调目标页，由宿主更新内容。

用作回复版本切换器时，传入 aria-label="回复版本"、previousLabel="上一版回复" 和 nextLabel="下一版回复"。

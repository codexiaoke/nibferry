# Table

## 用法

以原生表格语义展示结构化结果，内容过宽时在表格内滚动。

```tsx
import { Table } from 'nibferry';

<Table aria-label="资料"><thead><tr><th scope="col">名称</th></tr></thead>
  <tbody><tr><td>设计说明</td></tr></tbody></Table>
```

## 参数与交互

children 可包含 caption、thead、tbody、tfoot 与自定义单元格。支持 table 属性及 ref。列定义、数据排序和分页由宿主控制。

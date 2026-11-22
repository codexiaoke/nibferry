# Select

## 用法

通过单选菜单选择一个值。

```tsx
import { useState } from 'react';
import { Select } from 'nibferry';

function Example() {
  const [lang, setLang] = useState('zh');
  return <Select label="回复语言" value={lang} onValueChange={setLang}
    options={[{ value: 'zh', label: '中文' }, { value: 'en', label: 'English' }]} />;
}
```

## 参数与交互

菜单默认与选择器按钮等宽，打开期间会跟随按钮宽度变化。

`value`、`options`、`onValueChange` 由应用提供。每项支持 `value`、`label`、`detail`、`disabled`。`variant` 默认 `field`，可设为 `compact`。`side` 控制菜单方向，`container` 可指定挂载节点，弹框内默认挂入同一弹框。支持标准触发按钮属性、`menuClassName`、方向键和 Esc。

'use client';

import { useState } from 'react';

const examples = {
  TypeScript: (
    <>
      <b>import</b>
      {' { palettes, theme } '}
      <b>from</b> <em>"@nibferry/react/theme"</em>
      {';\n\n'}
      <b>const</b>
      {' primary = palettes.neutral.primary;\n'}
      <b>const</b>
      {' duration = theme.motion.feedback;\n'}
      <b>const</b>
      {' easing = theme.easing;'}
    </>
  ),
  CSS: (
    <>
      <b>@import</b> <em>"@nibferry/react/styles.css"</em>
      {';\n\n'}
      <b>body</b>
      {' {\n  color: var(--nf-ink);\n  background: var(--nf-canvas);\n}'}
    </>
  ),
};
type Language = keyof typeof examples;

export default function CodeExample() {
  const [language, setLanguage] = useState<Language>('TypeScript');
  return (
    <div className="code-example">
      <div className="example-heading">
        <h3>读取设计变量</h3>
        <div className="code-choices" role="group" aria-label="代码语言">
          {(['TypeScript', 'CSS'] as const).map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={name === language}
              onClick={() => setLanguage(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <pre key={language} aria-label={language + ' 示例'}>
        <code>{examples[language]}</code>
      </pre>
    </div>
  );
}

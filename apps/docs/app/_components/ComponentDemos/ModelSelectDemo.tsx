'use client';

import { useState } from 'react';
import { ComposerModelSelect } from 'nibferry';

export function ModelSelectDemo() {
  const [model, setModel] = useState('openai/astra');
  const [level, setLevel] = useState('high');
  return (
    <div className="component-demo" role="group" aria-label="模型选择器示例">
      <ComposerModelSelect
        models={[
          { value: 'openai/astra', label: 'GPT-6.2 Astra', provider: 'OpenAI' },
          { value: 'openai/sol', label: 'GPT-6.2 Sol', provider: 'OpenAI' },
          { value: 'deepseek/reasoner', label: 'DeepSeek Reasoner', provider: 'DeepSeek' },
        ]}
        levels={[{ value: 'low', label: '低' }, { value: 'medium', label: '中' }, { value: 'high', label: '高' }]}
        model={model} onModelChange={setModel} level={level} onLevelChange={setLevel} resetLevel="high"
      />
    </div>
  );
}

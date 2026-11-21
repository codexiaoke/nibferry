'use client';

import { useState, type CSSProperties } from 'react';
import { Inline } from 'nibferry';
import { theme } from 'nibferry/theme';
import { HugeiconsIcon } from '@hugeicons/react';
import Play from '@hugeicons/core-free-icons/PlayIcon';

const names = { feedback: '操作反馈', reveal: '内容展开', surface: '表面过渡' } as const;

export default function MotionPreview() {
  const [selected, setSelected] = useState<keyof typeof names>('feedback');
  const [iteration, setIteration] = useState(0);
  const duration = theme.motion[selected];
  return (
    <div className="doc-theme-example">
      <span>时长</span>
      <div className="pg-options" role="group" aria-label="选择动效">
        {(Object.keys(names) as (keyof typeof names)[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={selected === key}
            onClick={() => setSelected(key)}
          >
            {names[key]}
          </button>
        ))}
      </div>

      <section
        aria-label="动效预览"
        className="pg-motion"
        style={
          {
            '--timing': duration + 'ms',
            '--curve': 'cubic-bezier(' + theme.easing.join(',') + ')',
          } as CSSProperties
        }
      >
        <div className="motion-track" aria-hidden="true">
          <i key={selected + iteration} />
        </div>
        <Inline wrap className="pg-motion-info">
          <code>
            motion.{selected} · {duration}ms
          </code>
          <button type="button" onClick={() => setIteration((n) => n + 1)}>
            <HugeiconsIcon icon={Play} size={16} aria-hidden="true" />
            播放动效
          </button>
        </Inline>
      </section>
    </div>
  );
}

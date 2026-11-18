'use client';

import { useState, type CSSProperties } from 'react';
import { theme } from '@nibferry/react/theme';
import { HugeiconsIcon } from '@hugeicons/react';
import Play from '@hugeicons/core-free-icons/PlayIcon';

const names: Record<keyof typeof theme.motion, string> = {
  feedback: '操作反馈',
  reveal: '内容展开',
  surface: '表面过渡',
};

export default function MotionPreview() {
  const [selected, setSelected] = useState<keyof typeof theme.motion>('feedback');
  const [iteration, setIteration] = useState(0);
  const duration = theme.motion[selected];
  return (
    <section className="motion-section" aria-label="动效预览">
      <h2>动效预览</h2>
      <div className="motion-layout">
        <div className="motion-list" role="group" aria-label="选择动效">
          {(Object.keys(names) as (keyof typeof names)[]).map((key) => (
            <button
              type="button"
              key={key}
              aria-pressed={selected === key}
              onClick={() => setSelected(key)}
            >
              {names[key]}
              <code>{theme.motion[key]}ms</code>
            </button>
          ))}
        </div>
        <div
          className="motion-stage"
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
          <code>
            motion.{selected} · {duration}ms
          </code>
          <button type="button" onClick={() => setIteration(iteration + 1)}>
            <HugeiconsIcon icon={Play} size={14} aria-hidden="true" />
            播放动效
          </button>
        </div>
      </div>
    </section>
  );
}

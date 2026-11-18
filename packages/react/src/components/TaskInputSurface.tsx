import { useLayoutEffect, useRef, type ReactNode } from 'react';
import styles from './controls.module.css';

export interface TaskInputSurfaceProps {
  scene: 'compose' | 'decide';
  children: ReactNode;
}

export function TaskInputSurface({ scene, children }: TaskInputSurfaceProps) {
  const frame = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const previous = useRef<{ scene: string; height: number } | null>(null);

  useLayoutEffect(() => {
    const container = frame.current!;
    const content = body.current!;
    const before = previous.current;

    // Measure the natural content inside the animated wrapper, even during a resize.
    function measure() {
      const height = content.offsetHeight;
      previous.current = { scene, height };
      container.style.setProperty('--nf-target-height', height + 'px');
    }
    measure();

    if (before && before.scene !== scene) {
      container.style.setProperty('--nf-start-height', before.height + 'px');
      container.dataset.switching = '';
      if (document.activeElement === document.body || container.contains(document.activeElement)) {
        content
          .querySelector<HTMLElement>('[data-option], textarea')
          ?.focus({ preventScroll: true });
      }
    }
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [scene]);

  return (
    <div className={styles.surface}>
      <div key={scene} ref={frame} className={styles.surfaceFrame}>
        <div ref={body}>{children}</div>
      </div>
    </div>
  );
}

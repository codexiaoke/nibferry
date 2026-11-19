import type { ReactNode } from 'react';
import './MacWindow.css';

export default function MacWindow({ children }: { children: ReactNode }) {
  return (
    <div className="mac-window">
      <div className="mac-window-content">{children}</div>
    </div>
  );
}

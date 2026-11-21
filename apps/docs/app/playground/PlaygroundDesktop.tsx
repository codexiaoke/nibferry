'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Layout from '@hugeicons/core-free-icons/LayoutLeftIcon';
import { PaneButton } from '@nibferry/react';
import type { SearchEntry } from '../../lib/docs';
import MacWindow from '../_components/MacWindow/MacWindow';
import MacWindowControls from '../_components/MacWindowControls/MacWindowControls';
import WorkspacePreview from '../_components/WorkspacePreview/WorkspacePreview';

export default function PlaygroundDesktop({ searchEntries }: { searchEntries: SearchEntry[] }) {
  const desktop = useRef<HTMLDivElement>(null);
  const [showGlobalRail, setShowGlobalRail] = useState(false);
  const [canSwitch, setCanSwitch] = useState(false);

  useLayoutEffect(() => {
    // The original layout needs a 52px rail beside the 768px desktop workspace.
    const observer = new ResizeObserver(([entry]) => setCanSwitch(entry.contentRect.width >= 820));
    observer.observe(desktop.current!.querySelector('.mac-window-content')!);
    return () => observer.disconnect();
  }, []);

  return <div className="playground-desktop" ref={desktop}>
    {canSwitch && <PaneButton className="playground-layout-switch" icon={Layout} text="常驻导航栏"
      aria-pressed={showGlobalRail} title={showGlobalRail ? '切回项目侧栏布局' : '切换到常驻导航栏布局'}
      onClick={() => setShowGlobalRail(shown => !shown)} />}
    <MacWindow>
      <WorkspacePreview globalNavigation={canSwitch && showGlobalRail} searchEntries={searchEntries}
        toolbarStart={<MacWindowControls />} />
    </MacWindow>
  </div>;
}

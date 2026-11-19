import type { Metadata } from 'next';
import MacWindow from '../_components/MacWindow/MacWindow';
import MacWindowControls from '../_components/MacWindowControls/MacWindowControls';
import WorkspacePreview from '../_components/WorkspacePreview/WorkspacePreview';
import './playground.css';

export const metadata: Metadata = { title: '交互预览 · Nibferry' };

export default function PlaygroundPage() {
  return (
    <div className="playground-desktop">
      <MacWindow>
        <WorkspacePreview toolbarStart={<MacWindowControls />} />
      </MacWindow>
    </div>
  );
}

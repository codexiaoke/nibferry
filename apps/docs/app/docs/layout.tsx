import DocsSidebar from '../_components/DocsSidebar/DocsSidebar';
import { getGroups } from '../../lib/docs';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="docs-layout">
      <DocsSidebar groups={getGroups()} />
      {children}
    </div>
  );
}

import DocsSidebar from '../_components/DocsSidebar/DocsSidebar';
import SiteHeader from '../_components/SiteHeader/SiteHeader';
import { getSearchIndex, getGroups } from '../../lib/docs';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader entries={getSearchIndex()} />
      <div className="docs-layout">
        <DocsSidebar groups={getGroups()} />
        {children}
      </div>
    </>
  );
}

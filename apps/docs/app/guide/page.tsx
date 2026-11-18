import { basePath } from '../site-links';

export default function GuidePage() {
  const href = basePath + '/docs/theme/';
  return (
    <main id="content">
      <meta httpEquiv="refresh" content={'0;url=' + href} />
      <a href={href}>打开设计 Token 指南</a>
    </main>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { components } from '../../../lib/component-catalog';

export function ComponentAnchorRedirect() {
  const router = useRouter();
  useEffect(() => {
    function openComponent() {
      const entry = components.find(entry => '#' + entry.name === location.hash);
      if (entry && !document.getElementById(entry.name)) router.replace(entry.url);
    }
    openComponent();
    window.addEventListener('hashchange', openComponent);
    return () => window.removeEventListener('hashchange', openComponent);
  }, [router]);
  return null;
}

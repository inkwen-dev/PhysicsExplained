'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { adConfig } from '@/config/ads';

// Render from eligible page templates only. A document navigation resets vendor state.
export default function SocialBar() {
  useEffect(() => {
    if (!adConfig.enabled || !adConfig.socialBar.enabled) return;
    // Vendor has no documented SPA teardown. A real document navigation also
    // removes its overlays when entering About/404 and resets native containers.
    const navigate = (event: MouseEvent) => {
      if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element)?.closest('a[href]') as HTMLAnchorElement | null;
      if (!link || link.target || link.hasAttribute('download')) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      event.preventDefault();
      event.stopPropagation();
      location.assign(url.href);
    };
    document.addEventListener('click', navigate, true);
    return () => document.removeEventListener('click', navigate, true);
  }, []);
  if (!adConfig.enabled || !adConfig.socialBar.enabled) return null;
  return <Script id="adsterra-social-bar" src={adConfig.socialBar.scriptSrc} data-cfasync="false" strategy="lazyOnload" />;
}

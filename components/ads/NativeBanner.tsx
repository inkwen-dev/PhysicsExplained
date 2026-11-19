'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface NativeBannerProps {
  containerId: string;
  scriptSrc: string;
  className?: string;
  showLabel?: boolean;
  maxWidth?: string;
  wrapperClassName?: string;
}

export default function NativeBanner({
  containerId,
  scriptSrc,
  className,
  showLabel = true,
  maxWidth = 'max-w-4xl',
  wrapperClassName,
}: NativeBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout>;
    const script = document.createElement('script');
    const inspect = () => {
      const image = Array.from(node.querySelectorAll('img')).some(img => img.complete && img.naturalWidth > 10 && img.naturalHeight > 10);
      const text = Array.from(node.querySelectorAll('a[href]')).some(a => (a.textContent?.trim().length ?? 0) > 10);
      if (!disposed && (image || text)) { clearTimeout(timer); setFilled(true); }
    };
    const changes = new MutationObserver(inspect);
    changes.observe(node, {subtree:true, childList:true, attributes:true});
    node.addEventListener('load', inspect, true);
    const proximity = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      proximity.disconnect();
      script.src = scriptSrc;
      script.async = true;
      script.dataset.cfasync = 'false';
      script.onerror = () => { setFilled(false); node.replaceChildren(); };
      node.appendChild(script);
      timer = setTimeout(() => { if (!disposed) { setFilled(false); node.replaceChildren(); } }, 20000);
    }, {rootMargin:'600px'});
    proximity.observe(node);
    return () => {
      disposed = true;
      clearTimeout(timer);
      proximity.disconnect(); changes.disconnect();
      node.removeEventListener('load', inspect, true);
      script.remove(); node.replaceChildren();
    };
  }, [containerId, scriptSrc]);

  return (
    <div data-ad-position="native" className={cn('ad-slot', filled && 'ad-filled', filled && wrapperClassName)}>
      {filled && showLabel && <div className="ad-label">Advertisement</div>}
      <div className={cn('ad-host mx-auto', maxWidth, className)}>
        <div id={containerId} ref={containerRef} />
      </div>
    </div>
  );
}

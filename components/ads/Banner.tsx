'use client';

import { useEffect, useRef, useState } from 'react';
import { adConfig, bannerUnits, type BannerPosition } from '@/config/ads';

/** Each instance owns a document: atOptions/document.write cannot collide. */
export default function Banner({ position }: { position: BannerPosition }) {
  const host = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const node = host.current;
    if (!node || !adConfig.enabled || !adConfig.bannerEnabled) return;
    const width = node.parentElement?.clientWidth ?? 0;
    const unit = position === 'sidebar'
      ? (window.matchMedia('(min-width: 1280px)').matches ? bannerUnits.sidebar : null)
      : position === 'top' ? (width >= 728 ? bannerUnits.leaderboard : width >= 320 ? bannerUnits.mobile : null)
      : position === 'middle' ? (width >= 300 ? bannerUnits.rectangle : null)
      : width >= 468 ? bannerUnits.compact : null;
    if (!unit) return;
    let cancelled = false;
    let frame: HTMLIFrameElement | undefined;
    let timeout: ReturnType<typeof setTimeout>;
    const message = (event: MessageEvent) => {
      if (event.source !== frame?.contentWindow || event.data?.type !== 'physics-ad') return;
      if (event.data.filled && !cancelled) {
        clearTimeout(timeout);
        setFilled(true);
      }
    };
    window.addEventListener('message', message);
    const load = () => {
      frame = document.createElement('iframe');
      frame.title = 'Advertisement';
      frame.width = String(unit.width);
      frame.height = String(unit.height);
      frame.style.cssText = 'border:0;display:block;margin:auto;max-width:100%';
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation');
      // No script-onload = fill assumption. Observe delivered images/frames instead.
      frame.srcdoc = `<!doctype html><html><head><meta name="referrer" content="strict-origin-when-cross-origin"><style>html,body{margin:0;padding:0;background:transparent}</style></head><body><script>
        const report=()=>parent.postMessage({type:'physics-ad',filled:true},'*');
        const seen=new WeakSet();
        new MutationObserver(()=>document.querySelectorAll('iframe,img').forEach(el=>{
          if(seen.has(el))return;seen.add(el);
          el.addEventListener('load',()=>{
            if(el.tagName==='IMG'){if(el.naturalWidth>10&&el.naturalHeight>10)report();return;}
            if(!el.src||el.src==='about:blank')return;
            try{if(el.contentDocument?.body?.children.length)report();}catch{report();}
          });
        })).observe(document.body,{childList:true,subtree:true});
        var atOptions=${JSON.stringify({key:unit.key,format:'iframe',height:unit.height,width:unit.width,params:{}})};
        <\/script><script src="${unit.scriptSrc}"><\/script></body></html>`;
      node.appendChild(frame);
      timeout = setTimeout(() => { if (!cancelled) { frame?.remove(); setFilled(false); } }, 20000);
    };
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); load(); }
    }, { rootMargin: '600px' });
    observer.observe(node);
    return () => {
      cancelled = true;
      observer.disconnect();
      clearTimeout(timeout);
      window.removeEventListener('message', message);
      frame?.remove();
      setFilled(false);
    };
  }, [position]);
  return <div data-ad-position={position} className={`ad-slot not-prose${filled ? ' ad-filled' : ''}`}>
    {filled && <div className="ad-label">Advertisement</div>}
    <div ref={host} className="ad-host" />
  </div>;
}

'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
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
  const scriptLoadedRef = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // 确保容器存在后再加载广告
    if (containerRef.current && scriptLoadedRef.current) {
      // 广告脚本会自动查找容器并渲染
      // 这里不需要额外操作
    }
  }, []);

  const handleScriptLoad = () => {
    scriptLoadedRef.current = true;
  };

  const handleScriptError = () => {
    setFailed(true);
    // 广告加载失败时，隐藏容器
    if (containerRef.current) {
      containerRef.current.style.display = 'none';
    }
  };

  if (failed) return null;

  return (
    <div className={cn('mt-8 pt-8 border-t border-border', wrapperClassName)}>
      {showLabel && (
        <div className="text-xs text-text-secondary mb-2 text-center uppercase tracking-wide">
          Advertisement
        </div>
      )}
      <div className={cn(maxWidth, 'mx-auto px-4', className)}>
        <div
          id={containerId}
          ref={containerRef}
          className="min-h-[100px]"
        />
      </div>
      <Script
        data-cfasync="false"
        src={scriptSrc}
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        async
      />
    </div>
  );
}


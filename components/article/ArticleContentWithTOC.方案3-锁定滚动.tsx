// 方案3：Transition期间锁定滚动 + scroll-snap
// 优点：保持平滑动画，滚动位置稳定
// 缺点：可能影响用户正常滚动体验，实现复杂

'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import SidebarTOC from './SidebarTOC';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface ArticleContentWithTOCProps {
  headings: Heading[];
  hasTOC: boolean;
  content: string;
}

export default function ArticleContentWithTOC({ headings, hasTOC, content }: ArticleContentWithTOCProps) {
  const [showTOC, setShowTOC] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedPreference = localStorage.getItem('toc-visible');
      return savedPreference === 'true';
    }
    return false;
  });
  const [tocRight, setTocRight] = useState<string>('1rem');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollLockRef = useRef<number | null>(null);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    isInitialMountRef.current = false;
  }, []);

  useEffect(() => {
    const updateTocPosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const right = window.innerWidth - rect.right;
        setTocRight(`${right}px`);
      }
    };

    if (showTOC && hasTOC) {
      updateTocPosition();
      window.addEventListener('resize', updateTocPosition);
      return () => window.removeEventListener('resize', updateTocPosition);
    }
  }, [showTOC, hasTOC]);

  const handleToggleTOC = () => {
    const currentScrollY = window.scrollY;
    const newValue = !showTOC;
    
    // 开始transition
    setIsTransitioning(true);
    
    flushSync(() => {
      setShowTOC(newValue);
    });
    
    // 锁定滚动位置
    const lockScroll = () => {
      if (scrollLockRef.current !== null) {
        window.scrollTo({ top: currentScrollY, behavior: 'auto' });
        requestAnimationFrame(lockScroll);
      }
    };
    
    scrollLockRef.current = requestAnimationFrame(lockScroll);
    
    // 200ms后解除锁定
    setTimeout(() => {
      if (scrollLockRef.current !== null) {
        cancelAnimationFrame(scrollLockRef.current);
        scrollLockRef.current = null;
      }
      setIsTransitioning(false);
      // 最后确认一次位置
      window.scrollTo({ top: currentScrollY, behavior: 'auto' });
    }, 200);
    
    localStorage.setItem('toc-visible', String(newValue));
  };

  const renderArticleContent = () => (
    <div className="prose prose-lg mb-8 max-w-none w-full">
      <div
        dangerouslySetInnerHTML={{
          __html: content.replace(
            /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi,
            (match, level, content) => {
              const text = content.replace(/<[^>]*>/g, '').trim();
              const id = text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
              return `<h${level} id="${id}">${content}</h${level}>`;
            }
          ),
        }}
      />
    </div>
  );

  return (
    <>
      <div 
        ref={containerRef} 
        className="w-[80%] max-w-[1400px] mx-auto px-4"
        style={{
          // 方案3：transition期间锁定滚动
          scrollSnapType: isTransitioning ? 'y mandatory' : 'none',
          overflowAnchor: isTransitioning ? 'none' : 'auto'
        }}
      >
        <div 
          className={`transition-[padding-right] duration-200 ease-out ${showTOC && hasTOC ? 'pr-[304px]' : ''}`}
        >
          {renderArticleContent()}
        </div>
      </div>

      {showTOC && hasTOC && (
        <aside 
          className="hidden lg:block fixed top-24 w-64 z-40"
          style={{ right: tocRight }}
        >
          <SidebarTOC headings={headings} onToggle={handleToggleTOC} />
        </aside>
      )}
      
      {hasTOC && !showTOC && (
        <div className="hidden lg:block fixed bottom-8 right-8 z-50">
          <button
            onClick={handleToggleTOC}
            className="w-14 h-14 bg-accent hover:bg-accent-light text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            aria-label="Show table of contents"
            title="Show table of contents"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}


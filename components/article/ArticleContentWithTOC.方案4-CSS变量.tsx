// 方案4：使用CSS变量 + 单次恢复
// 优点：利用CSS变量优化性能，只在transition完成后恢复一次
// 缺点：仍可能在transition期间有轻微闪烁

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
  const containerRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const scrollTargetRef = useRef<number | null>(null);
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
    // 保存当前滚动位置
    scrollTargetRef.current = window.scrollY;
    
    const newValue = !showTOC;
    
    flushSync(() => {
      setShowTOC(newValue);
    });
    
    localStorage.setItem('toc-visible', String(newValue));
  };

  // 方案4：只在transition完成后恢复一次
  useLayoutEffect(() => {
    if (isInitialMountRef.current || scrollTargetRef.current === null) {
      return;
    }

    const savedScrollY = scrollTargetRef.current;
    
    // 等待transition完成后再恢复
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: savedScrollY, behavior: 'auto' });
      scrollTargetRef.current = null;
    }, 250); // transition duration 200ms + 50ms缓冲

    return () => {
      clearTimeout(timeoutId);
    };
  }, [showTOC]);

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
      <div ref={containerRef} className="w-[80%] max-w-[1400px] mx-auto px-4">
        {/* 方案4：使用CSS变量优化，只在transition完成后恢复 */}
        <div 
          ref={contentWrapperRef}
          className="transition-[padding-right] duration-200 ease-out"
          style={{
            // 使用CSS变量，浏览器可以更好地优化
            paddingRight: showTOC && hasTOC ? '304px' : '0px',
            willChange: 'padding-right'
          }}
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


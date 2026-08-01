// 方案2：使用Transform代替Padding（避免布局重排）
// 优点：无布局重排，可以有平滑动画，不会影响滚动位置
// 缺点：实现稍复杂，需要调整内容区域的定位方式

'use client';

import { useState, useEffect, useRef } from 'react';
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
    const newValue = !showTOC;
    
    flushSync(() => {
      setShowTOC(newValue);
    });
    
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
      <div ref={containerRef} className="w-[80%] max-w-[1400px] mx-auto px-4">
        {/* 方案2：使用transform代替padding，避免布局重排 */}
        {/* 外层容器：始终占据全宽 */}
        <div className="relative">
          {/* 内容区域：使用transform调整位置，而不是padding */}
          <div 
            className="transition-transform duration-200 ease-out"
            style={{
              transform: showTOC && hasTOC ? 'translateX(0)' : 'translateX(0)',
              // 使用max-width限制内容宽度，而不是padding
              maxWidth: showTOC && hasTOC ? 'calc(100% - 304px)' : '100%',
              transition: 'max-width 200ms ease-out'
            }}
          >
            {renderArticleContent()}
          </div>
          
          {/* TOC占位空间：使用absolute定位，不占用文档流 */}
          {showTOC && hasTOC && (
            <div 
              className="absolute top-0 right-0 w-[304px] pointer-events-none"
              aria-hidden="true"
            />
          )}
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


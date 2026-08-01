// 方案1：禁用Transition + 使用will-change优化
// 优点：完全消除闪烁，性能最好
// 缺点：没有平滑动画（瞬间切换）

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
    // 在状态变化前保存滚动位置
    const currentScrollY = window.scrollY;
    
    const newValue = !showTOC;
    
    // 使用 flushSync 强制同步更新
    flushSync(() => {
      setShowTOC(newValue);
    });
    
    // 立即恢复滚动位置（无transition，所以可以立即恢复）
    requestAnimationFrame(() => {
      window.scrollTo({ top: currentScrollY, behavior: 'auto' });
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
        {/* 方案1：无transition，使用will-change优化，瞬间切换 */}
        <div 
          className={`will-change-[padding-right] ${showTOC && hasTOC ? 'pr-[304px]' : ''}`}
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


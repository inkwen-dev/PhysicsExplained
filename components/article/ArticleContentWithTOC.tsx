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

interface ScrollTarget {
  elementId: string | null;
  offsetFromTop: number; // 元素相对于视口顶部的位置
  elementAbsoluteTop: number; // 元素的绝对位置（相对于文档顶部）
}

export default function ArticleContentWithTOC({ headings, hasTOC, content }: ArticleContentWithTOCProps) {
  // 初始状态统一为 false，避免 SSR 和客户端 hydration 不匹配
  const [showTOC, setShowTOC] = useState(false);
  const [tocRight, setTocRight] = useState<string>('1rem');
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTargetRef = useRef<ScrollTarget | null>(null);
  const isInitialMountRef = useRef(true);

  // 在客户端挂载后读取 localStorage，避免 hydration 错误
  useEffect(() => {
    const savedPreference = localStorage.getItem('toc-visible');
    if (savedPreference !== null) {
      setShowTOC(savedPreference === 'true');
    }
    isInitialMountRef.current = false;
  }, []);

  // 计算TOC的位置（容器右侧）
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

  // 保存用户偏好到 localStorage，并保持视口顶部内容位置不变
  const handleToggleTOC = () => {
    // 保存当前滚动位置和视口顶部元素信息
    const currentScrollY = window.scrollY;
    
    // 找到当前视口顶部最接近的元素，用于精确定位
    // 优先查找标题元素（h2, h3），因为它们有ID，定位更准确
    let targetElement: Element | null = null;
    let offsetFromTop = 0;
    
    const allHeadings = document.querySelectorAll('h2[id], h3[id]');
    let minDistanceToTop = Infinity;
    
    allHeadings.forEach((heading) => {
      const rect = heading.getBoundingClientRect();
      const distanceToTop = Math.abs(rect.top);
      
      // 找最接近视口顶部的标题（在视口内或接近视口顶部）
      if (rect.top >= -100 && rect.top <= window.innerHeight && distanceToTop < minDistanceToTop) {
        minDistanceToTop = distanceToTop;
        targetElement = heading;
        offsetFromTop = rect.top;
      }
    });
    
    // 如果没找到标题，找第一个可见的段落或其他元素
    if (!targetElement && containerRef.current) {
      const paragraphs = containerRef.current.querySelectorAll('p, div, li');
      for (const el of Array.from(paragraphs)) {
        const rect = el.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= window.innerHeight && rect.height > 0) {
          targetElement = el;
          offsetFromTop = rect.top;
          break;
        }
      }
    }
    
    // 如果还是没找到，使用视口顶部的位置作为参考点
    let elementAbsoluteTop = currentScrollY;
    let elementId: string | null = null;
    
    if (targetElement) {
      const htmlElement = targetElement as HTMLElement;
      // 计算元素的绝对位置（相对于文档顶部）
      elementAbsoluteTop = currentScrollY + offsetFromTop;
      if (htmlElement.id) {
        elementId = htmlElement.id;
      }
    }
    
    // 保存滚动目标信息
    scrollTargetRef.current = {
      elementId: elementId,
      offsetFromTop: offsetFromTop,
      elementAbsoluteTop: elementAbsoluteTop,
    };
    
    const newValue = !showTOC;
    
    // 使用 flushSync 强制同步更新
    flushSync(() => {
      setShowTOC(newValue);
    });
    
    localStorage.setItem('toc-visible', String(newValue));
  };

  // 在布局更新后恢复滚动位置，保持视口顶部内容不变
  useLayoutEffect(() => {
    // 初始挂载时不需要恢复
    if (isInitialMountRef.current || scrollTargetRef.current === null) {
      return;
    }

    const { elementId, offsetFromTop, elementAbsoluteTop } = scrollTargetRef.current;

    // 恢复滚动位置的函数
    const restoreScrollPosition = () => {
      let targetScrollY: number;

      // 优先使用元素ID来精确定位（标题元素最稳定，不会因换行而消失）
      if (elementId) {
        const targetElement = document.getElementById(elementId);
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          // 计算元素在新布局下的绝对位置
          const newElementAbsoluteTop = window.scrollY + rect.top;
          // 让元素回到原来的视口位置：新绝对位置 - 原来的偏移量
          targetScrollY = newElementAbsoluteTop - offsetFromTop;
        } else {
          // 如果找不到元素（不应该发生，因为标题有ID），使用保存的绝对位置
          // 尝试找到最接近保存绝对位置的元素
          targetScrollY = window.scrollY;
          
          if (containerRef.current) {
            const allElements = containerRef.current.querySelectorAll('h2[id], h3[id]');
            let closestElement: HTMLElement | null = null;
            let minDistance = Infinity;
            
            Array.from(allElements).forEach((el) => {
              const htmlEl = el as HTMLElement;
              const rect = htmlEl.getBoundingClientRect();
              const absoluteTop = window.scrollY + rect.top;
              const distance = Math.abs(absoluteTop - elementAbsoluteTop);
              
              if (distance < minDistance && rect.height > 0) {
                minDistance = distance;
                closestElement = htmlEl;
              }
            });
            
            if (closestElement && minDistance < 500) {
              const htmlEl = closestElement as HTMLElement;
              const rect = htmlEl.getBoundingClientRect();
              const newAbsoluteTop = window.scrollY + rect.top;
              targetScrollY = newAbsoluteTop - offsetFromTop;
            }
          }
        }
      } else {
        // 如果没有元素ID，尝试找到最接近保存绝对位置的元素
        // 优先查找标题元素，因为它们更稳定
        targetScrollY = window.scrollY;
        
        if (containerRef.current && elementAbsoluteTop > 0) {
          // 先尝试找标题
          const headings = containerRef.current.querySelectorAll('h2[id], h3[id]');
          let closestElement: HTMLElement | null = null;
          let minDistance = Infinity;
          
          Array.from(headings).forEach((el) => {
            const htmlEl = el as HTMLElement;
            const rect = htmlEl.getBoundingClientRect();
            const absoluteTop = window.scrollY + rect.top;
            const distance = Math.abs(absoluteTop - elementAbsoluteTop);
            
            if (distance < minDistance && rect.height > 0) {
              minDistance = distance;
              closestElement = htmlEl;
            }
          });
          
          // 如果没找到合适的标题，再找其他元素
          if (!closestElement || minDistance > 300) {
            const allElements = containerRef.current.querySelectorAll('p, div, li');
            Array.from(allElements).forEach((el) => {
              const htmlEl = el as HTMLElement;
              const rect = htmlEl.getBoundingClientRect();
              const absoluteTop = window.scrollY + rect.top;
              const distance = Math.abs(absoluteTop - elementAbsoluteTop);
              
              if (distance < minDistance && rect.height > 0) {
                minDistance = distance;
                closestElement = htmlEl;
              }
            });
          }
          
          if (closestElement && minDistance < 500) {
            const htmlEl = closestElement as HTMLElement;
            const rect = htmlEl.getBoundingClientRect();
            const newAbsoluteTop = window.scrollY + rect.top;
            targetScrollY = newAbsoluteTop - offsetFromTop;
          }
        }
      }

      // 确保滚动位置有效
      if (targetScrollY < 0) {
        targetScrollY = 0;
      }

      // 恢复滚动位置
      window.scrollTo({ top: targetScrollY, behavior: 'auto' });
    };

    // 立即恢复一次
    restoreScrollPosition();
    
    // 使用ResizeObserver监听布局变化，确保在布局完全稳定后再恢复
    if (containerRef.current) {
      let hasRestored = false;
      let rafId: number | null = null;
      
      const resizeObserver = new ResizeObserver(() => {
        if (hasRestored) return;
        
        // 延迟恢复，等待布局稳定
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        
        rafId = requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!hasRestored) {
              restoreScrollPosition();
              hasRestored = true;
              scrollTargetRef.current = null;
              resizeObserver.disconnect();
            }
          });
        });
      });
      
      resizeObserver.observe(containerRef.current);
      
      // 备用方案：如果ResizeObserver没有触发，使用超时
      const fallbackTimeout = setTimeout(() => {
        if (!hasRestored) {
          resizeObserver.disconnect();
          restoreScrollPosition();
          hasRestored = true;
          scrollTargetRef.current = null;
        }
      }, 100);
      
      return () => {
        resizeObserver.disconnect();
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        clearTimeout(fallbackTimeout);
      };
    } else {
      // 如果没有ref，使用requestAnimationFrame作为备用
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          restoreScrollPosition();
          scrollTargetRef.current = null;
        });
      });
      
      return () => {
        cancelAnimationFrame(rafId);
      };
    }
  }, [showTOC]);

  // 渲染文章内容（提取为函数，避免重复）
  // 无论TOC是否显示，文章内容区域都使用相同的样式，确保宽度一致
  const renderArticleContent = () => (
    <div className="prose prose-lg mb-8 max-w-none w-full">
      {/* 为标题添加 ID */}
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
      {/* 文章内容区域 - 始终占据整个80%容器，宽度保持一致 */}
      <div ref={containerRef} className="w-[80%] max-w-[1400px] mx-auto px-4">
        {/* 方案1：无transition，使用will-change优化，瞬间切换，完全消除闪烁 */}
        <div 
          className={`will-change-[padding-right] ${showTOC && hasTOC ? 'pr-[304px]' : ''}`}
        >
          {renderArticleContent()}
        </div>
      </div>

      {/* TOC 侧边栏 - 使用fixed定位，固定在视口右侧，不占用文档流空间 */}
      {showTOC && hasTOC && (
        <aside 
          className="hidden lg:block fixed top-24 w-64 z-40"
          style={{ right: tocRight }}
        >
          <SidebarTOC headings={headings} onToggle={handleToggleTOC} />
        </aside>
      )}
      
      {/* TOC 隐藏时显示一个浮动按钮来重新显示 - 桌面端 */}
      {hasTOC && !showTOC && (
        <div className="hidden lg:block fixed bottom-8 right-8 z-50">
          <button
            onClick={handleToggleTOC}
            className="w-14 h-14 bg-accent hover:bg-accent-light text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            aria-label="Show table of contents"
            title="Show table of contents"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}


'use client';

import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface SidebarTOCProps {
  headings: Heading[];
  onToggle?: () => void;
}

export default function SidebarTOC({ headings, onToggle }: SidebarTOCProps) {
  const [activeId, setActiveId] = useState<string>('');

  // 监听当前章节，高亮 TOC 中的对应项
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
      }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);

  // 点击链接后平滑滚动
  const handleHeadingClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-24 w-64 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="border-l-2 border-border pl-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
            Table of Contents
          </h3>
          {onToggle && (
            <button
              onClick={onToggle}
              className="text-text-secondary hover:text-primary transition-colors p-1"
              aria-label="Hide table of contents"
              title="Hide table of contents"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <nav className="space-y-2">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => handleHeadingClick(e, heading.id)}
              className={`block text-sm transition-colors break-words py-1 ${
                heading.level === 2
                  ? 'font-medium text-text-primary'
                  : 'text-text-secondary ml-4'
              } ${
                activeId === heading.id
                  ? 'text-accent border-l-2 border-accent pl-2 -ml-4'
                  : 'hover:text-accent'
              }`}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}


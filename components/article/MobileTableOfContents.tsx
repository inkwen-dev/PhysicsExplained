'use client';

import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface MobileTableOfContentsProps {
  headings: Heading[];
}

export default function MobileTableOfContents({ headings }: MobileTableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0 || typeof window === 'undefined') return;

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

  const handleHeadingClick = (id: string) => {
    setIsOpen(false);
    // Smooth scroll to heading
    if (typeof window !== 'undefined') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="lg:hidden mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mobile-toc-button w-full flex items-center justify-between p-3 bg-surface border border-border rounded-lg hover:bg-surface/80 hover:border-accent transition-all duration-200"
        aria-expanded={isOpen}
        aria-label="Toggle table of contents"
      >
        <span className="text-sm font-semibold text-primary uppercase tracking-wide">
          Table of Contents
        </span>
        <svg
          className={`w-5 h-5 text-text-secondary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <nav className="mobile-toc-nav mt-2 p-4 bg-surface border border-border rounded-lg shadow-md">
          <ul className="space-y-2">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleHeadingClick(heading.id);
                  }}
                  className={`block text-sm transition-colors break-words ${
                    heading.level === 2
                      ? 'font-medium text-text-primary'
                      : 'text-text-secondary ml-4'
                  } ${
                    activeId === heading.id
                      ? 'text-accent font-semibold'
                      : 'hover:text-accent'
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}


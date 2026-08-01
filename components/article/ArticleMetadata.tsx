import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface ArticleMetadataProps {
  publishedAt: string;
  updatedAt?: string;
  categoryId: string;
  subcategoryId: string;
  categoryName?: string;
  subcategoryName?: string;
  readingTime: number;
}

export default function ArticleMetadata({
  publishedAt,
  updatedAt,
  categoryId,
  subcategoryId,
  categoryName,
  subcategoryName,
  readingTime,
}: ArticleMetadataProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-6 pb-4 border-b border-border">
      <div className="flex items-center gap-2">
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>Published {formatDate(publishedAt)}</span>
      </div>
      
      {updatedAt && updatedAt !== publishedAt && (
        <div className="flex items-center gap-2">
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Updated {formatDate(updatedAt)}</span>
        </div>
      )}
      
      <div className="flex items-center gap-2">
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{readingTime} min read</span>
      </div>
      
      {(categoryName || subcategoryName) && (
        <div className="flex items-center gap-2">
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
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <div className="flex items-center gap-2">
            {categoryName && (
              <Link
                href={`/categories/${categoryId}`}
                className="hover:text-accent transition-colors"
              >
                {categoryName}
              </Link>
            )}
            {categoryName && subcategoryName && (
              <span>/</span>
            )}
            {subcategoryName && (
              <Link
                href={`/categories/${categoryId}/${subcategoryId}`}
                className="hover:text-accent transition-colors"
              >
                {subcategoryName}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


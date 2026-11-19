import Banner from '@/components/ads/Banner';
import SocialBar from '@/components/ads/SocialBar';
import { Fragment } from 'react';
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getArticleBySlug, getAllArticles, getCategoryBySlug, getSubcategoryBySlug } from "@/lib/content";
import { calculateReadingTime, extractHeadings } from "@/lib/utils";
import ArticleMetadata from "@/components/article/ArticleMetadata";
import MobileTableOfContents from "@/components/article/MobileTableOfContents";
import ArticleContentWithTOC from "@/components/article/ArticleContentWithTOC";
import SupportSection from "@/components/article/SupportSection";
import ProjectPromotion from "@/components/article/ProjectPromotion";
import NativeBanner from "@/components/ads/NativeBanner";
import { isAdPositionEnabled, adConfig } from "@/config/ads";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  const title = article.metaTitle || article.title;
  const description = article.metaDescription || article.shortAnswer;
  const keywords = article.keywords?.join(', ') || '';
  const url = `https://physicsexplained.org/${article.slug}`;

  return {
    title,
    description,
    keywords: keywords || undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  
  // 检查是否是文章
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const category = getCategoryBySlug(article.categoryId);
  const subcategory = getSubcategoryBySlug(article.categoryId, article.subcategoryId);
  const allArticles = await getAllArticles();
  
  // 计算阅读时间
  const readingTime = calculateReadingTime(article.content);
  
  // 提取标题用于目录
  const headings = extractHeadings(article.content);
  const hasTOC = headings.length >= 3; // 至少3个标题才显示目录
  
  // 提取正文中已链接的文章 slug（从 HTML 内容中提取）
  const linkedSlugs = new Set<string>();
  const linkRegex = /<a[^>]*href="\/([^"]+)"[^>]*>/g;
  let match;
  while ((match = linkRegex.exec(article.content)) !== null) {
    linkedSlugs.add(match[1]);
  }
  
  // 生成相关文章列表
  // 优先级：1. Frontmatter 中的 relatedTopics 2. 同分类文章
  const relatedArticles = allArticles
    .filter(
      (a) =>
        a.id !== article.id &&
        !linkedSlugs.has(a.slug) && // 排除已在正文中链接的文章
        (article.relatedTopics.includes(a.slug) ||
          a.categoryId === article.categoryId)
    )
    // 优先显示 Frontmatter 中指定的文章
    .sort((a, b) => {
      const aInRelatedTopics = article.relatedTopics.includes(a.slug);
      const bInRelatedTopics = article.relatedTopics.includes(b.slug);
      if (aInRelatedTopics && !bInRelatedTopics) return -1;
      if (!aInRelatedTopics && bInRelatedTopics) return 1;
      return 0;
    })
    .slice(0, 8); // 增加到8个，因为去除了重复

  // 结构化数据 - FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": {
      "@type": "Question",
      "name": article.title,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": article.shortAnswer
      }
    }
  };

  // 结构化数据 - Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.metaDescription || article.shortAnswer,
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt,
    "author": {
      "@type": "Organization",
      "name": "PhysicsExplained.org"
    },
    "publisher": {
      "@type": "Organization",
      "name": "PhysicsExplained.org",
      "url": "https://physicsexplained.org"
    }
  };

  return (
    <>
      <SocialBar />
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb and Metadata - Centered */}
        <div className="max-w-4xl mx-auto">
          <nav className="text-sm text-text-secondary mb-4">
            <Link href="/" className="hover:text-accent">Home</Link>
            {category && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/categories/${category.slug}`} className="hover:text-accent">
                  {category.name}
                </Link>
              </>
            )}
            {subcategory && (
              <>
                <span className="mx-2">/</span>
                <Link
                  href={`/categories/${category?.slug}/${subcategory.slug}`}
                  className="hover:text-accent"
                >
                  {subcategory.name}
                </Link>
              </>
            )}
            <span className="mx-2">/</span>
            <span>{article.title}</span>
          </nav>

          {/* Article Metadata */}
          <ArticleMetadata
            publishedAt={article.publishedAt}
            updatedAt={article.updatedAt}
            categoryId={article.categoryId}
            subcategoryId={article.subcategoryId}
            categoryName={category?.name}
            subcategoryName={subcategory?.name}
            readingTime={readingTime}
          />

          {/* Mobile Table of Contents - Top Collapsible Menu (Mobile/Tablet Only) */}
          {hasTOC && <MobileTableOfContents headings={headings} />}
        </div>

        {/* Article Content with TOC - New Layout */}
        <ArticleContentWithTOC 
          headings={headings} 
          hasTOC={hasTOC} 
          content={article.content} 
        />

      {/* 广告位置：文章正文下方，Related Topics上方 */}
      {isAdPositionEnabled('articleAfterRelated') && (
        <NativeBanner
          containerId={adConfig.nativeBanner.containerId}
          scriptSrc={adConfig.nativeBanner.scriptSrc}
          maxWidth="max-w-4xl"
        />
      )}

      {/* Related Topics - Card Layout */}
      {relatedArticles.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-primary">Related Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedArticles.map((related) => (
              <Link
                key={related.id}
                href={`/${related.slug}`}
                className="block p-4 border border-border rounded-lg hover:border-accent hover:shadow-md transition-all duration-200 group bg-surface/50 hover:bg-surface"
              >
                <h3 className="text-lg font-semibold text-primary group-hover:text-accent mb-2 transition-colors line-clamp-2">
                  {related.title}
                </h3>
                {related.shortAnswer && (
                  <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed">
                    {related.shortAnswer.length > 80 
                      ? related.shortAnswer.substring(0, 80) + '...'
                      : related.shortAnswer}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Support Section */}
      <SupportSection />

      {/* Project Promotion */}
      <ProjectPromotion />
      </div>
    </>
  );
}


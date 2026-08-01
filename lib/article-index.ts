import type { Article } from './types';

let articleIndex: Map<string, Article> | null = null;
let titleToSlugMap: Map<string, string> | null = null;

/**
 * 构建文章索引
 * @param articles 所有文章数组
 */
export async function buildArticleIndex(articles: Article[]): Promise<void> {
  articleIndex = new Map();
  titleToSlugMap = new Map();
  
  articles.forEach(article => {
    articleIndex!.set(article.slug, article);
    // 建立标题到 slug 的映射（大小写不敏感）
    const normalizedTitle = article.title.toLowerCase().trim();
    titleToSlugMap!.set(normalizedTitle, article.slug);
  });
}

/**
 * 根据标题查找文章
 * @param title 文章标题（大小写不敏感）
 * @returns 找到的文章，如果不存在则返回 null
 */
export function getArticleByTitle(title: string): Article | null {
  if (!titleToSlugMap || !articleIndex) {
    return null;
  }
  
  const normalizedTitle = title.toLowerCase().trim();
  const slug = titleToSlugMap.get(normalizedTitle);
  
  if (!slug) {
    return null;
  }
  
  return articleIndex.get(slug) || null;
}

/**
 * 根据 slug 获取文章
 * @param slug 文章 slug
 * @returns 找到的文章，如果不存在则返回 null
 */
export function getArticleBySlug(slug: string): Article | null {
  if (!articleIndex) {
    return null;
  }
  
  return articleIndex.get(slug) || null;
}

/**
 * 获取所有文章的 slug 列表
 * @returns slug 数组
 */
export function getAllArticleSlugs(): string[] {
  if (!articleIndex) {
    return [];
  }
  
  return Array.from(articleIndex.keys());
}

/**
 * 清除索引（用于测试或重新构建）
 */
export function clearIndex(): void {
  articleIndex = null;
  titleToSlugMap = null;
}


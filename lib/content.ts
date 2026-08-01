import fs from "fs";
import path from "path";
import { cache } from "react";
import { parseMarkdownFile, markdownToHtml, getAllMarkdownFiles } from "./markdown";
import type { Category, Subcategory, Article } from "./types";

const contentDirectory = path.join(process.cwd(), "content");

// 模块级缓存（构建时全局共享）
let articlesCache: Article[] | null = null;
let articlesCachePromise: Promise<Article[]> | null = null;

/**
 * 获取所有主分类
 */
export function getAllCategories(): Category[] {
  const categoriesDir = path.join(contentDirectory, "categories");
  
  if (!fs.existsSync(categoriesDir)) {
    return [];
  }
  
  const files = fs.readdirSync(categoriesDir);
  
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const filePath = path.join(categoriesDir, file);
      const { frontmatter } = parseMarkdownFile(filePath);
      return {
        id: frontmatter.id || path.basename(file, ".md"),
        name: frontmatter.name || "",
        slug: frontmatter.slug || path.basename(file, ".md"),
        description: frontmatter.description || "",
      } as Category;
    });
}

/**
 * 根据 slug 获取主分类
 */
export function getCategoryBySlug(slug: string): Category | null {
  const categories = getAllCategories();
  return categories.find((cat) => cat.slug === slug) || null;
}

/**
 * 获取某个主分类下的所有子分类
 */
export function getSubcategoriesByCategory(categorySlug: string): Subcategory[] {
  const subcategoriesDir = path.join(contentDirectory, "subcategories", categorySlug);
  
  if (!fs.existsSync(subcategoriesDir)) {
    return [];
  }
  
  const files = fs.readdirSync(subcategoriesDir);
  
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const filePath = path.join(subcategoriesDir, file);
      const { frontmatter } = parseMarkdownFile(filePath);
      return {
        id: frontmatter.id || path.basename(file, ".md"),
        categoryId: categorySlug,
        name: frontmatter.name || "",
        slug: frontmatter.slug || path.basename(file, ".md"),
        description: frontmatter.description || "",
      } as Subcategory;
    });
}

/**
 * 根据 slug 获取子分类
 */
export function getSubcategoryBySlug(
  categorySlug: string,
  subcategorySlug: string
): Subcategory | null {
  const subcategories = getSubcategoriesByCategory(categorySlug);
  return subcategories.find((sub) => sub.slug === subcategorySlug) || null;
}

/**
 * 获取所有文章（带缓存）
 * 
 * 使用双重缓存策略：
 * 1. React cache() - 在同一个请求/构建周期内自动去重
 * 2. 模块级缓存 - 跨请求共享（构建时）
 * 
 * 采用两遍处理策略：
 * 1. 第一遍：收集所有文章的基本信息（用于构建索引）
 * 2. 第二遍：并行处理每个文章的内容（提高性能）
 */
export const getAllArticles = cache(async (): Promise<Article[]> => {
  // 如果已有缓存，直接返回
  if (articlesCache) {
    return articlesCache;
  }
  
  // 如果正在处理，等待现有 Promise
  if (articlesCachePromise) {
    return articlesCachePromise;
  }
  
  // 创建新的处理 Promise
  articlesCachePromise = (async () => {
    const topicsDir = path.join(contentDirectory, "topics");
    
    if (!fs.existsSync(topicsDir)) {
      return [];
    }
    
    const files = getAllMarkdownFiles(topicsDir);
    
    const articles: Article[] = [];
    
    // 第一遍：收集基本信息
    for (const filePath of files) {
      const { frontmatter } = parseMarkdownFile(filePath);
      articles.push({
        id: frontmatter.id || path.basename(filePath, ".md"),
        title: frontmatter.title || "",
        slug: frontmatter.slug || path.basename(filePath, ".md"),
        shortAnswer: frontmatter.shortAnswer || "",
        content: "", // 暂时为空，第二遍处理
        categoryId: frontmatter.category || "",
        subcategoryId: frontmatter.subcategory || "",
        publishedAt: frontmatter.publishedAt || "",
        updatedAt: frontmatter.updatedAt || "",
        relatedTopics: frontmatter.relatedTopics || [],
        metaTitle: frontmatter.metaTitle,
        metaDescription: frontmatter.metaDescription,
        keywords: frontmatter.keywords || [],
      } as Article);
    }
    
    // 第二遍：并行处理内容（提高性能）
    await Promise.all(
      files.map(async (filePath, i) => {
        const { content } = parseMarkdownFile(filePath);
        articles[i].content = await markdownToHtml(content);
      })
    );
    
    articlesCache = articles;
    return articles;
  })();
  
  return articlesCachePromise;
});

/**
 * 根据 slug 获取文章
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const articles = await getAllArticles();
  return articles.find((article) => article.slug === slug) || null;
}

/**
 * 根据分类获取文章
 */
export async function getArticlesByCategory(categorySlug: string): Promise<Article[]> {
  const articles = await getAllArticles();
  return articles.filter((article) => article.categoryId === categorySlug);
}

/**
 * 根据子分类获取文章
 */
export async function getArticlesBySubcategory(
  categorySlug: string,
  subcategorySlug: string
): Promise<Article[]> {
  const articles = await getAllArticles();
  return articles.filter(
    (article) =>
      article.categoryId === categorySlug &&
      article.subcategoryId === subcategorySlug
  );
}


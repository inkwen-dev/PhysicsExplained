// 主分类
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

// 子分类
export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
}

// 文章（TypeScript 接口使用 Article）
export interface Article {
  id: string;
  title: string;
  slug: string;
  shortAnswer: string;
  content: string; // HTML 内容
  categoryId: string;
  subcategoryId: string;
  publishedAt: string;
  updatedAt: string;
  relatedTopics: string[];
  // SEO字段
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}


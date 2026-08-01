# SEO优化方案

> **目的**：SEO优化方案，包括TDK、Sitemap、结构化数据等  
> **适用范围**：所有文章内容

---

## 一、TDK优化（Title, Description, Keywords）

### 1.1 Frontmatter SEO字段

**需要在Frontmatter中添加的SEO字段**：

```yaml
---
title: "Why do objects fall?"                    # H1标题（包含主关键词）
slug: "why-do-objects-fall"                       # URL slug
metaTitle: "Why Do Objects Fall? | PhysicsExplained.org"  # SEO标题（60字符内）
metaDescription: "Discover why objects fall: gravity, acceleration, and motion. Learn the physics behind falling objects and how gravity works."  # Meta描述（150-160字符）
keywords:                                       # 关键词数组（3-8个）
  - "why do objects fall"
  - "gravity"
  - "falling objects"
  - "physics of falling"
  - "why objects fall down"
---
```

### 1.2 TDK规范

**Title（metaTitle）**：
- 格式：`[主关键词] | PhysicsExplained.org`
- 长度：50-60字符（含空格）
- 必须包含主关键词
- 放在标题最前面

**Description（metaDescription）**：
- 长度：150-160字符（含空格）
- 包含主关键词和1-2个长尾关键词
- 吸引点击，说明文章价值
- 自然流畅，不要关键词堆砌

**Keywords**：
- 3-8个关键词
- 主关键词 + 长尾关键词 + 相关术语
- 基于用户搜索意图

### 1.3 TDK示例

**why-do-objects-fall.md**：
```yaml
metaTitle: "Why Do Objects Fall? Gravity Explained | PhysicsExplained.org"
metaDescription: "Why do objects fall? Discover the physics behind falling objects: gravity, acceleration, and motion. Learn how gravity works and why all objects fall at the same rate."
keywords:
  - "why do objects fall"
  - "gravity"
  - "falling objects"
  - "physics of falling"
  - "why objects fall down"
```

**what-is-velocity.md**：
```yaml
metaTitle: "What Is Velocity? Speed vs Velocity Explained | PhysicsExplained.org"
metaDescription: "What is velocity? Learn the difference between speed and velocity, how velocity is measured, and see real-world examples of velocity in physics."
keywords:
  - "what is velocity"
  - "velocity"
  - "speed vs velocity"
  - "velocity definition"
  - "velocity physics"
```

**how-does-gravity-work.md**：
```yaml
metaTitle: "How Does Gravity Work? Gravity Explained Simply | PhysicsExplained.org"
metaDescription: "How does gravity work? Discover the physics behind gravity: universal attraction, mass, and distance. Learn how gravity affects objects and why planets orbit."
keywords:
  - "how does gravity work"
  - "gravity"
  - "how gravity works"
  - "gravitational force"
  - "gravity physics"
```

---

## 二、Sitemap配置

### 2.1 XML Sitemap结构

**sitemap.xml**（自动生成）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 首页 -->
  <url>
    <loc>https://physicsexplained.org/</loc>
    <lastmod>2025-12-25</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- 分类页 -->
  <url>
    <loc>https://physicsexplained.org/categories</loc>
    <lastmod>2025-12-25</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- 文章页 -->
  <url>
    <loc>https://physicsexplained.org/why-do-objects-fall</loc>
    <lastmod>2025-10-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- 其他文章... -->
</urlset>
```

### 2.2 实现方式

**Next.js自动生成Sitemap**：

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/content'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles()
  
  const articleUrls = articles.map((article) => ({
    url: `https://physicsexplained.org/${article.slug}`,
    lastModified: article.updatedAt || article.publishedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }))

  return [
    {
      url: 'https://physicsexplained.org',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://physicsexplained.org/categories',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...articleUrls,
  ]
}
```

### 2.3 robots.txt

**robots.txt**：

```
User-agent: *
Allow: /

Sitemap: https://physicsexplained.org/sitemap.xml
```

---

## 三、结构化数据（Schema.org）

### 3.1 FAQ Schema（问答类文章）

**每篇文章添加FAQ Schema**：

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": {
    "@type": "Question",
    "name": "Why do objects fall?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Objects fall due to gravity, which pulls all objects with mass toward each other."
    }
  }
}
```

### 3.2 Article Schema

**文章结构化数据**：

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Why do objects fall?",
  "description": "Discover why objects fall: gravity, acceleration, and motion.",
  "datePublished": "2025-10-15",
  "dateModified": "2025-10-15",
  "author": {
    "@type": "Organization",
    "name": "PhysicsExplained.org"
  },
  "publisher": {
    "@type": "Organization",
    "name": "PhysicsExplained.org"
  }
}
```

### 3.3 实现方式

**在文章页面添加JSON-LD**：

```typescript
// app/[slug]/page.tsx
export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug)
  
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
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* 文章内容 */}
    </>
  )
}
```

---

## 四、技术SEO

### 4.1 Meta标签

**每篇文章页面必须包含**：

```html
<title>{metaTitle}</title>
<meta name="description" content={metaDescription} />
<meta name="keywords" content={keywords.join(', ')} />
<meta property="og:title" content={metaTitle} />
<meta property="og:description" content={metaDescription} />
<meta property="og:type" content="article" />
<meta property="og:url" content={`https://physicsexplained.org/${slug}`} />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content={metaTitle} />
<meta name="twitter:description" content={metaDescription} />
```

### 4.2 URL优化

**URL规范**：
- 使用连字符（`-`）分隔单词
- 保持简短（50字符内）
- 包含主关键词
- 小写字母

**示例**：
- ✅ `/why-do-objects-fall`
- ✅ `/what-is-velocity`
- ❌ `/why-do-objects-fall-article`（不必要）
- ❌ `/why_do_objects_fall`（下划线不推荐）

### 4.3 内部链接

**要求**：
- 每篇文章至少3-5个内部链接
- 使用`relatedTopics`字段
- 在正文中自然链接相关概念
- 链接到相关分类和子分类页

---

## 五、内容SEO优化

### 5.1 关键词密度

**要求**：
- 主关键词：1-2%（自然分布）
- 长尾关键词：0.5-1%
- 避免关键词堆砌
- 使用同义词和相关术语

### 5.2 标题优化

**H1-H3标题要求**：
- H1：文章标题（包含主关键词）
- H2：主要章节（包含相关关键词）
- H3：子章节（自然使用关键词）

**示例**：
```markdown
# Why do objects fall?                    # H1: 主关键词
## Detailed Explanation                 # H2: 通用
### Scientific Principles               # H3: 通用
### Real Examples                        # H3: 通用
## Practical Applications                # H2: 通用
### How It Works in Daily Life           # H3: 通用
```

### 5.3 图片优化（如有）

**Alt标签要求**：
- 描述图片内容
- 包含相关关键词（自然）
- 长度：50-125字符

---

## 六、执行步骤

### 6.1 立即执行

1. **添加Frontmatter SEO字段**
   - 为所有文章添加`metaTitle`、`metaDescription`、`keywords`
   - 参考上面的TDK示例

2. **实现Sitemap**
   - 已创建`app/sitemap.ts`
   - 自动生成XML Sitemap
   - 已创建`robots.txt`

3. **添加结构化数据**
   - 已实现FAQ Schema
   - 已实现Article Schema
   - 在文章页面添加JSON-LD

### 6.2 技术实现

**更新Frontmatter类型**：

```typescript
// lib/types.ts
export interface Article {
  // ... 现有字段
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
}
```

**更新文章页面**：

```typescript
// app/[slug]/page.tsx
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug)
  
  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.shortAnswer,
    keywords: article.keywords?.join(', '),
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.shortAnswer,
      type: 'article',
      url: `https://physicsexplained.org/${article.slug}`,
    },
  }
}
```

---

## 七、SEO检查清单

### 7.1 每篇文章检查

- [ ] Frontmatter包含`metaTitle`、`metaDescription`、`keywords`
- [ ] Title长度50-60字符
- [ ] Description长度150-160字符
- [ ] Keywords数量3-8个
- [ ] H1包含主关键词
- [ ] 主关键词在前100词中出现
- [ ] 至少3-5个内部链接
- [ ] 结构化数据（FAQ Schema）已添加

### 7.2 网站级别检查

- [ ] XML Sitemap已生成
- [ ] robots.txt已配置
- [ ] 所有页面有唯一Title和Description
- [ ] URL结构优化（简短、关键词）
- [ ] 内部链接结构合理
- [ ] 页面加载速度优化
- [ ] 移动端友好

---

**最后更新**：2024年  
**状态**：当前使用


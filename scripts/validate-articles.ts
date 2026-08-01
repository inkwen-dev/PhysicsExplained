/**
 * 文章质量验证脚本
 * 
 * 验证内容：
 * 1. Frontmatter完整性
 * 2. relatedTopics的slug有效性
 * 3. SEO字段完整性
 * 4. 日期格式有效性
 * 
 * 使用方法：npx tsx scripts/validate-articles.ts
 */

import { getAllArticles } from '../lib/content';
import fs from 'fs';
import path from 'path';

interface ValidationResult {
  total: number;
  passed: number;
  failed: number;
  errors: Array<{
    slug: string;
    title: string;
    issues: string[];
  }>;
}

async function validateArticles() {
  console.log('🔍 开始验证文章质量...\n');

  const articles = await getAllArticles();
  const result: ValidationResult = {
    total: articles.length,
    passed: 0,
    failed: 0,
    errors: [],
  };

  // 创建slug到文章的映射
  const slugMap = new Map<string, boolean>();
  articles.forEach(article => {
    slugMap.set(article.slug, true);
  });

  console.log(`📚 总共找到 ${articles.length} 篇文章\n`);

  // 验证每篇文章
  for (const article of articles) {
    const issues: string[] = [];

    // 1. 检查必需字段
    if (!article.title) issues.push('缺少 title');
    if (!article.slug) issues.push('缺少 slug');
    if (!article.categoryId) issues.push('缺少 category');
    if (!article.subcategoryId) issues.push('缺少 subcategory');
    if (!article.shortAnswer) issues.push('缺少 shortAnswer');
    if (!article.publishedAt) issues.push('缺少 publishedAt');

    // 2. 检查SEO字段
    if (!article.metaTitle) issues.push('缺少 metaTitle');
    if (!article.metaDescription) issues.push('缺少 metaDescription');
    if (!article.keywords || article.keywords.length === 0) {
      issues.push('缺少 keywords 或 keywords 为空');
    }

    // 3. 检查metaDescription长度（建议150-160字符）
    if (article.metaDescription) {
      const length = article.metaDescription.length;
      if (length < 120) {
        issues.push(`metaDescription 太短 (${length}字符，建议120-160)`);
      } else if (length > 165) {
        issues.push(`metaDescription 太长 (${length}字符，建议120-160)`);
      }
    }

    // 4. 检查日期格式
    if (article.publishedAt) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(article.publishedAt)) {
        issues.push(`publishedAt 格式错误: ${article.publishedAt} (应为 YYYY-MM-DD)`);
      } else {
        const date = new Date(article.publishedAt);
        if (isNaN(date.getTime())) {
          issues.push(`publishedAt 无效日期: ${article.publishedAt}`);
        }
      }
    }

    if (article.updatedAt) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(article.updatedAt)) {
        issues.push(`updatedAt 格式错误: ${article.updatedAt} (应为 YYYY-MM-DD)`);
      } else {
        const date = new Date(article.updatedAt);
        if (isNaN(date.getTime())) {
          issues.push(`updatedAt 无效日期: ${article.updatedAt}`);
        }
      }
    }

    // 5. 验证relatedTopics的slug有效性
    if (article.relatedTopics && article.relatedTopics.length > 0) {
      const invalidSlugs: string[] = [];
      article.relatedTopics.forEach(slug => {
        if (!slugMap.has(slug)) {
          invalidSlugs.push(slug);
        }
      });
      if (invalidSlugs.length > 0) {
        issues.push(`relatedTopics 包含无效slug: ${invalidSlugs.join(', ')}`);
      }
      if (article.relatedTopics.includes(article.slug)) {
        issues.push('relatedTopics 包含自己的slug（应排除）');
      }
    }

    // 6. 检查内容是否为空
    if (!article.content || article.content.trim().length === 0) {
      issues.push('文章内容为空');
    }

    // 记录结果
    if (issues.length > 0) {
      result.failed++;
      result.errors.push({
        slug: article.slug,
        title: article.title,
        issues,
      });
    } else {
      result.passed++;
    }
  }

  // 输出结果
  console.log('='.repeat(60));
  console.log('📊 验证结果');
  console.log('='.repeat(60));
  console.log(`总计: ${result.total} 篇文章`);
  console.log(`✅ 通过: ${result.passed} 篇`);
  console.log(`❌ 失败: ${result.failed} 篇`);
  console.log('');

  if (result.errors.length > 0) {
    console.log('='.repeat(60));
    console.log('❌ 发现的问题:');
    console.log('='.repeat(60));
    
    result.errors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.title} (${error.slug})`);
      error.issues.forEach(issue => {
        console.log(`   - ${issue}`);
      });
    });
    
    console.log('\n' + '='.repeat(60));
    process.exit(1);
  } else {
    console.log('✅ 所有文章验证通过！');
    console.log('='.repeat(60));
    process.exit(0);
  }
}

// 运行验证
validateArticles().catch(error => {
  console.error('❌ 验证过程出错:', error);
  process.exit(1);
});


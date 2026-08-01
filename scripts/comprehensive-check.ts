/**
 * 全面检查脚本 - 检查所有200篇文章
 * 
 * 检查内容：
 * 1. Frontmatter完整性（已由validate-articles.ts检查）
 * 2. Short Answer与frontmatter一致性
 * 3. 文章结构完整性（必需部分）
 * 4. metaTitle格式（是否包含PhysicsExplained.org）
 * 5. 发布日期范围
 * 6. 内部链接格式
 */

import { getAllArticles } from '../lib/content';
import fs from 'fs';
import path from 'path';

interface Issue {
  slug: string;
  title: string;
  category: string;
  issues: string[];
}

async function comprehensiveCheck() {
  console.log('🔍 开始全面检查所有文章...\n');

  const articles = await getAllArticles();
  const allIssues: Issue[] = [];

  console.log(`📚 总共找到 ${articles.length} 篇文章\n`);

  for (const article of articles) {
    const filePath = path.join(
      'content',
      'topics',
      article.categoryId,
      article.subcategoryId,
      `${article.slug}.md`
    );

    if (!fs.existsSync(filePath)) {
      allIssues.push({
        slug: article.slug,
        title: article.title,
        category: article.categoryId,
        issues: ['文件不存在'],
      });
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const issues: string[] = [];

    // 提取frontmatter和正文
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    if (!frontmatterMatch) {
      issues.push('缺少frontmatter');
      allIssues.push({
        slug: article.slug,
        title: article.title,
        category: article.categoryId,
        issues,
      });
      continue;
    }

    const frontmatter = frontmatterMatch[1];
    const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');

    // 1. 检查Short Answer一致性
    const shortAnswerInFrontmatter = frontmatter.match(/^shortAnswer:\s*['"](.*?)['"]/m)?.[1] || '';
    const shortAnswerMatch = body.match(/^## Short Answer\s*\n\n([\s\S]*?)(?=\n##|$)/);
    const shortAnswerInBody = shortAnswerMatch?.[1]?.trim() || '';

    if (shortAnswerInFrontmatter && shortAnswerInBody) {
      // 移除可能的Markdown格式标记进行比较
      const cleanFrontmatter = shortAnswerInFrontmatter.replace(/\*\*/g, '').trim();
      const cleanBody = shortAnswerInBody.replace(/\*\*/g, '').trim();
      
      if (cleanFrontmatter !== cleanBody) {
        issues.push(`Short Answer不一致: frontmatter="${cleanFrontmatter.substring(0, 50)}..." vs body="${cleanBody.substring(0, 50)}..."`);
      }
    } else if (shortAnswerInFrontmatter && !shortAnswerInBody) {
      issues.push('frontmatter中有shortAnswer但正文中缺少## Short Answer部分');
    } else if (!shortAnswerInFrontmatter && shortAnswerInBody) {
      issues.push('正文中有## Short Answer但frontmatter中缺少shortAnswer');
    }

    // 2. 检查文章结构完整性
    const hasBackground = body.match(/### Background/);
    const hasPrinciples = body.match(/### Scientific Principles/);
    const hasExamples = body.match(/### Real Examples/);
    const hasDailyLife = body.match(/### How It Works in Daily Life/);
    const hasExperiments = body.match(/### Scientific Experiments/);

    const missingSections: string[] = [];
    if (!hasBackground) missingSections.push('Background');
    if (!hasPrinciples) missingSections.push('Scientific Principles');
    if (!hasExamples) missingSections.push('Real Examples');
    if (!hasDailyLife) missingSections.push('How It Works in Daily Life');
    if (!hasExperiments) missingSections.push('Scientific Experiments');

    if (missingSections.length > 0) {
      issues.push(`缺少必需部分: ${missingSections.join(', ')}`);
    }

    // 3. 检查metaTitle格式
    const metaTitle = frontmatter.match(/^metaTitle:\s*['"](.*?)['"]/m)?.[1] || '';
    if (metaTitle && !metaTitle.includes('PhysicsExplained.org')) {
      issues.push(`metaTitle缺少网站名: "${metaTitle}"`);
    }

    // 4. 检查发布日期范围
    const publishedAt = frontmatter.match(/^publishedAt:\s*['"](\d{4}-\d{2}-\d{2})['"]/m)?.[1];
    if (publishedAt) {
      const date = new Date(publishedAt);
      if (isNaN(date.getTime())) {
        issues.push(`publishedAt无效日期: ${publishedAt}`);
      } else {
        const year = date.getFullYear();
        if (year < 2024 || year > 2026) {
          issues.push(`publishedAt日期超出合理范围: ${publishedAt} (应在2024-2026年)`);
        }
      }
    }

    // 5. 检查H1标题
    const h1Match = body.match(/^# (.+)$/m);
    if (!h1Match) {
      issues.push('缺少H1标题（# 标题）');
    } else {
      const h1Title = h1Match[1].trim();
      if (h1Title !== article.title) {
        issues.push(`H1标题与frontmatter title不一致: H1="${h1Title}" vs title="${article.title}"`);
      }
    }

    // 6. 检查内部链接格式（检查是否有无效的Markdown链接）
    const linkMatches = body.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
    for (const match of linkMatches) {
      const linkText = match[1];
      const linkUrl = match[2];
      
      // 检查是否是内部链接（相对路径）
      if (linkUrl.startsWith('/') || (!linkUrl.startsWith('http') && !linkUrl.startsWith('mailto:'))) {
        // 内部链接应该是 /slug 格式
        if (!linkUrl.startsWith('/')) {
          issues.push(`内部链接格式可能有问题: [${linkText}](${linkUrl})`);
        }
      }
    }

    if (issues.length > 0) {
      allIssues.push({
        slug: article.slug,
        title: article.title,
        category: article.categoryId,
        issues,
      });
    }
  }

  // 输出结果
  console.log('='.repeat(60));
  console.log('📊 全面检查结果');
  console.log('='.repeat(60));
  console.log(`总计: ${articles.length} 篇文章`);
  console.log(`✅ 通过: ${articles.length - allIssues.length} 篇`);
  console.log(`❌ 发现问题: ${allIssues.length} 篇`);
  console.log('');

  if (allIssues.length > 0) {
    console.log('='.repeat(60));
    console.log('❌ 发现的问题:');
    console.log('='.repeat(60));
    
    allIssues.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.title} (${item.slug})`);
      console.log(`   分类: ${item.category}`);
      item.issues.forEach(issue => {
        console.log(`   - ${issue}`);
      });
    });
    
    console.log('\n' + '='.repeat(60));
    process.exit(1);
  } else {
    console.log('✅ 所有文章检查通过！');
    console.log('='.repeat(60));
    process.exit(0);
  }
}

// 运行检查
comprehensiveCheck().catch(error => {
  console.error('❌ 检查过程出错:', error);
  process.exit(1);
});


/**
 * 简单测试脚本：验证单篇文章的 Related Topics 链接
 * 使用 Node.js ESM 模块，无需额外依赖
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 动态导入（Next.js 环境）
async function test() {
  try {
    // 使用动态导入来加载 TypeScript 模块
    const { getAllArticles } = await import('../lib/content.ts');
    
    console.log('🧪 开始测试 Related Topics 链接功能...\n');
    
    const articles = await getAllArticles();
    console.log(`📚 总共找到 ${articles.length} 篇文章\n`);
    
    const testArticle = articles.find(a => a.slug === 'why-do-objects-fall');
    
    if (!testArticle) {
      console.error('❌ 找不到测试文章');
      process.exit(1);
    }
    
    console.log(`📄 测试文章: ${testArticle.title}`);
    console.log(`🔗 Slug: ${testArticle.slug}\n`);
    
    // 检查 HTML 内容
    const html = testArticle.content;
    const relatedTopicsMatch = html.match(/<h2[^>]*>Related Topics<\/h2>\s*<ul>([\s\S]*?)<\/ul>/i);
    
    if (!relatedTopicsMatch) {
      console.error('❌ 找不到 Related Topics 部分');
      console.log('HTML 内容片段:', html.substring(html.indexOf('Related Topics') - 50, html.indexOf('Related Topics') + 500));
      process.exit(1);
    }
    
    const listContent = relatedTopicsMatch[1];
    const links = listContent.match(/<a[^>]*href="([^"]+)"[^>]*class="article-link"[^>]*>([^<]+)<\/a>/g);
    
    if (!links || links.length === 0) {
      console.error('❌ 没有找到任何链接！');
      console.log('列表内容:', listContent);
      process.exit(1);
    }
    
    console.log(`✅ 找到 ${links.length} 个链接:\n`);
    links.forEach((link, i) => {
      const href = link.match(/href="([^"]+)"/)?.[1];
      const text = link.match(/>([^<]+)</)?.[1];
      console.log(`${i + 1}. ${text} → ${href}`);
    });
    
    console.log('\n🎉 测试通过！');
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

test();


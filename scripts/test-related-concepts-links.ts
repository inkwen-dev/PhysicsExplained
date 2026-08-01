/**
 * 测试脚本：验证 Related Topics 链接功能
 * 
 * 使用方法：
 * npx tsx scripts/test-related-concepts-links.ts
 */

import { getAllArticles } from '../lib/content';
import { markdownToHtml } from '../lib/markdown';

async function testRelatedTopicsLinks() {
  console.log('🧪 开始测试 Related Topics 链接功能...\n');

  // 获取所有文章
  const articles = await getAllArticles();
  console.log(`📚 总共找到 ${articles.length} 篇文章\n`);

  // 找到测试文章（使用第一个可用文章）
  const testArticle = articles.length > 0 ? articles[0] : null;
  
  if (!testArticle) {
    console.error('❌ 找不到测试文章');
    process.exit(1);
  }

  console.log(`📄 测试文章: ${testArticle.title}`);
  console.log(`🔗 Slug: ${testArticle.slug}\n`);

  // 检查 HTML 内容中是否包含链接
  const html = testArticle.content;
  
  // 检查 Related Topics 部分
  const relatedTopicsMatch = html.match(/<h2[^>]*>Related Topics<\/h2>\s*<ul>([\s\S]*?)<\/ul>/i);
  
  if (!relatedTopicsMatch) {
    console.log('ℹ️  文章中没有 Related Topics 部分（这是正常的，如果文章还没有设置 relatedTopics）');
    process.exit(0);
  }

  const listContent = relatedTopicsMatch[1];
  console.log('📋 Related Topics HTML:');
  console.log(listContent);
  console.log('');

  // 检查链接
  const links = listContent.match(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g);
  
  if (!links || links.length === 0) {
    console.log('ℹ️  Related Topics 部分没有链接（这是正常的，如果文章还没有设置 relatedTopics）');
    process.exit(0);
  }

  console.log(`✅ 找到 ${links.length} 个链接:\n`);
  
  links.forEach((link, index) => {
    const hrefMatch = link.match(/href="([^"]+)"/);
    const textMatch = link.match(/>([^<]+)</);
    const href = hrefMatch ? hrefMatch[1] : '';
    const text = textMatch ? textMatch[1] : '';
    
    console.log(`${index + 1}. ${text}`);
    console.log(`   → ${href}`);
    
    // 验证链接是否指向存在的文章
    const targetArticle = articles.find(a => a.slug === href.replace('/', ''));
    if (targetArticle) {
      console.log(`   ✅ 文章存在: "${targetArticle.title}"`);
    } else {
      console.log(`   ❌ 文章不存在！`);
    }
    console.log('');
  });

  console.log('🎉 测试完成！');
  process.exit(0);
}

// 运行测试
testRelatedTopicsLinks().catch(error => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});


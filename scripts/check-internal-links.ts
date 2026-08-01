import { getAllArticles } from '../lib/content';

async function checkInternalLinks() {
  console.log('🔍 检查内部链接有效性...\n');

  const articles = await getAllArticles();
  const slugs = new Set(articles.map(a => a.slug));
  
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const brokenLinks: { article: string; link: string }[] = [];

  for (const article of articles) {
    const matches = [...article.content.matchAll(linkPattern)];
    for (const match of matches) {
      const linkSlug = match[2];
      if (!slugs.has(linkSlug)) {
        brokenLinks.push({ article: article.slug, link: linkSlug });
      }
    }
  }

  if (brokenLinks.length > 0) {
    console.log('❌ 发现无效链接:');
    brokenLinks.forEach(b => console.log(`  ${b.article} -> ${b.link}`));
    process.exit(1);
  } else {
    console.log(`✅ 所有内部链接有效 (共检查 ${articles.length} 篇文章)`);
    process.exit(0);
  }
}

checkInternalLinks();


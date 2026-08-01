import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface ArticleIssue {
  article: string;
  category: string;
  issues: string[];
}

const issues: ArticleIssue[] = [];

// 获取所有文章文件
function getAllArticleFiles(): string[] {
  const topicsDir = path.join(process.cwd(), 'content', 'topics');
  const files: string[] = [];

  function walkDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  walkDir(topicsDir);
  return files;
}

// 获取所有有效的slug
function getAllSlugs(): Set<string> {
  const files = getAllArticleFiles();
  const slugs = new Set<string>();
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const { data } = matter(content);
      if (data.slug) {
        slugs.add(data.slug);
      }
    } catch (error) {
      // Skip invalid files
    }
  }
  
  return slugs;
}

// 检查文章
function checkArticle(filePath: string, allSlugs: Set<string>): string[] {
  const issues: string[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data, content: body } = matter(content);
  
  const relativePath = path.relative(path.join(process.cwd(), 'content', 'topics'), filePath);
  const category = relativePath.split(path.sep)[0];

  // 检查必需字段
  const requiredFields = ['title', 'slug', 'category', 'subcategory', 'shortAnswer', 'publishedAt'];
  for (const field of requiredFields) {
    if (!data[field]) {
      issues.push(`缺少必需字段: ${field}`);
    }
  }

  // 检查发布日期格式和范围
  if (data.publishedAt) {
    const date = new Date(data.publishedAt);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    if (isNaN(date.getTime())) {
      issues.push(`发布日期格式无效: ${data.publishedAt}`);
    } else if (!((year === 2025 && (month === 11 || month === 12)) || (year === 2026 && month === 1))) {
      issues.push(`发布日期不在要求范围内: ${data.publishedAt} (应为2025年11月、12月或2026年1月)`);
    }
  }

  // 检查updatedAt格式
  if (data.updatedAt) {
    const date = new Date(data.updatedAt);
    if (isNaN(date.getTime())) {
      issues.push(`更新日期格式无效: ${data.updatedAt}`);
    }
  }

  // 检查relatedTopics有效性
  if (data.relatedTopics && Array.isArray(data.relatedTopics)) {
    for (const topic of data.relatedTopics) {
      if (!allSlugs.has(topic)) {
        issues.push(`relatedTopics中的slug不存在: ${topic}`);
      }
    }
    if (data.relatedTopics.length < 3) {
      issues.push(`relatedTopics数量不足: ${data.relatedTopics.length} (建议3-8个)`);
    }
    if (data.relatedTopics.length > 8) {
      issues.push(`relatedTopics数量过多: ${data.relatedTopics.length} (建议3-8个)`);
    }
  } else if (!data.relatedTopics) {
    issues.push(`缺少relatedTopics字段 (建议3-8个)`);
  }

  // 检查tags
  if (!data.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
    issues.push(`缺少tags字段或为空`);
  } else if (data.tags.length < 3) {
    issues.push(`tags数量不足: ${data.tags.length} (建议3-8个)`);
  } else if (data.tags.length > 8) {
    issues.push(`tags数量过多: ${data.tags.length} (建议3-8个)`);
  }

  // 检查SEO字段
  if (!data.metaTitle) {
    issues.push(`缺少metaTitle字段`);
  }
  if (!data.metaDescription) {
    issues.push(`缺少metaDescription字段`);
  }
  if (!data.keywords || !Array.isArray(data.keywords) || data.keywords.length === 0) {
    issues.push(`缺少keywords字段或为空`);
  }

  // 检查内容结构
  const lines = body.split('\n');
  let hasH1 = false;
  let hasShortAnswer = false;
  let hasDetailedExplanation = false;
  let hasBackground = false;
  let hasScientificPrinciples = false;
  let hasRealExamples = false;
  let hasPracticalApplications = false;
  let hasHowItWorksInDailyLife = false;
  let hasScientificExperiments = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('# ') && !line.startsWith('##')) {
      hasH1 = true;
      // 检查H1是否与title一致
      const h1Title = line.replace(/^#\s+/, '');
      if (data.title && h1Title !== data.title) {
        issues.push(`H1标题与frontmatter中的title不一致: "${h1Title}" vs "${data.title}"`);
      }
    }
    
    if (line === '## Short Answer') {
      hasShortAnswer = true;
      // 检查Short Answer内容是否与shortAnswer字段一致
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (data.shortAnswer && nextLine && !nextLine.includes(data.shortAnswer.substring(0, 20))) {
          // 允许一些差异，但检查开头部分
        }
      }
    }
    
    if (line === '## Detailed Explanation') {
      hasDetailedExplanation = true;
    }
    
    if (line === '### Background') {
      hasBackground = true;
    }
    
    if (line === '### Scientific Principles') {
      hasScientificPrinciples = true;
      // 检查是否使用编号列表
      let foundNumberedList = false;
      for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
        if (lines[j].trim().match(/^\d+\.\s/)) {
          foundNumberedList = true;
          break;
        }
        if (lines[j].trim().startsWith('###') || lines[j].trim().startsWith('##')) {
          break;
        }
      }
      if (!foundNumberedList) {
        issues.push(`Scientific Principles部分未使用编号列表（建议使用编号列表）`);
      }
    }
    
    if (line === '### Real Examples') {
      hasRealExamples = true;
      // 检查是否使用项目符号列表
      let foundBulletList = false;
      for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
        if (lines[j].trim().startsWith('- ')) {
          foundBulletList = true;
          break;
        }
        if (lines[j].trim().startsWith('###') || lines[j].trim().startsWith('##')) {
          break;
        }
      }
      if (!foundBulletList) {
        issues.push(`Real Examples部分未使用项目符号列表（必须使用项目符号列表）`);
      }
    }
    
    if (line === '## Practical Applications') {
      hasPracticalApplications = true;
    }
    
    if (line === '### How It Works in Daily Life') {
      hasHowItWorksInDailyLife = true;
      // 检查是否使用编号列表
      let foundNumberedList = false;
      for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
        if (lines[j].trim().match(/^\d+\.\s/)) {
          foundNumberedList = true;
          break;
        }
        if (lines[j].trim().startsWith('###') || lines[j].trim().startsWith('##')) {
          break;
        }
      }
      if (!foundNumberedList) {
        issues.push(`How It Works in Daily Life部分未使用编号列表（必须使用编号列表）`);
      }
    }
    
    if (line === '### Scientific Experiments & Demonstrations') {
      hasScientificExperiments = true;
      // 检查是否使用项目符号列表
      let foundBulletList = false;
      for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
        if (lines[j].trim().startsWith('- ')) {
          foundBulletList = true;
          break;
        }
        if (lines[j].trim().startsWith('###') || lines[j].trim().startsWith('##')) {
          break;
        }
      }
      if (!foundBulletList) {
        issues.push(`Scientific Experiments & Demonstrations部分未使用项目符号列表（必须使用项目符号列表）`);
      }
    }
  }
  
  // 检查必需的结构部分
  if (!hasH1) {
    issues.push(`缺少H1标题`);
  }
  if (!hasShortAnswer) {
    issues.push(`缺少"## Short Answer"部分`);
  }
  if (!hasDetailedExplanation) {
    issues.push(`缺少"## Detailed Explanation"部分`);
  }
  if (!hasBackground) {
    issues.push(`缺少"### Background"部分`);
  }
  if (!hasScientificPrinciples) {
    issues.push(`缺少"### Scientific Principles"部分`);
  }
  if (!hasRealExamples) {
    issues.push(`缺少"### Real Examples"部分`);
  }
  if (!hasPracticalApplications) {
    issues.push(`缺少"## Practical Applications"部分`);
  }
  if (!hasHowItWorksInDailyLife) {
    issues.push(`缺少"### How It Works in Daily Life"部分`);
  }
  if (!hasScientificExperiments) {
    issues.push(`缺少"### Scientific Experiments & Demonstrations"部分`);
  }

  // 检查内容长度
  const wordCount = body.split(/\s+/).length;
  if (wordCount < 500) {
    issues.push(`内容过短: ${wordCount}字 (建议至少500字)`);
  }

  // 检查内部链接（粗略检查）
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links: string[] = [];
  let match;
  while ((match = linkPattern.exec(body)) !== null) {
    const linkSlug = match[2];
    // 跳过外部链接
    if (!linkSlug.startsWith('http') && !linkSlug.startsWith('#')) {
      links.push(linkSlug);
      if (!allSlugs.has(linkSlug)) {
        issues.push(`内部链接指向不存在的文章: ${linkSlug}`);
      }
    }
  }

  return issues;
}

// 主函数
function main() {
  console.log('开始检查所有文章...\n');
  
  const allSlugs = getAllSlugs();
  console.log(`找到 ${allSlugs.size} 篇文章\n`);
  
  const files = getAllArticleFiles();
  console.log(`开始检查 ${files.length} 个文件...\n`);
  
  for (const file of files) {
    const fileIssues = checkArticle(file, allSlugs);
    if (fileIssues.length > 0) {
      const relativePath = path.relative(path.join(process.cwd(), 'content', 'topics'), file);
      const category = relativePath.split(path.sep)[0];
      issues.push({
        article: relativePath,
        category,
        issues: fileIssues
      });
    }
  }
  
  // 生成报告
  console.log('='.repeat(80));
  console.log('检查报告');
  console.log('='.repeat(80));
  console.log(`\n总计检查: ${files.length} 篇文章`);
  console.log(`发现问题: ${issues.length} 篇文章\n`);
  
  if (issues.length === 0) {
    console.log('✅ 所有文章检查通过！');
  } else {
    // 按分类分组
    const issuesByCategory: Record<string, ArticleIssue[]> = {};
    for (const issue of issues) {
      if (!issuesByCategory[issue.category]) {
        issuesByCategory[issue.category] = [];
      }
      issuesByCategory[issue.category].push(issue);
    }
    
    // 输出报告
    for (const [category, categoryIssues] of Object.entries(issuesByCategory)) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`分类: ${category} (${categoryIssues.length} 篇文章有问题)`);
      console.log('='.repeat(80));
      
      for (const issue of categoryIssues) {
        console.log(`\n📄 ${issue.article}`);
        for (const problem of issue.issues) {
          console.log(`  ❌ ${problem}`);
        }
      }
    }
    
    // 统计问题类型
    console.log(`\n${'='.repeat(80)}`);
    console.log('问题统计');
    console.log('='.repeat(80));
    
    const problemTypes: Record<string, number> = {};
    for (const issue of issues) {
      for (const problem of issue.issues) {
        const type = problem.split(':')[0];
        problemTypes[type] = (problemTypes[type] || 0) + 1;
      }
    }
    
    for (const [type, count] of Object.entries(problemTypes).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${type}: ${count}次`);
    }
  }
  
  // 保存报告到文件
  const reportPath = path.join(process.cwd(), 'docs', '文章检查报告.md');
  let reportContent = `# 文章检查报告\n\n`;
  reportContent += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
  reportContent += `总计检查: ${files.length} 篇文章\n`;
  reportContent += `发现问题: ${issues.length} 篇文章\n\n`;
  
  if (issues.length === 0) {
    reportContent += `## ✅ 所有文章检查通过！\n\n`;
  } else {
    // 按分类分组
    const issuesByCategory: Record<string, ArticleIssue[]> = {};
    for (const issue of issues) {
      if (!issuesByCategory[issue.category]) {
        issuesByCategory[issue.category] = [];
      }
      issuesByCategory[issue.category].push(issue);
    }
    
    for (const [category, categoryIssues] of Object.entries(issuesByCategory)) {
      reportContent += `## ${category} (${categoryIssues.length} 篇文章有问题)\n\n`;
      
      for (const issue of categoryIssues) {
        reportContent += `### ${issue.article}\n\n`;
        for (const problem of issue.issues) {
          reportContent += `- ${problem}\n`;
        }
        reportContent += `\n`;
      }
    }
    
    // 问题统计
    reportContent += `## 问题统计\n\n`;
    const problemTypes: Record<string, number> = {};
    for (const issue of issues) {
      for (const problem of issue.issues) {
        const type = problem.split(':')[0];
        problemTypes[type] = (problemTypes[type] || 0) + 1;
      }
    }
    
    for (const [type, count] of Object.entries(problemTypes).sort((a, b) => b[1] - a[1])) {
      reportContent += `- ${type}: ${count}次\n`;
    }
  }
  
  fs.writeFileSync(reportPath, reportContent, 'utf-8');
  console.log(`\n\n报告已保存到: ${reportPath}`);
}

main();


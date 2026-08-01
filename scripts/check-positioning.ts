/**
 * 文章定位检查脚本
 * 
 * 检查内容是否符合网站定位：
 * 1. 深入浅出：用简单语言解释复杂的物理概念
 * 2. 科学准确：基于物理原理和科学依据
 * 3. 实用价值：提供实际应用和实验
 * 4. SEO友好：符合搜索引擎优化要求
 * 
 * 使用方法：npx tsx scripts/check-positioning.ts
 */

import { getAllArticles } from '../lib/content';
import { getAllMarkdownFiles, parseMarkdownFile } from '../lib/markdown';
import fs from 'fs';
import path from 'path';

interface PositioningIssue {
  slug: string;
  title: string;
  category: string;
  subcategory: string;
  issues: Array<{
    type: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    details?: string;
  }>;
}

// 过于学术化的词汇和短语
const academicTerms = [
  'thereby', 'wherein', 'herein', 'thereof', 'whereby',
  'aforementioned', 'aforesaid', 'henceforth', 'notwithstanding',
  'quantitatively', 'qualitatively', 'theoretically', 'empirically',
  'postulate', 'hypothesize', 'conjecture', 'proposition',
  'differential equation', 'integral calculus', 'vector calculus',
  'mathematical formalism', 'theoretical framework'
];

// 过于复杂的句子结构标记
const complexPatterns = [
  /[^.]{200,}/g, // 超过200字符的句子
  /[^,]{100,},/g, // 超过100字符的逗号分隔部分
];

// 检查是否过于学术化
function checkAcademicLanguage(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return academicTerms.some(term => lowerContent.includes(term));
}

// 检查是否有过于复杂的句子
function checkComplexSentences(content: string): string[] {
  const issues: string[] = [];
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let longSentenceCount = 0;
  let complexSentenceCount = 0;
  
  sentences.forEach((sentence) => {
    if (sentence.trim().length > 250) {
      longSentenceCount++;
    }
    // 检查是否有过多的从句或复杂结构（通过逗号、分号、连词数量判断）
    const commaCount = (sentence.match(/,/g) || []).length;
    const conjunctionCount = (sentence.match(/\b(and|or|but|because|although|while|since|if|when|where|which|that)\b/gi) || []).length;
    if (commaCount > 5 || conjunctionCount > 4) {
      complexSentenceCount++;
    }
  });
  
  if (longSentenceCount > 3) {
    issues.push(`包含过多超长句子（${longSentenceCount}个超过250字符的句子）`);
  }
  
  if (complexSentenceCount > 5) {
    issues.push(`包含过多复杂句子结构（${complexSentenceCount}个句子结构过于复杂）`);
  }
  
  return issues;
}

// 检查是否缺乏实用价值
function checkPracticalValue(content: string): { hasApplications: boolean; hasExperiments: boolean; issues: string[] } {
  const issues: string[] = [];
  const lowerContent = content.toLowerCase();
  
  // 检查是否有实际应用部分（通过section标题）
  const hasApplicationsSection = lowerContent.includes('### how it works in daily life');
  
  // 检查是否有实验部分（通过section标题）
  const hasExperimentsSection = lowerContent.includes('### scientific experiments & demonstrations');
  
  // 检查How It Works in Daily Life部分是否有足够的应用（至少3个，通过编号列表判断）
  const dailyLifeMatch = content.match(/### How It Works in Daily Life[\s\S]*?(?=###|##|$)/i);
  let applicationCount = 0;
  if (dailyLifeMatch) {
    // 计算编号列表项的数量
    applicationCount = (dailyLifeMatch[0].match(/^\d+\.\s/gm) || []).length;
  }
  
  // 检查Scientific Experiments部分是否有足够的实验（至少3个，通过项目符号列表判断）
  const experimentsMatch = content.match(/### Scientific Experiments & Demonstrations[\s\S]*?(?=##|$)/i);
  let experimentCount = 0;
  if (experimentsMatch) {
    // 计算项目符号列表项的数量
    experimentCount = (experimentsMatch[0].match(/^-\s/gm) || []).length;
  }
  
  if (!hasApplicationsSection) {
    issues.push('缺少"How It Works in Daily Life"部分');
  } else if (applicationCount < 3) {
    issues.push(`"How It Works in Daily Life"部分应用不足（当前${applicationCount}个，建议至少3个）`);
  }
  
  if (!hasExperimentsSection) {
    issues.push('缺少"Scientific Experiments & Demonstrations"部分');
  } else if (experimentCount < 3) {
    issues.push(`"Scientific Experiments & Demonstrations"部分实验不足（当前${experimentCount}个，建议至少3个）`);
  }
  
  return { hasApplications: hasApplicationsSection, hasExperiments: hasExperimentsSection, issues };
}

// 检查是否缺乏科学依据
function checkScientificBasis(content: string): { hasPrinciples: boolean; hasExamples: boolean; issues: string[] } {
  const issues: string[] = [];
  const lowerContent = content.toLowerCase();
  
  // 检查是否有科学原理部分（通过section标题）
  const hasPrinciplesSection = lowerContent.includes('### scientific principles');
  
  // 检查是否有真实例子部分（通过section标题）
  const hasExamplesSection = lowerContent.includes('### real examples');
  
  // 检查Real Examples部分是否有足够的例子（至少3个，通过项目符号列表判断）
  const realExamplesMatch = content.match(/### Real Examples[\s\S]*?(?=##|$)/i);
  let exampleCount = 0;
  if (realExamplesMatch) {
    // 计算项目符号列表项的数量
    exampleCount = (realExamplesMatch[0].match(/^-\s/gm) || []).length;
  }
  
  if (!hasPrinciplesSection) {
    issues.push('缺少"Scientific Principles"部分');
  }
  
  if (!hasExamplesSection) {
    issues.push('缺少"Real Examples"部分');
  } else if (exampleCount < 3) {
    issues.push(`"Real Examples"部分例子不足（当前${exampleCount}个，建议至少3个）`);
  }
  
  return { hasPrinciples: hasPrinciplesSection, hasExamples: hasExamplesSection, issues };
}

// 检查是否符合问答形式
function checkQuestionFormat(title: string): boolean {
  return title.includes('?') || 
         title.toLowerCase().startsWith('what') ||
         title.toLowerCase().startsWith('why') ||
         title.toLowerCase().startsWith('how') ||
         title.toLowerCase().startsWith('when') ||
         title.toLowerCase().startsWith('where') ||
         title.toLowerCase().startsWith('which');
}

// 检查内容深度是否合适
function checkContentDepth(content: string): { tooShallow: boolean; tooDeep: boolean; issues: string[] } {
  const issues: string[] = [];
  const wordCount = content.split(/\s+/).length;
  const lowerContent = content.toLowerCase();
  
  // 检查是否过于浅显（缺乏详细解释）
  const hasDetailedExplanation = lowerContent.includes('## detailed explanation');
  const hasBackground = lowerContent.includes('### background');
  
  // 检查是否过于深入（使用过多专业术语，且缺乏解释）
  const technicalTermCount = (lowerContent.match(/\b(quantum|electromagnetic|thermodynamic|relativistic|schrödinger|heisenberg|maxwell|einstein|newton|kepler|superposition|entanglement|decoherence)\b/g) || []).length;
  
  if (wordCount < 800) {
    issues.push(`内容过于浅显 (${wordCount}字，建议1000-2000字)`);
  }
  
  if (!hasDetailedExplanation) {
    issues.push('缺少"Detailed Explanation"部分');
  }
  
  if (!hasBackground) {
    issues.push('缺少"Background"部分');
  }
  
  // 如果专业术语过多但内容较短，可能过于深入
  if (technicalTermCount > 15 && wordCount < 1200) {
    issues.push(`专业术语过多但内容较短（${technicalTermCount}个专业术语，${wordCount}字），可能难以理解`);
  }
  
  return { tooShallow: wordCount < 800, tooDeep: technicalTermCount > 15 && wordCount < 1200, issues };
}

// 检查是否缺乏日常例子
function checkDailyExamples(content: string): boolean {
  const lowerContent = content.toLowerCase();
  const dailyKeywords = [
    'everyday', 'daily', 'common', 'familiar', 'ordinary',
    'home', 'kitchen', 'car', 'phone', 'computer', 'light',
    'water', 'air', 'earth', 'sun', 'moon', 'star'
  ];
  
  return dailyKeywords.some(keyword => lowerContent.includes(keyword));
}

async function checkPositioning() {
  console.log('🔍 开始检查文章定位...\n');

  const articles = await getAllArticles();
  const topicsDir = path.join(process.cwd(), 'content', 'topics');
  const files = getAllMarkdownFiles(topicsDir);
  const issues: PositioningIssue[] = [];

  console.log(`📚 总共找到 ${articles.length} 篇文章\n`);

  // 创建slug到文件路径的映射
  const slugToPath = new Map<string, string>();
  files.forEach(filePath => {
    const { frontmatter } = parseMarkdownFile(filePath);
    const slug = frontmatter.slug || path.basename(filePath, '.md');
    slugToPath.set(slug, filePath);
  });

  // 检查每篇文章
  for (const article of articles) {
    const articleIssues: PositioningIssue['issues'] = [];
    const filePath = slugToPath.get(article.slug);
    
    if (!filePath) {
      continue; // 跳过找不到文件的文章
    }
    
    // 直接读取Markdown文件内容
    const { content } = parseMarkdownFile(filePath);

    // 1. 检查是否过于学术化
    if (checkAcademicLanguage(content)) {
      articleIssues.push({
        type: '过于学术化',
        severity: 'high',
        description: '使用了过于学术化的语言，不符合"深入浅出"的定位',
        details: '包含学术术语，可能难以理解'
      });
    }

    // 2. 检查是否有过于复杂的句子（只报告严重问题）
    const complexSentences = checkComplexSentences(content);
    if (complexSentences.length > 0) {
      articleIssues.push({
        type: '句子过于复杂',
        severity: 'low',
        description: complexSentences.join('; '),
        details: '建议简化句子结构，提高可读性'
      });
    }

    // 3. 检查是否缺乏实用价值
    const practicalValue = checkPracticalValue(content);
    if (practicalValue.issues.length > 0) {
      practicalValue.issues.forEach(issue => {
        articleIssues.push({
          type: '缺乏实用价值',
          severity: 'high',
          description: issue,
          details: '不符合"实用价值"定位，需要提供实际应用和实验'
        });
      });
    }

    // 4. 检查是否缺乏科学依据
    const scientificBasis = checkScientificBasis(content);
    if (scientificBasis.issues.length > 0) {
      scientificBasis.issues.forEach(issue => {
        articleIssues.push({
          type: '缺乏科学依据',
          severity: 'high',
          description: issue,
          details: '不符合"科学准确"定位，需要基于物理原理'
        });
      });
    }

    // 5. 检查是否符合问答形式
    if (!checkQuestionFormat(article.title)) {
      articleIssues.push({
        type: '不符合问答形式',
        severity: 'medium',
        description: '标题不是问题形式',
        details: '网站定位要求以问题为导向'
      });
    }

    // 6. 检查内容深度
    const contentDepth = checkContentDepth(content);
    if (contentDepth.issues.length > 0) {
      contentDepth.issues.forEach(issue => {
        articleIssues.push({
          type: '内容深度不合适',
          severity: 'medium',
          description: issue,
          details: '需要在准确性和可理解性之间找到平衡'
        });
      });
    }

    // 7. 检查是否缺乏日常例子（只在没有Real Examples部分时报告）
    const hasRealExamples = content.toLowerCase().includes('### real examples');
    if (!hasRealExamples && !checkDailyExamples(content)) {
      articleIssues.push({
        type: '缺乏日常例子',
        severity: 'medium',
        description: '内容中缺乏日常生活中的例子',
        details: '建议添加更多贴近日常生活的例子，提高可理解性'
      });
    }

    // 记录有问题的文章
    if (articleIssues.length > 0) {
      issues.push({
        slug: article.slug,
        title: article.title,
        category: article.categoryId,
        subcategory: article.subcategoryId,
        issues: articleIssues
      });
    }
  }

  // 生成报告
  const reportPath = path.join(__dirname, '../docs/第2个100篇内容/200篇文章定位问题检查报告.md');
  let report = `# 200篇文章定位问题检查报告\n\n`;
  report += `> **检查日期**：${new Date().toISOString().split('T')[0]}\n`;
  report += `> **检查范围**：所有200篇文章\n`;
  report += `> **检查工具**：\`scripts/check-positioning.ts\`\n\n`;
  report += `---\n\n`;

  report += `## 一、总体统计\n\n`;
  report += `- **总文章数**：${articles.length}篇\n`;
  report += `- **发现问题文章数**：${issues.length}篇\n`;
  report += `- **问题总数**：${issues.reduce((sum, issue) => sum + issue.issues.length, 0)}个\n\n`;

  // 按严重程度分类
  const highSeverity = issues.filter(i => i.issues.some(iss => iss.severity === 'high'));
  const mediumSeverity = issues.filter(i => i.issues.some(iss => iss.severity === 'medium'));
  const lowSeverity = issues.filter(i => i.issues.some(iss => iss.severity === 'low'));

  report += `**问题严重程度分布**：\n`;
  report += `- 🔴 高优先级：${highSeverity.length}篇\n`;
  report += `- 🟡 中优先级：${mediumSeverity.length}篇\n`;
  report += `- 🟢 低优先级：${lowSeverity.length}篇\n\n`;

  report += `---\n\n`;

  // 按问题类型分类统计
  const issueTypes = new Map<string, number>();
  issues.forEach(issue => {
    issue.issues.forEach(iss => {
      issueTypes.set(iss.type, (issueTypes.get(iss.type) || 0) + 1);
    });
  });

  report += `## 二、问题类型统计\n\n`;
  const sortedTypes = Array.from(issueTypes.entries()).sort((a, b) => b[1] - a[1]);
  sortedTypes.forEach(([type, count]) => {
    report += `- **${type}**：${count}篇\n`;
  });
  report += `\n---\n\n`;

  // 详细问题列表
  report += `## 三、详细问题列表\n\n`;

  // 按严重程度分组
  if (highSeverity.length > 0) {
    report += `### 3.1 高优先级问题（必须修复）\n\n`;
    highSeverity.forEach((issue, index) => {
      const highIssues = issue.issues.filter(iss => iss.severity === 'high');
      report += `${index + 1}. **${issue.title}** (\`${issue.slug}\`)\n`;
      report += `   - **分类**：${issue.category} > ${issue.subcategory}\n`;
      highIssues.forEach(iss => {
        report += `   - 🔴 **${iss.type}**：${iss.description}\n`;
        if (iss.details) {
          report += `     - 详情：${iss.details}\n`;
        }
      });
      report += `\n`;
    });
    report += `---\n\n`;
  }

  if (mediumSeverity.length > 0) {
    report += `### 3.2 中优先级问题（建议修复）\n\n`;
    mediumSeverity.forEach((issue, index) => {
      const mediumIssues = issue.issues.filter(iss => iss.severity === 'medium');
      report += `${index + 1}. **${issue.title}** (\`${issue.slug}\`)\n`;
      report += `   - **分类**：${issue.category} > ${issue.subcategory}\n`;
      mediumIssues.forEach(iss => {
        report += `   - 🟡 **${iss.type}**：${iss.description}\n`;
        if (iss.details) {
          report += `     - 详情：${iss.details}\n`;
        }
      });
      report += `\n`;
    });
    report += `---\n\n`;
  }

  if (lowSeverity.length > 0) {
    report += `### 3.3 低优先级问题（可选修复）\n\n`;
    lowSeverity.forEach((issue, index) => {
      const lowIssues = issue.issues.filter(iss => iss.severity === 'low');
      report += `${index + 1}. **${issue.title}** (\`${issue.slug}\`)\n`;
      report += `   - **分类**：${issue.category} > ${issue.subcategory}\n`;
      lowIssues.forEach(iss => {
        report += `   - 🟢 **${iss.type}**：${iss.description}\n`;
        if (iss.details) {
          report += `     - 详情：${iss.details}\n`;
        }
      });
      report += `\n`;
    });
    report += `---\n\n`;
  }

  // 修复建议
  report += `## 四、修复建议\n\n`;
  report += `### 4.1 过于学术化\n\n`;
  report += `**问题**：使用了过于学术化的语言，不符合"深入浅出"的定位\n\n`;
  report += `**修复方法**：\n`;
  report += `- 将学术术语替换为简单易懂的表达\n`;
  report += `- 使用日常语言解释复杂概念\n`;
  report += `- 添加类比和比喻帮助理解\n\n`;

  report += `### 4.2 缺乏实用价值\n\n`;
  report += `**问题**：缺乏实际应用和实验演示部分\n\n`;
  report += `**修复方法**：\n`;
  report += `- 添加"How It Works in Daily Life"部分，提供3-5个日常应用\n`;
  report += `- 添加"Scientific Experiments & Demonstrations"部分，提供可操作的实验\n`;
  report += `- 确保应用和实验具体、实用、易于理解\n\n`;

  report += `### 4.3 缺乏科学依据\n\n`;
  report += `**问题**：缺乏基于物理原理的科学解释\n\n`;
  report += `**修复方法**：\n`;
  report += `- 添加"Scientific Principles"部分，使用编号列表解释物理原理\n`;
  report += `- 添加"Real Examples"部分，提供3-5个真实案例\n`;
  report += `- 确保所有解释都有物理原理支撑\n\n`;

  report += `### 4.4 不符合问答形式\n\n`;
  report += `**问题**：标题不是问题形式\n\n`;
  report += `**修复方法**：\n`;
  report += `- 将标题改为问题形式（What/Why/How/When/Where开头）\n`;
  report += `- 确保标题直接回答用户疑问\n\n`;

  report += `### 4.5 内容深度不合适\n\n`;
  report += `**问题**：内容过于浅显或过于深入\n\n`;
  report += `**修复方法**：\n`;
  report += `- 过于浅显：增加详细解释，添加背景和原理\n`;
  report += `- 过于深入：简化语言，添加更多日常例子和类比\n`;
  report += `- 确保内容长度在1000-2000字之间\n\n`;

  report += `---\n\n`;

  report += `## 五、总结\n\n`;
  report += `本次检查共发现 **${issues.length}篇文章**存在定位问题，共 **${issues.reduce((sum, issue) => sum + issue.issues.length, 0)}个问题**。\n\n`;
  report += `**建议优先修复高优先级问题**，确保所有文章符合网站定位：\n`;
  report += `- ✅ 深入浅出：用简单语言解释复杂的物理概念\n`;
  report += `- ✅ 科学准确：基于物理原理和科学依据\n`;
  report += `- ✅ 实用价值：提供实际应用和实验\n`;
  report += `- ✅ SEO友好：符合搜索引擎优化要求\n\n`;

  report += `---\n\n`;
  report += `**检查完成时间**：${new Date().toISOString()}\n`;

  // 写入报告文件
  fs.writeFileSync(reportPath, report, 'utf-8');

  // 输出到控制台
  console.log('='.repeat(60));
  console.log('📊 检查结果');
  console.log('='.repeat(60));
  console.log(`总计: ${articles.length} 篇文章`);
  console.log(`发现问题: ${issues.length} 篇`);
  console.log(`问题总数: ${issues.reduce((sum, issue) => sum + issue.issues.length, 0)} 个`);
  console.log('');
  console.log(`报告已保存到: ${reportPath}`);
  console.log('='.repeat(60));

  if (issues.length > 0) {
    console.log('\n前10个问题文章：');
    issues.slice(0, 10).forEach((issue, index) => {
      console.log(`\n${index + 1}. ${issue.title} (${issue.slug})`);
      issue.issues.slice(0, 2).forEach(iss => {
        console.log(`   - ${iss.type}: ${iss.description}`);
      });
    });
  }
}

// 运行检查
checkPositioning().catch(error => {
  console.error('❌ 检查过程出错:', error);
  process.exit(1);
});


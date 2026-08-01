/**
 * 批量移除所有文章中的 Related Concepts 部分
 * 
 * 使用方法：
 * node scripts/remove-related-concepts.js
 */

const fs = require('fs');
const path = require('path');

const topicsDir = path.join(__dirname, '..', 'content', 'topics');

function getAllMarkdownFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function removeRelatedConcepts(content) {
  // 匹配 Related Concepts 部分（包括标题和列表）
  // 匹配格式：## Related Concepts 后跟空行和列表，直到文件末尾或下一个 ##
  const relatedConceptsRegex = /(\n## Related Concepts\s*\n(?:\s*-\s*[^\n]+\n?)+)/;
  
  return content.replace(relatedConceptsRegex, '');
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查是否包含 Related Concepts
    if (content.includes('## Related Concepts')) {
      const newContent = removeRelatedConcepts(content);
      
      // 移除末尾的多个空行
      const cleanedContent = newContent.replace(/\n+$/, '\n');
      
      fs.writeFileSync(filePath, cleanedContent, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`处理文件失败: ${filePath}`, error);
    return false;
  }
}

// 主函数
function main() {
  console.log('开始批量移除 Related Concepts 部分...\n');
  
  const files = getAllMarkdownFiles(topicsDir);
  console.log(`找到 ${files.length} 个 Markdown 文件\n`);
  
  let processedCount = 0;
  let errorCount = 0;
  
  files.forEach(filePath => {
    if (processFile(filePath)) {
      processedCount++;
      const relativePath = path.relative(path.join(__dirname, '..'), filePath);
      console.log(`✅ ${relativePath}`);
    }
  });
  
  console.log(`\n处理完成！`);
  console.log(`- 成功处理: ${processedCount} 个文件`);
  console.log(`- 错误: ${errorCount} 个文件`);
}

main();


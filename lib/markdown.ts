import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

/**
 * 读取 Markdown 文件并解析 Frontmatter
 */
export function parseMarkdownFile(filePath: string) {
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  return { frontmatter: data, content };
}

/**
 * 将 Markdown 转换为 HTML
 * 
 * 支持的Markdown特性：
 * - 单个换行会转换为 <br>（通过 remark-breaks）
 * - 两个换行会转换为新段落 <p>
 * - GitHub Flavored Markdown（表格、任务列表等）
 * 
 * @param markdown Markdown 内容
 * @returns HTML 内容
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm)      // 支持表格、任务列表等 GFM 语法
    .use(remarkBreaks)   // 支持单个换行转换为 <br>
    .use(remarkHtml)     // 转换为 HTML
    .process(markdown);
  
  return result.toString();
}

/**
 * 获取所有 Markdown 文件路径
 */
export function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  
  function traverse(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}


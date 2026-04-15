import fs from "fs";
import path from "path";
import matter from "gray-matter";
const postsDir = path.join(process.cwd(), "content/blog");
export interface Post {
  slug: string; title: string; date: string; description: string; category: string; content: string;
}
export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDir)) return [];
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".md"));
  return files.map(file => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
    const { data, content } = matter(raw);
    return { slug, content, title: data.title||"", date: data.date||"", description: data.description||"", category: data.category||"" };
  }).sort((a,b) => b.date.localeCompare(a.date));
}
export function getPostBySlug(slug: string): Post | null {
  const file = path.join(postsDir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return { slug, content, title: data.title||"", date: data.date||"", description: data.description||"", category: data.category||"" };
}

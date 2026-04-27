import fs from "fs";
import path from "path";
import matter from "gray-matter";
const postsDir = path.join(process.cwd(), "content/blog");
const enPostsDir = path.join(process.cwd(), "content/en/blog");
export interface Post {
  slug: string; title: string; date: string; description: string; category: string; content: string;
}

function getPosts(dir: string): Post[] {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".mdx") || f.endsWith(".md"));
  return files.map(file => {
    const slug = file.replace(/\.(mdx?|md)$/, "");
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    return { slug, content, title: data.title||"", date: data.date||"", description: data.description||"", category: data.category||"" };
  }).sort((a,b) => b.date.localeCompare(a.date));
}

function getPostFromDir(dir: string, slug: string): Post | null {
  let file = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(file)) {
    file = path.join(dir, `${slug}.md`);
  }
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return { slug, content, title: data.title||"", date: data.date||"", description: data.description||"", category: data.category||"" };
}

export function getAllPosts(): Post[] {
  return getPosts(postsDir);
}

export function getPostBySlug(slug: string): Post | null {
  return getPostFromDir(postsDir, slug);
}

export function getAllEnPosts(): Post[] {
  return getPosts(enPostsDir);
}

export function getEnPostBySlug(slug: string): Post | null {
  return getPostFromDir(enPostsDir, slug);
}

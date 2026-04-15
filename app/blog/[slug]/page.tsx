import { getPostBySlug, getAllPosts } from "@/lib/blog";
import { notFound } from "next/navigation";
export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }));
}
export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();
  return (
    <main style={{ minHeight: "100vh", background: "#FAF6EE", fontFamily: "Georgia, serif", padding: "60px 40px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ fontSize: 11, color: "#B8966A", letterSpacing: 2, marginBottom: 16, fontFamily: "sans-serif" }}>{post.category}</div>
        <h1 style={{ fontSize: 28, fontWeight: 300, color: "#1A1018", lineHeight: 1.6, marginBottom: 16 }}>{post.title}</h1>
        <div style={{ fontSize: 12, color: "#A89E94", marginBottom: 40, fontFamily: "sans-serif" }}>{post.date}</div>
        <div style={{ fontSize: 16, color: "#3A3028", lineHeight: 2, fontFamily: "sans-serif" }}
          dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br/>").replace(/## (.*)/g, "<h2 style='font-size:20px;margin:32px 0 16px;color:#1A1018'>$1</h2>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
        />
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #DDD8D0" }}>
          <a href="/blog" style={{ fontSize: 13, color: "#B8966A", fontFamily: "sans-serif", textDecoration: "none" }}>← ブログ一覧に戻る</a>
        </div>
      </div>
    </main>
  );
}

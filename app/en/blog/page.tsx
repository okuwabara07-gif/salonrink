import { getAllEnPosts } from "@/lib/blog";
import Link from "next/link";

export const metadata = {
  title: "Blog | SalonRink",
  description: "Beauty salon management guides, LINE booking tips, and customer retention strategies.",
  alternates: { canonical: "https://salonrink.com/en/blog" },
};

export default function EnBlogPage() {
  const posts = getAllEnPosts();
  return (
    <main style={{ minHeight: "100vh", background: "#FAF6EE", fontFamily: "Georgia, serif", padding: "60px 40px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, fontWeight: 300, color: "#1A1018", letterSpacing: 4, marginBottom: 8 }}>Blog</h1>
        <p style={{ fontSize: 14, color: "#A89E94", marginBottom: 48, fontFamily: "sans-serif" }}>Beauty salon management, LINE booking, and customer retention insights</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {posts.map(post => (
            <Link key={post.slug} href={`/en/blog/${post.slug}`} style={{ textDecoration: "none" }}>
              <div style={{ padding: "24px", border: "1px solid #DDD8D0", background: "#fff", cursor: "pointer" }}>
                <div style={{ fontSize: 11, color: "#B8966A", letterSpacing: 2, marginBottom: 8, fontFamily: "sans-serif" }}>{post.category}</div>
                <h2 style={{ fontSize: 18, color: "#1A1018", fontWeight: 400, marginBottom: 8, lineHeight: 1.6 }}>{post.title}</h2>
                <p style={{ fontSize: 13, color: "#7A6E64", fontFamily: "sans-serif", lineHeight: 1.8 }}>{post.description}</p>
                <div style={{ fontSize: 12, color: "#A89E94", marginTop: 12, fontFamily: "sans-serif" }}>{post.date}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

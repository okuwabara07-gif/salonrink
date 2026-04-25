import { getPostBySlug, getAllPosts } from "@/lib/blog";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return { title: `${post.title} | SalonRink`, description: post.description };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  const allPosts = getAllPosts();
  const related = allPosts.filter(p => p.slug !== slug).slice(0, 3);

  return (
    <div style={{ maxWidth:"760px", margin:"0 auto", padding:"3rem 1rem" }}>
      <div style={{ marginBottom:"1rem" }}>
        <Link href="/blog" style={{ fontSize:"0.75rem", color:"#888", textDecoration:"none", letterSpacing:"0.1em" }}>← ブログ一覧</Link>
      </div>
      <span style={{ fontSize:"0.72rem", background:"#f0ede8", color:"#555", padding:"3px 12px", letterSpacing:"0.1em" }}>{post.category}</span>
      <h1 style={{ fontFamily:"serif", fontSize:"clamp(1.4rem,4vw,2rem)", color:"#111", margin:"1rem 0 0.5rem", lineHeight:1.5, fontWeight:400 }}>{post.title}</h1>
      <div style={{ display:"flex", gap:"1.5rem", alignItems:"center", marginBottom:"2rem", paddingBottom:"1.5rem", borderBottom:"1px solid #e8e0d8" }}>
        <p style={{ fontSize:"0.75rem", color:"#aaa" }}>公開日：{post.date}</p>
      </div>

      <div style={{ background:"#f7f5f2", borderRadius:"4px", padding:"1.25rem 1.5rem", marginBottom:"2.5rem", borderLeft:"3px solid #111" }}>
        <p style={{ fontSize:"0.8rem", color:"#555", lineHeight:1.9 }}>
          <span style={{ fontWeight:700, color:"#111" }}>監修：</span>SalonRink 編集部<br />
          美容サロン経営者とITエンジニアが共同運営。サロン経営・LINE予約・顧客管理に関する実践的な情報を発信しています。
        </p>
      </div>

      <div style={{ background:"#f5f5f5", height:"90px", borderRadius:"4px", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"2.5rem", fontSize:"0.78rem", color:"#bbb" }}>
        広告
      </div>

      <div style={{ lineHeight:2.1, fontSize:"0.95rem", color:"#222" }}>
        <MDXRemote source={post.content} />
      </div>

      <div style={{ background:"#f5f5f5", height:"90px", borderRadius:"4px", display:"flex", alignItems:"center", justifyContent:"center", margin:"2.5rem 0", fontSize:"0.78rem", color:"#bbb" }}>
        広告
      </div>

      <div style={{ background:"#1a1a1a", borderRadius:"4px", padding:"2rem", margin:"3rem 0", textAlign:"center" }}>
        <p style={{ fontFamily:"serif", fontSize:"1rem", color:"#fff", marginBottom:"0.5rem", fontWeight:400 }}>SalonRinkを30日間無料で試す</p>
        <p style={{ fontSize:"0.82rem", color:"rgba(255,255,255,0.55)", marginBottom:"1.5rem", lineHeight:1.8 }}>
          LINE予約・顧客管理・EC・配送を一元管理
        </p>
        <a href="/"
          style={{ background:"#fff", color:"#111", padding:"12px 40px", fontSize:"0.82rem", letterSpacing:"0.15em", textDecoration:"none", fontWeight:700 }}>
          無料で始める
        </a>
      </div>

      {related.length > 0 && (
        <div style={{ marginTop:"3rem", paddingTop:"2rem", borderTop:"1px solid #e8e0d8" }}>
          <p style={{ fontSize:"0.68rem", letterSpacing:"0.2em", color:"#888", marginBottom:"1.5rem" }}>— 関連記事</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"1.5rem" }}>
            {related.map(p => (
              <Link key={p.slug} href={`/blog/${p.slug}`} style={{ textDecoration:"none" }}>
                <div style={{ borderTop:"2px solid #111", paddingTop:"1rem" }}>
                  <p style={{ fontSize:"0.68rem", color:"#888", marginBottom:"0.5rem", letterSpacing:"0.1em" }}>{p.category}</p>
                  <p style={{ fontSize:"0.88rem", color:"#111", lineHeight:1.6, fontFamily:"serif" }}>{p.title}</p>
                  <p style={{ fontSize:"0.72rem", color:"#bbb", marginTop:"0.5rem" }}>{p.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

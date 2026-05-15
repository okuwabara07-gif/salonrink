'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './LpPage.module.css';

/* ============================================================
   SalonRink Concierge — Launch LP v3 (with imagery)
   ============================================================
   16 sections, 既存 /public/v3 アセット活用
   ============================================================ */

const EXPERIENCE_STEPS = [
  { num: '01', title: 'ご来店前', desc: 'LINEからコンシェルジュがご挨拶。体調や肌の状態を、お聞きしておきます。' },
  { num: '02', title: 'ご来店中', desc: '前回の仕上がり、好みのトーン、避けたい色。スタッフ全員が、あなたを知っています。' },
  { num: '03', title: 'ご来店後', desc: 'スタイルの保ち方や、次回のおすすめ。コンシェルジュからのお便りが届きます。' },
  { num: '04', title: '次のご来店', desc: '「そろそろですね」のお知らせ。いつもの担当さんへも、ちゃんと伝わっています。' },
];

const PROBLEMS = [
  { img: '/v3/problem-1.png', title: '施術前の確認、本当にこれで大丈夫?', desc: '肌質や体調の情報を、毎回確認するのが不安...' },
  { img: '/v3/problem-2.png', title: '引き継ぎが毎回バラバラ', desc: '口頭やメモだけの引き継ぎで、伝え漏れがないかいつも不安...' },
  { img: '/v3/problem-3.png', title: 'LINE・紙・口頭で情報が散らばる', desc: 'お客様情報がバラバラで、伝えるのに時間がかかり、業務が止まる...' },
];

const OWNER_BENEFITS = [
  { icon: '♥', title: '顧客満足度', desc: '覚えてくれる安心感が、再来店率を高めます。1人1人に向き合う時間を、AIが守ります。' },
  { icon: '↻', title: 'リピート率', desc: '次回のおすすめを自動でご案内。「そろそろの時期」が、お客様の心にちゃんと届きます。' },
  { icon: '⚙', title: '業務効率', desc: 'カウンセリング・カルテ作成・引き継ぎを自動化。本業の「人と向き合う時間」に集中できます。' },
];

const FEATURES = [
  { img: '/v3/feature-01-karte.webp', title: 'AIカルテ自動生成', desc: '会話から自動でカルテを整理。スタッフ全員で情報共有。' },
  { img: '/v3/feature-02-line.webp', title: 'LINEカウンセリング', desc: '事前回答でカウンセリングを時短に。' },
  { img: '/v3/feature-03-allergy.webp', title: 'アレルギー情報自動表示', desc: '施術リスクを事前に確認、トラブル防止。' },
  { img: '/v3/feature-04-booking.webp', title: '予約管理', desc: 'ダブルブッキングを防止しスムーズな予約運用。' },
  { img: '/v3/feature-05-customer.webp', title: '顧客履歴一元管理', desc: '写真・施術履歴・メモをすべて一元管理。' },
  { img: '/v3/feature-06-dashboard.webp', title: '売上ダッシュボード', desc: 'リアルタイムでサロンの状況を可視化。' },
  { img: '/v3/feature-07-menu.webp', title: 'AIメニュー提案', desc: '次回施術の提案を自動でサポート。' },
  { img: '/v3/feature-08-others.webp', title: 'その他の機能', desc: '決済・リマインド・権限・口コミ・API連携など。' },
];

const STEPS = [
  { num: '01', img: '/v3/step-01-line-qr.webp', title: 'LINE追加', desc: 'LINEで友だち追加するだけ。QRを読み取って簡単スタート。' },
  { num: '02', img: '/v3/step-02-chat.webp', title: '質問に回答', desc: 'お客様がLINEで質問に回答。事前カウンセリングが完了。' },
  { num: '03', img: '/v3/step-03-tablet.webp', title: 'AIがカルテ生成', desc: 'AIが回答内容をもとに自動でカルテを作成・整理。' },
  { num: '04', img: '/v3/step-04-staff.webp', title: '提案に活用', desc: 'カルテをもとに最適な提案。満足度UPでリピートも促進。' },
];

const COMPARE_ROWS = [
  { feature: 'AIカルテ自動生成', srk: '対応', a: '未対応', b: '未対応' },
  { feature: 'LINEカウンセリング', srk: '対応', a: '未対応', b: '対応' },
  { feature: '敏感肌情報の整理', srk: '対応', a: '未対応', b: '未対応' },
  { feature: '予約・売上の一元管理', srk: '対応', a: '対応', b: '未対応' },
  { feature: '初期費用', srk: '0円', a: '30,000円〜', b: '0円' },
  { feature: '最短契約期間', srk: 'なし', a: '12ヶ月', b: 'なし' },
  { feature: '月額(標準プラン)', srk: '¥1,980〜', a: '¥9,800', b: '¥4,500' },
];

const INTEGRATIONS = [
  { name: 'LINE', tag: 'Messaging API', status: '対応済み', color: '#06c755', desc: ['LINE公式アカウントと連携', 'メッセージ・顧客情報を自動同期', '事前カウンセリングを自動化'] },
  { name: 'Stripe', tag: '決済プロバイダ', status: '対応済み', color: '#635bff', desc: ['オンライン決済に対応', '売上データを自動で同期', '安全でスムーズな決済体験'] },
  { name: 'ホットペッパーBeauty', tag: 'ベータ連携中', status: 'ベータ', color: '#e34c4c', desc: ['予約情報を自動で同期', 'お客様情報を一元管理', '空き状況の自動反映にも対応'] },
  { name: 'minimo', tag: 'Coming Soon', status: '近日対応', color: '#5bb6e8', desc: ['予約情報を自動で同期(予定)', 'メニュー・顧客情報を一元管理(予定)', '近日対応予定'] },
];

const SECURITY_ITEMS = [
  { icon: '🔒', title: 'AES-256 暗号化', desc: '業界標準の暗号化技術で、個人情報を安全に保護します。' },
  { icon: '🛡', title: 'TLS 1.3 通信', desc: '最新の TLS 1.3 プロトコルで、通信全体を暗号化。' },
  { icon: '⫼', title: 'サロン別データ分離', desc: 'RLS(Row Level Security)により、サロンごとのデータを厳格に分離。' },
  { icon: '💳', title: '決済は Stripe', desc: 'PCI DSS Level 1 認定取得済の Stripe を利用、安全な決済を実現。' },
];

const PLANS = [
  { name: 'Light', for: 'シンプルに始めたいサロン向け', price: '1,980', features: ['AIカルテ・LINE連携', '予約管理・顧客管理', '前日リマインド自動配信', 'メールサポート'], featured: false },
  { name: 'Standard', for: '売上を伸ばしたいサロン向け', price: '2,980', features: ['Lightの全機能', 'AIカルテ自動生成・提案', 'ホットペッパー Beauty 連携', 'AI接客スクリプト'], featured: true },
  { name: 'Premium', for: '本格的に運用したいサロン向け', price: '4,580', features: ['Standardの全機能', 'マルチ店舗管理対応', 'スタッフ無制限', '優先サポート'], featured: false },
];

const FAQ_ITEMS = [
  { q: 'Lightプラン¥1,980で何ができますか?', a: 'AIカルテ・LINE連携・予約管理・顧客管理・前日リマインドの基本機能をご提供します。Standardではホットペッパー連携とAIカルテ自動生成、Premiumでは複数店舗管理が追加されます。' },
  { q: '途中で解約できますか?', a: 'いつでも解約可能です。最低契約期間はなく、解約手数料もかかりません。' },
  { q: '既存の予約システムから移行できますか?', a: 'CSVでのインポートに対応しています。導入セットアップは個別にサポートいたします。' },
  { q: 'セキュリティは大丈夫ですか?', a: 'AES-256による暗号化、TLS1.3通信、サロン別データ分離(RLS)、Stripe決済(PCI DSS Level 1)を採用。' },
  { q: 'お客様の利用環境は?', a: 'LINEのみで利用可能です。お客様にアプリのインストールは不要です。' },
  { q: 'サポートはありますか?', a: 'メールサポート(support@salonrink.com)にて承ります。導入時は個別にオンラインでセットアップをご案内します。' },
];

export default function LpPage() {
  const [bannerOpen, setBannerOpen] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    try { if (localStorage.getItem('srk-launch-banner-2')) setBannerOpen(false); } catch {}
  }, []);

  const handleDismissBanner = () => {
    setBannerOpen(false);
    try { localStorage.setItem('srk-launch-banner-2', '1'); } catch {}
  };

  return (
    <main className={styles.page}>
      {/* LAUNCH BAR */}
      {bannerOpen && (
        <div className={styles.launchBar} role="region" aria-label="発売のお知らせ">
          <div className={styles.launchBarInner}>
            <span className={styles.launchBarDot} aria-hidden>●</span>
            <span className={styles.launchBarLabel}>本日発売</span>
            <span className={styles.launchBarSep} aria-hidden>/</span>
            <span className={styles.launchBarText}>SalonRink Concierge — サロンに、専属コンシェルジュを。</span>
            <a href="#plans" className={styles.launchBarCta}>14日間無料で試す →</a>
            <button type="button" onClick={handleDismissBanner} aria-label="閉じる" className={styles.launchBarClose}>✕</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href="#top" className={styles.brand} aria-label="SalonRink Concierge">
            <span className={styles.brandWord1}>SalonRink</span>
            <span className={styles.brandDot} aria-hidden>·</span>
            <span className={styles.brandWord2}>Concierge</span>
          </a>
          <nav className={styles.nav} aria-label="メインナビゲーション">
            <a href="#experience">体験</a>
            <a href="#problem">課題</a>
            <a href="#features">機能</a>
            <a href="#compare">比較</a>
            <a href="#plans">料金</a>
            <a href="#faq">FAQ</a>
          </nav>
          <a href="#plans" className={styles.headerCta}>14日間無料で試す</a>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className={styles.hero}>
        <div className={styles.heroBg} aria-hidden />
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <div className={styles.heroKicker}>
              <span className={styles.heroKickerText}>S A L O N R I N K · C O N C I E R G E</span>
            </div>
            <h1 className={styles.heroTitle}>
              サロンに、<br/>
              <span className={styles.heroTitleAccent}>専属コンシェルジュを。</span>
            </h1>
            <p className={styles.heroSub}>
              あなたの好み、前回の悩み、お気に入りの担当さん。<br/>
              覚えていてくれる、その嬉しさを。
            </p>
            <ul className={styles.heroBullets}>
              <li><span className={styles.heroBulletMark} aria-hidden>✓</span>お客様一人ひとりの「いつも」を記憶</li>
              <li><span className={styles.heroBulletMark} aria-hidden>✓</span>LINE だけで予約も相談も完結</li>
              <li><span className={styles.heroBulletMark} aria-hidden>✓</span>月¥1,980 / 初期費用0円 / 14日間無料</li>
            </ul>
            <div className={styles.heroCtas}>
              <a href="#plans" className={styles.heroCtaPrimary}>
                コンシェルジュを試す<span className={styles.heroArrow} aria-hidden>→</span>
              </a>
              <a href="#contact" className={styles.heroCtaSecondary}>
                <span className={styles.lineIcon} aria-hidden>L</span>LINEで相談する
              </a>
            </div>
            <p className={styles.heroMeta}>メアド登録のみ / 最短5分で開始 / 解約はいつでも</p>
          </div>
          <div className={styles.heroVisual}>
            <Image
              src="/logo/salonrink-concierge-oval.png"
              alt="SalonRink Concierge — サロンに、専属コンシェルジュを。"
              width={560} height={720} priority
              sizes="(max-width: 980px) 70vw, 500px"
              className={styles.heroLogo}
            />
            <p className={styles.heroVisualCaption}>
              <span className={styles.heroVisualCapEm}>本日、発売開始</span>
              <span className={styles.heroVisualCapDate}>・2026.05.15</span>
            </p>
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className={styles.experience}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionKicker}>CUSTOMER EXPERIENCE</p>
            <h2 className={styles.sectionTitle}>あなたを覚えてくれる、<br/>ふたつとないサロン体験。</h2>
            <p className={styles.sectionSub}>専属のコンシェルジュが、来店前から次の来店まで、ずっと寄り添います。</p>
          </div>
          <div className={styles.expGrid}>
            {EXPERIENCE_STEPS.map((s) => (
              <article key={s.num} className={styles.expCard}>
                <div className={styles.expNum}>{s.num}</div>
                <h3 className={styles.expTitle}>{s.title}</h3>
                <p className={styles.expDesc}>{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CONCEPT */}
      <section className={styles.concept}>
        <div className={styles.conceptInner}>
          <Image
            src="/logo/salonrink-concierge-oval.png"
            alt="SalonRink Concierge"
            width={360} height={480}
            sizes="(max-width: 700px) 60vw, 320px"
            className={styles.conceptLogo}
          />
          <div className={styles.conceptText}>
            <p className={styles.conceptEm}>「いつもの、その先へ。」</p>
            <p className={styles.conceptBody}>
              お客様の好みも、悩みも、思い出も。<br/>
              ひとりひとりに、専属のコンシェルジュを。
            </p>
          </div>
        </div>
      </section>

      {/* PROBLEM with images */}
      <section id="problem" className={styles.problem}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionKicker}>PROBLEM</p>
            <h2 className={styles.sectionTitle}>毎日のサロンワーク、<br/>こんな不安ありませんか?</h2>
            <p className={styles.sectionSub}>多くの美容師さんが、日々の業務の中でこんな悩みを感じています。</p>
          </div>
          <div className={styles.problemGrid}>
            {PROBLEMS.map((p, i) => (
              <div key={i} className={styles.problemCard}>
                <div className={styles.problemImageWrap}>
                  <Image
                    src={p.img}
                    alt={p.title}
                    width={400} height={260}
                    sizes="(max-width: 1100px) 90vw, 360px"
                    className={styles.problemImage}
                  />
                </div>
                <div className={styles.problemBody}>
                  <h3 className={styles.problemTitle}>{p.title}</h3>
                  <p className={styles.problemDesc}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.problemSolution}>
            <p className={styles.problemSolutionText}>
              そのすべて、<strong>SalonRink Concierge</strong> が解決します。
            </p>
          </div>
        </div>
      </section>

      {/* FOR OWNERS */}
      <section id="owners" className={styles.owners}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionKicker}>FOR SALON OWNERS</p>
            <h2 className={styles.sectionTitle}>サロンに、専属コンシェルジュを<br/>迎えませんか。</h2>
            <p className={styles.sectionSub}>美容師の経験 × AI の記憶。お客様1人1人に、ちゃんと向き合う時間を。</p>
          </div>
          <div className={styles.ownerGrid}>
            {OWNER_BENEFITS.map((b, i) => (
              <div key={i} className={styles.ownerCard}>
                <div className={styles.ownerIcon} aria-hidden>{b.icon}</div>
                <h3 className={styles.ownerTitle}>{b.title}</h3>
                <p className={styles.ownerDesc}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES with images */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionKicker}>FEATURES</p>
            <h2 className={styles.sectionTitle}>サロン運営に必要な機能、<br/>すべてが一つに。</h2>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureImageWrap}>
                  <Image
                    src={f.img}
                    alt={f.title}
                    width={320} height={200}
                    sizes="(max-width: 1100px) 45vw, 240px"
                    className={styles.featureImage}
                  />
                </div>
                <div className={styles.featureBody}>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI KARTE deep dive */}
      <section className={styles.aiKarte}>
        <div className={styles.aiKarteInner}>
          <div className={styles.aiKarteImageCol}>
            <Image
              src="/v3/karte-img.png"
              alt="AIカルテ画面"
              width={720} height={480}
              sizes="(max-width: 980px) 90vw, 600px"
              className={styles.aiKarteImage}
            />
          </div>
          <div className={styles.aiKarteTextCol}>
            <p className={styles.aiKarteNum}>01 / AI Karte</p>
            <h2 className={styles.aiKarteTitle}>AIがつくる、<br/>あなただけのカルテ。</h2>
            <p className={styles.aiKarteSub}>
              事前カウンセリングからAIが自動解析。リスクの見落としを防ぎ、最適な提案で顧客満足度を高めます。
            </p>
            <ul className={styles.aiKarteBullets}>
              <li><span className={styles.aiKarteBulletMark} aria-hidden>✓</span>施術履歴・写真・好みを自動構造化</li>
              <li><span className={styles.aiKarteBulletMark} aria-hidden>✓</span>敏感肌情報を施術前に整理してご共有</li>
              <li><span className={styles.aiKarteBulletMark} aria-hidden>✓</span>次回来店時の最適メニューをサジェスト</li>
            </ul>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className={styles.beforeAfter}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionKicker}>BEFORE / AFTER</p>
            <h2 className={styles.sectionTitle}>紙のカルテと、AIカルテ。<br/>差は、これくらい違う。</h2>
          </div>
          <div className={styles.baGrid}>
            <div className={styles.baCard}>
              <div className={styles.baLabel}>BEFORE 紙カルテ</div>
              <div className={styles.baImageWrap}>
                <Image
                  src="/v3/ba-before.png"
                  alt="紙のカルテ"
                  width={520} height={340}
                  sizes="(max-width: 980px) 90vw, 480px"
                  className={styles.baImage}
                />
              </div>
            </div>
            <div className={`${styles.baCard} ${styles.baCardAfter}`}>
              <div className={`${styles.baLabel} ${styles.baLabelAfter}`}>AFTER SalonRink</div>
              <div className={styles.baImageWrap}>
                <Image
                  src="/v3/ba-after.png"
                  alt="AIカルテ"
                  width={520} height={340}
                  sizes="(max-width: 980px) 90vw, 480px"
                  className={styles.baImage}
                />
              </div>
            </div>
          </div>
          <div className={styles.baStats}>
            <div className={styles.baStat}>
              <span className={styles.baStatNum}>15分<span className={styles.baStatUnit}>→3分</span></span>
              <span className={styles.baStatLabel}>カウンセリング時間</span>
            </div>
            <div className={styles.baStat}>
              <span className={styles.baStatNum}>0<span className={styles.baStatUnit}>件</span></span>
              <span className={styles.baStatLabel}>聞き漏れ</span>
            </div>
            <div className={styles.baStat}>
              <span className={styles.baStatNum}>75<span className={styles.baStatUnit}>%</span></span>
              <span className={styles.baStatLabel}>業務時間削減</span>
            </div>
          </div>
          <p className={styles.baFootnote}>※ 運用実績に基づくモデル値です(参考値)</p>
        </div>
      </section>

      {/* VIDEO TOUR */}
      <section className={styles.videoTour}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionKicker}>VIDEO TOUR</p>
            <h2 className={styles.sectionTitle}>90秒で分かる、<br/>SalonRink Concierge。</h2>
            <p className={styles.sectionSub}>動画で見る、コンシェルジュのある一日。</p>
          </div>
          <div className={styles.videoWrap}>
            <video
              src="/v3/video-tour.mp4"
              controls
              playsInline
              poster="/v3/karte-img.png"
              className={styles.video}
            >
              お使いのブラウザは動画再生に対応していません。
            </video>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - 4 STEPS with images */}
      <section id="steps" className={styles.steps}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionKicker}>HOW IT WORKS</p>
            <h2 className={styles.sectionTitle}>使い方はカンタン、4ステップ。</h2>
            <p className={styles.sectionSub}>LINEでつながるだけで、AIがサロン業務をもっとスマートに。</p>
          </div>
          <div className={styles.stepsRow}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className={styles.stepCard}>
                  <div className={styles.stepImageWrap}>
                    <Image
                      src={s.img}
                      alt={s.title}
                      width={300} height={200}
                      sizes="(max-width: 1100px) 90vw, 240px"
                      className={styles.stepImage}
                    />
                  </div>
                  <div className={styles.stepNum}>{s.num}</div>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && <div className={styles.stepArrow} aria-hidden>→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARE */}
      <section id="compare" className={styles.compare}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionKicker}>COMPARE</p>
            <h2 className={styles.sectionTitle}>他社サービスとの比較</h2>
            <p className={styles.sectionSub}>他社情報は公開情報をもとにした参考値です。</p>
          </div>
          <div className={styles.compareTableWrap}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th></th>
                  <th className={styles.compareThSrk}>
                    <span className={styles.compareSrkLabel}>SalonRink<br/>Concierge</span>
                  </th>
                  <th>従来型A社</th>
                  <th>予約系B社</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr key={i}>
                    <td className={styles.compareFeatureCell}>{row.feature}</td>
                    <td className={styles.compareSrkCell}>
                      <span className={row.srk.includes('対応') && !row.srk.includes('未') ? styles.compareYes : styles.compareValue}>{row.srk}</span>
                    </td>
                    <td>
                      <span className={row.a === '未対応' ? styles.compareNo : styles.compareValue}>{row.a}</span>
                    </td>
                    <td>
                      <span className={row.b === '未対応' ? styles.compareNo : styles.compareValue}>{row.b}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section id="integrations" className={styles.integrations}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionKicker}>INTEGRATIONS</p>
            <h2 className={styles.sectionTitle}>いま使っているツールと、<br/>シームレスに。</h2>
            <p className={styles.sectionSub}>主要サービスと連携して、予約・顧客・カルテ情報を自動で同期。</p>
          </div>
          <div className={styles.integGrid}>
            {INTEGRATIONS.map((it, i) => (
              <div key={i} className={styles.integCard}>
                <div className={styles.integHeader}>
                  <span className={styles.integName}>{it.name}</span>
                  <span className={styles.integTag} style={{ background: it.color + '15', color: it.color, borderColor: it.color + '40' }}>{it.tag}</span>
                </div>
                <ul className={styles.integDesc}>
                  {it.desc.map((d, di) => (
                    <li key={di}><span className={styles.integCheck} style={{ color: it.color }} aria-hidden>✓</span>{d}</li>
                  ))}
                </ul>
                <div className={styles.integStatus} style={{ background: it.color, color: '#fff' }}>{it.status}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className={styles.security}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionKicker}>SECURITY</p>
            <h2 className={styles.sectionTitle}>あなたの顧客データは、<br/>確実に守られています。</h2>
            <p className={styles.sectionSub}>美容業界で扱う個人情報を、金融・医療レベルのセキュリティで保護。</p>
          </div>
          <div className={styles.securityGrid}>
            {SECURITY_ITEMS.map((s, i) => (
              <div key={i} className={styles.securityCard}>
                <div className={styles.securityIcon} aria-hidden>{s.icon}</div>
                <h3 className={styles.securityTitle}>{s.title}</h3>
                <p className={styles.securityDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className={styles.plans}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionKicker}>PLANS</p>
            <h2 className={styles.sectionTitle}>規模にあわせて、選べる3プラン。</h2>
            <p className={styles.sectionSub}>すべてのプランに14日間無料トライアルが付帯します。</p>
          </div>
          <div className={styles.planGrid}>
            {PLANS.map((p) => (
              <div key={p.name} className={`${styles.planCard} ${p.featured ? styles.planCardFeatured : ''}`}>
                {p.featured && <div className={styles.planBadge}>おすすめ</div>}
                <h3 className={styles.planName}>{p.name}</h3>
                <p className={styles.planFor}>{p.for}</p>
                <p className={styles.planPrice}>
                  <span className={styles.planPriceYen}>¥</span>
                  <span className={styles.planPriceNum}>{p.price}</span>
                  <span className={styles.planPriceUnit}>/月(税込)</span>
                </p>
                <ul className={styles.planFeatures}>
                  {p.features.map((f, fi) => (
                    <li key={fi}><span className={styles.planCheck} aria-hidden>✓</span>{f}</li>
                  ))}
                </ul>
                <a href="/signup" className={`${styles.planCta} ${p.featured ? styles.planCtaFeatured : ''}`}>
                  {p.featured ? '無料ではじめる' : 'このプランを選ぶ'}
                </a>
              </div>
            ))}
          </div>
          <p className={styles.plansFootnote}>※ 初期費用 0円・最短契約期間なし・いつでも解約可能</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={styles.faq}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionKicker}>FAQ</p>
            <h2 className={styles.sectionTitle}>よくあるご質問</h2>
          </div>
          <div className={styles.faqList}>
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className={styles.faqItem}>
                <button
                  type="button"
                  className={`${styles.faqQ} ${openFaq === i ? styles.faqQOpen : ''}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span className={styles.faqQText}>Q. {item.q}</span>
                  <span className={styles.faqQMark} aria-hidden>{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className={styles.faqA}>
                    <span className={styles.faqAMark} aria-hidden>A.</span>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="contact" className={styles.finalCta}>
        <div className={styles.finalCtaInner}>
          <p className={styles.finalCtaKicker}>START FREE</p>
          <h2 className={styles.finalCtaTitle}>サロンの未来を、<br/>いま、はじめる。</h2>
          <p className={styles.finalCtaSub}>14日間の無料トライアル。最短5分で開始・最短契約期間なし。</p>
          <div className={styles.finalCtaButtons}>
            <a href="/signup" className={styles.finalCtaPrimary}>14日間無料で試す<span className={styles.heroArrow} aria-hidden>→</span></a>
            <a href="https://line.me/R/ti/p/@545fncvi" target="_blank" rel="noopener noreferrer" className={styles.finalCtaSecondary}>
              <span className={styles.lineIcon} aria-hidden>L</span>LINEで相談する
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.footerBrandWord}>SalonRink Concierge</span>
            <p className={styles.footerBrandTagline}>サロンに、専属コンシェルジュを。</p>
          </div>
          <nav className={styles.footerLinks} aria-label="フッター">
            <a href="/company">運営会社</a>
            <a href="/tokushoho">特定商取引法</a>
            <a href="/privacy">プライバシー</a>
            <a href="/terms">利用規約</a>
            <a href="mailto:support@salonrink.com">お問い合わせ</a>
          </nav>
          <div className={styles.footerLegal}>
            <p>運営: AOKAE合同会社</p>
            <p>© 2026 AOKAE合同会社. All rights reserved.</p>
            <p className={styles.footerLegalNote}>
              ※ 代表者氏名・住所・電話番号は support@salonrink.com まで請求があった場合に開示します(特定商取引法に基づく表記)
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

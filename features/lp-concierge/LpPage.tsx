'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './LpPage.module.css';
import StickyCTA from './StickyCTA';

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
  { img: '/v3/problem-1.png', title: '「いつもの田中さま」、前回なに話したっけ?', desc: '施術中の何気ない会話、好み、避けたい色…覚えてるつもりが、半年経つと曖昧に。お客様の「いつもの」が、思い出せない。' },
  { img: '/v3/problem-2.png', title: '紙のカルテ、頭の中、LINE…情報が3ヶ所にバラバラ', desc: '書いたメモを探す時間。過去のやりとりを遡る時間。本来お客様に向き合うための時間が、削られていく。' },
  { img: '/v3/problem-3.png', title: '来てくれたお客様の半分が、2回目に来ない', desc: '予約も会話もLINEに残っているのに、「いつ次の連絡をすればいい?」が分からない。タイミングを逃して、お客様を失っている。' },
];

const OWNER_BENEFITS = [
  { icon: '♥', title: '顧客満足度', desc: '覚えてくれる安心感が、再来店率を高めます。1人1人に向き合う時間を、自動化が守ります。' },
  { icon: '↻', title: 'リピート率', desc: '次回のおすすめを自動でご案内。「そろそろの時期」が、お客様の心にちゃんと届きます。' },
  { icon: '⚙', title: '業務効率', desc: 'カウンセリング・カルテ作成・引き継ぎを自動化。本業の「人と向き合う時間」に集中できます。' },
];

const FEATURES = [
  { img: '/v3/feature-01-karte.webp', title: 'カルテ自動生成', desc: '会話から自動でカルテを整理。1人サロンでも情報の取りこぼしゼロ。' },
  { img: '/v3/feature-02-line.webp', title: 'LINEカウンセリング', desc: '事前回答でカウンセリングを時短に。' },
  { img: '/v3/feature-03-allergy.webp', title: 'アレルギー情報自動表示', desc: '施術リスクを事前に確認、トラブル防止。' },
  { img: '/v3/feature-04-booking.webp', title: '予約管理(HPB予約も統合)', desc: 'HPB予約もLINE予約もダブルブッキングを防止しスムーズに運用。' },
  { img: '/v3/feature-05-customer.webp', title: '顧客履歴一元管理', desc: '写真・施術履歴・メモをすべて一元管理。' },
  { img: '/v3/feature-06-dashboard.webp', title: '売上ダッシュボード', desc: 'リアルタイムでサロンの状況を可視化。' },
  { img: '/v3/feature-07-menu.webp', title: 'メニュー自動提案', desc: '次回施術の提案を自動でサポート。' },
  { img: '/v3/feature-08-others.webp', title: 'その他の機能', desc: '決済・リマインド・権限・口コミ・API連携など。' },
];

const STEPS = [
  { num: '01', img: '/v3/step-01-line-qr.webp', title: 'LINE追加', desc: 'LINEで友だち追加するだけ。QRを読み取って簡単スタート。' },
  { num: '02', img: '/v3/step-02-chat.webp', title: '質問に回答', desc: 'お客様がLINEで質問に回答。事前カウンセリングが完了。' },
  { num: '03', img: '/v3/step-03-tablet.webp', title: '自動カルテ生成', desc: '自動で回答内容をもとにカルテを作成・整理。' },
  { num: '04', img: '/v3/step-04-staff.webp', title: '提案に活用', desc: 'カルテをもとに最適な提案。満足度UPでリピートも促進。' },
];

const COMPARE_ROWS = [
  { feature: 'ポジショニング', srk: 'LINEアドオン型', a: '従来型予約システム', b: '予約系SaaS', c: 'カルテ専業' },
  { feature: '月額料金', srk: '¥1,980〜', a: '¥9,800', b: '¥4,500', c: '¥3,300' },
  { feature: '初期費用', srk: '0円', a: '30,000円〜', b: '0円', c: '10,000円〜' },
  { feature: '導入時間', srk: '5分', a: '2週間', b: '1週間', c: '3日' },
  { feature: 'スタッフ学習コスト', srk: '無し', a: '高い', b: '中程度', c: '低い' },
  { feature: 'お客様への影響', srk: '無し(LINEのまま)', a: '中程度(新ログイン)', b: '低い(既存連携)', c: '中程度(アプリDL)' },
  { feature: '顧客記憶カルテ', srk: '対応', a: '未対応', b: '基本機能', c: '対応' },
  { feature: 'カルテ自動生成', srk: '対応', a: '未対応', b: '未対応', c: '対応(基本)' },
  { feature: 'HPB予約取込', srk: '対応', a: '未対応', b: '未対応', c: '未対応' },
  { feature: 'LINE完結性', srk: '100%完結', a: '連携なし', b: '一部連携', c: '連携なし' },
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
  { name: 'Light', for: 'シンプルに始めたいサロン向け', price: '1,980', features: ['カルテ・LINE連携', '予約管理・顧客管理', '前日リマインド自動配信', 'メールサポート'], featured: false },
  { name: 'Standard', for: '売上を伸ばしたいサロン向け', price: '2,980', features: ['Lightの全機能', 'カルテ自動生成・提案', 'ホットペッパー Beauty 連携', '接客スクリプト提案'], featured: true },
  { name: 'Premium', for: '本格的に運用したいサロン向け', price: '4,580', features: ['Standardの全機能', 'マルチ店舗管理対応', 'スタッフ無制限', '優先サポート'], featured: false },
];

const IN_ACTION_SCENES = [
  {
    time: 'AM 07:00',
    title: '朝のLINEで、今日のサロンが全部見える',
    desc: 'LINE公式アカウントから、当日の予約一覧が自動で届きます。前回のメニュー・特記事項・要望もまとめて確認。営業前の3分で、1日の段取りが整います。',
    tags: ['自動配信', '予約サマリ'],
  },
  {
    time: 'AM 09:30',
    title: 'HPB予約もLINE予約も、一画面で確認',
    desc: 'ホットペッパー Beauty からの予約が、LINEの予約と同じ画面に自動で並びます。ダブルブッキングの心配なし。顧客情報も自動で取り込み、初回対応の準備が10分で完了。',
    tags: ['HPB自動連携', '新規顧客取込'],
  },
  {
    time: 'AM 10:00',
    title: '「@田中様」と打つだけで、過去のすべてが瞬時に',
    desc: 'LINEのトーク画面で「@お客様名」と入力するだけ。前回の施術、好み、敏感肌などの情報が一画面で確認できます。「いつもの」をすぐに思い出せる安心感。',
    tags: ['LINE内カルテ', '瞬時呼出'],
  },
  {
    time: 'PM 18:00',
    title: '「次の連絡、誰にする?」を、自動で提案',
    desc: '営業終了前に、「そろそろの時期」のお客様リストが自動表示。配信文の下書きも用意されているので、確認して送るだけ。リピートのきっかけ作りが、毎日5分で完了。',
    tags: ['自動リピート提案', '配信文下書き'],
  },
];

const CASE_STUDY = {
  salon: {
    name: 'キレイ鶴見店',
    region: '神奈川県横浜市鶴見区',
    specialty: '白髪ケア・大人女性向け',
    feature: '予約制完全プライベートサロン',
    links: [
      { label: 'ホットペッパーBeauty', url: 'https://beauty.hotpepper.jp/H000501100/', icon: 'HPB' },
      { label: 'Instagram', url: 'https://www.instagram.com/kirei.tsurumi/', icon: 'IG' },
      { label: 'X', url: 'https://twitter.com/kirei_tsurumi', icon: 'X' },
    ],
  },
  effects: [
    {
      title: '当日朝の予約把握、3分で完了',
      before: 'HotPepper Beauty 管理画面で1件ずつ確認',
      after: 'LINE で当日サマリが朝7時に届く',
    },
    {
      title: 'カルテ整理時間、ほぼゼロに',
      before: '営業後に紙カルテ手書き、20-30分/日',
      after: 'LINE にメモを送るだけで、自動で整理',
    },
    {
      title: 'リピート率、再来店率に注力できる',
      before: '事務作業に追われて顧客分析が後回し',
      after: '業務時間が浮いて、顧客への提案が増えた',
    },
  ],
};

const FAQ_ITEMS = [
  { q: 'Lightプラン¥1,980で何ができますか?', a: 'カルテ・LINE連携・予約管理・顧客管理・前日リマインドの基本機能をご提供します。Standardではホットペッパー連携とカルテ自動生成、Premiumでは複数店舗管理が追加されます。' },
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
              再来店率と業務時間を、<br/>
              <span className={styles.heroTitleAccent}>LINEひとつで変える。</span>
            </h1>
            <p className={styles.heroSub}>
              いまのLINE公式アカウントに、カルテと顧客記憶を追加するだけ。<br/>
              新しいアプリは要らない。最短5分で開始。
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
              alt="SalonRink Concierge — 再来店率と業務時間を、LINEひとつで変える。"
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

      {/* DEMO CTA */}
      <section className={styles.demoCta}>
        <div className={styles.demoCtaInner}>
          <div className={styles.demoCtaContent}>
            <h2 className={styles.demoCtaTitle}>実際に操作してみたい方へ</h2>
            <p className={styles.demoCtaSub}>ログイン不要の無料デモで、SalonRink の機能を今すぐ体験できます。</p>
          </div>
          <a href="/demo" className={styles.demoCtaButton}>
            <span className={styles.demoCtaButtonIcon}>🎯</span>
            無料デモを見る
          </a>
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
            <p className={styles.conceptEm}>「ひとりに、ひとり。」</p>
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
          <div className={styles.problemHeadWrap}>
            <div className={styles.problemHeadText}>
              <p className={styles.sectionKicker}>PROBLEM</p>
              <h2 className={styles.sectionTitle}>1人サロンだからこそ、<br/>毎日<span className={styles.problemAccent}>こんな&ldquo;もったいない&rdquo;</span>が起きていませんか?</h2>
              <p className={styles.sectionSub}>毎日忙しく回しているのに、なぜか売上は伸び悩む。<br/>その原因は、お客様情報がきちんと&quot;資産&quot;になっていないからかもしれません。</p>
            </div>
            <div className={styles.problemHeadImage}>
              <Image
                src="/images/a802_problem.png"
                alt="1人サロン店主の悩み"
                width={280} height={280}
                sizes="(max-width: 980px) 240px, 280px"
              />
            </div>
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
          <div className={styles.problemBand}>
            <div className={styles.problemBandHead}>
              <span className={styles.problemBandIcon} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="9"/>
                  <path d="M6 11l3.5 3.5L16 8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className={styles.problemBandTitle}>あなたのサロンにも、<br/>こんなお悩みは?</span>
            </div>
            <ul className={styles.problemBandItems}>
              <li className={styles.problemBandItem}>お客様の前回情報を毎回思い出せない</li>
              <li className={styles.problemBandItem}>リピートのきっかけづくりが、難しい</li>
              <li className={styles.problemBandItem}>紙のカルテ管理が、限界</li>
              <li className={styles.problemBandItem}>LINE運用に時間がかかりすぎる</li>
            </ul>
          </div>
          <div className={styles.problemSolution}>
            <p className={styles.problemSolutionText}>
              <strong>SalonRink Concierge</strong> が、その&ldquo;もったいない&rdquo;を、解決します。
            </p>
          </div>
        </div>
      </section>

      {/* FOR EVERYONE - 3視点(CUSTOMERS / STAFF / OWNERS) */}
      <section id="everyone" className={styles.everyone}>
        <a id="owners" aria-hidden="true"></a>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionKicker}>FOR EVERYONE</p>
            <h2 className={styles.sectionTitle}>お客様も、スタッフも、<br/>そしてあなたも。<br/>みんなが、続けたくなる仕組み。</h2>
            <p className={styles.sectionSub}>1人サロンのあなたが軸。<br/>でも、お客様とスタッフ(これから雇う方も)、それぞれの視点で考えました。</p>
          </div>

          <div className={styles.everyoneGrid}>
            {/* FOR CUSTOMERS */}
            <article className={styles.ecard}>
              <div className={styles.ecardTop}>
                <div className={styles.ecardTopIcon} aria-hidden="true">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="16" cy="12" r="5"/>
                    <path d="M6 26c0-5 4-9 10-9s10 4 10 9" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className={styles.ecardTopEyebrow}>FOR CUSTOMERS</div>
                <div className={styles.ecardTopHeadline}>お客様には、<br/>いつものLINEのまま</div>
              </div>
              <div className={styles.ecardBody}>
                <h3 className={styles.ecardTitle}>専用アプリ不要。<br/><span className={styles.ecardAccent}>お客様の負担ゼロ</span>。</h3>
                <p className={styles.ecardSub}>新しいアプリのインストールもログインも不要。お客様はいつものLINEでメッセージするだけ。</p>
                <div className={styles.ecardVisual}>
                  <div className={styles.ecardPhoto}>
                    <Image
                      src="/images/a204_customer.png"
                      alt="LINEで気軽に予約・相談"
                      width={220} height={260}
                      sizes="(max-width: 700px) 130px, 110px"
                    />
                  </div>
                  <ul className={styles.ecardChecks}>
                    <li>アプリ不要、LINEで完結</li>
                    <li>過去の好みが伝わってる安心感</li>
                    <li>次回提案も自然に届く</li>
                  </ul>
                </div>
                <div className={styles.ecardQuote}>
                  <span className={styles.ecardQuoteText}>「いつものLINEで予約できて、<br/>覚えていてくれるのが嬉しい」</span>
                </div>
              </div>
            </article>

            {/* FOR STAFF - 画像1枚で全面置換 */}
            <article className={`${styles.ecard} ${styles.ecardImageOnly}`}>
              <Image
                src="/images/a304_staff.png"
                alt="FOR STAFF - スタッフが増えても、いつもの品質で"
                width={440} height={520}
                sizes="(max-width: 1100px) 90vw, 360px"
                className={styles.ecardFullImage}
              />
            </article>

            {/* FOR OWNERS */}
            <article className={styles.ecard}>
              <div className={styles.ecardTop}>
                <div className={styles.ecardTopIcon} aria-hidden="true">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M4 24h24M7 20V14m6 6V8m6 12V12m6 8v-4" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className={styles.ecardTopEyebrow}>FOR OWNERS</div>
                <div className={styles.ecardTopHeadline}>あなたには、<br/>本業に集中できる時間を</div>
              </div>
              <div className={styles.ecardBody}>
                <h3 className={styles.ecardTitle}>カルテ作成・記憶・提案を<br/><span className={styles.ecardAccent}>自動化</span>。</h3>
                <p className={styles.ecardSub}>1人で全部やる時代の終わり。お客様情報の整理は仕組みに任せて、接客と提案に集中。</p>
                <div className={styles.ecardVisual}>
                  <ul className={styles.ecardChecks}>
                    {OWNER_BENEFITS.map((b, i) => (
                      <li key={i}><b>{b.title}</b>: {b.desc.length > 28 ? b.desc.slice(0, 28) + '…' : b.desc}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.ecardQuote}>
                  <span className={styles.ecardQuoteText}>「事務作業の時間が消えて、<br/>お客様と話す時間が増えた」</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* IN ACTION - 3 SCENES */}
      <section id="in-action" className={styles.inAction}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionKicker}>IN ACTION</p>
            <h2 className={styles.sectionTitle}>朝から夜まで、<br/>1日のサロン業務が、こう流れる。</h2>
            <p className={styles.sectionSub}>朝のサマリー、HPB予約取込、お客様呼出、夕方のリピート提案。<br/>すべてLINEひとつに、自然に流れていきます。</p>
          </div>
          <div className={styles.inActionGrid}>
            {IN_ACTION_SCENES.map((scene, i) => (
              <div key={i} className={styles.inActionCard}>
                <div className={styles.inActionTime}>{scene.time}</div>
                <h3 className={styles.inActionTitle}>{scene.title}</h3>
                <p className={styles.inActionBody}>{scene.desc}</p>
                <div className={styles.inActionTags}>
                  {scene.tags.map((tag, ti) => (
                    <span key={ti} className={styles.inActionTag}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION - v2 marketing-in: LINE × 業務レイヤー */}
      <section id="solution" className={styles.solution}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionKicker}>SOLUTION</p>
            <h2 className={styles.sectionTitle}>LINEを置き換えない。<br/>LINEに、&ldquo;<span className={styles.solutionAccent}>乗せる</span>&rdquo;。</h2>
            <p className={styles.sectionSub}>お客様も、あなたも、いつもの&ldquo;LINE&rdquo;のまま。<br/>その裏側だけ、業務レイヤーを乗せる仕組みです。</p>
          </div>

          <div className={styles.solCols}>
            {/* LEFT: いつものLINE */}
            <div className={styles.solCol}>
              <div className={styles.solColHead}>
                <span className={styles.solColKicker}>FRONT</span>
                <span className={styles.solColTitle}>いつもの、LINE</span>
              </div>
              <ul className={styles.solList}>
                <li className={styles.solFeat}>
                  <span className={styles.solFeatIcon} aria-hidden="true">💬</span>
                  <div className={styles.solFeatBody}>
                    <div className={styles.solFeatRow}>
                      <span className={styles.solFeatTitle}>お客様はLINEで、いつも通り</span>
                    </div>
                    <div className={styles.solFeatSub}>専用アプリ不要。お客様の負担ゼロで予約と相談ができる。</div>
                  </div>
                </li>
                <li className={styles.solFeat}>
                  <span className={styles.solFeatIcon} aria-hidden="true">📅</span>
                  <div className={styles.solFeatBody}>
                    <div className={styles.solFeatRow}>
                      <span className={styles.solFeatTitle}>予約も会話も、ぜんぶLINE</span>
                    </div>
                    <div className={styles.solFeatSub}>慣れ親しんだLINE上で、予約も連絡も完結。</div>
                  </div>
                </li>
                <li className={styles.solFeat}>
                  <span className={styles.solFeatIcon} aria-hidden="true">🔔</span>
                  <div className={styles.solFeatBody}>
                    <div className={styles.solFeatRow}>
                      <span className={styles.solFeatTitle}>リマインドも、いつもの形で</span>
                    </div>
                    <div className={styles.solFeatSub}>「来月はいかがですか?」をLINEで自然に送れる。</div>
                  </div>
                </li>
                <li className={styles.solFeat}>
                  <span className={styles.solFeatIcon} aria-hidden="true">📝</span>
                  <div className={styles.solFeatBody}>
                    <div className={styles.solFeatRow}>
                      <span className={styles.solFeatTitle}>カウンセリングも、LINEで完結</span>
                    </div>
                    <div className={styles.solFeatSub}>事前ヒアリングをLINEで。来店時間がぐっと有効に。</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* CENTER: ARROW */}
            <div className={styles.solArrowWrap}>
              <div className={styles.solArrow} aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 14h16M16 8l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.solArrowLabel}>裏側で<br/>自動処理</div>
            </div>

            {/* RIGHT: 業務レイヤー */}
            <div className={`${styles.solCol} ${styles.solColBack}`}>
              <div className={styles.solColHead}>
                <span className={styles.solColKicker}>BACK</span>
                <span className={styles.solColTitle}>裏側の業務レイヤー</span>
              </div>
              <ul className={styles.solList}>
                <li className={`${styles.solFeat} ${styles.solFeatHighlight}`}>
                  <span className={styles.solFeatIcon} aria-hidden="true">📌</span>
                  <div className={styles.solFeatBody}>
                    <div className={styles.solFeatRow}>
                      <span className={styles.solFeatTitle}>HPB予約もLINE予約も、一画面で</span>
                      <span className={styles.solFeatPillNew}>NEW</span>
                    </div>
                    <div className={styles.solFeatSub}>ホットペッパービューティーとLINEの予約を、自動取込して一元管理。</div>
                  </div>
                </li>
                <li className={styles.solFeat}>
                  <span className={styles.solFeatIcon} aria-hidden="true">📂</span>
                  <div className={styles.solFeatBody}>
                    <div className={styles.solFeatRow}>
                      <span className={styles.solFeatTitle}>会話から、自動でカルテ構造化</span>
                    </div>
                    <div className={styles.solFeatSub}>LINEトークから、施術履歴・好み・敏感肌情報を自動抽出。</div>
                  </div>
                </li>
                <li className={styles.solFeat}>
                  <span className={styles.solFeatIcon} aria-hidden="true">🔍</span>
                  <div className={styles.solFeatBody}>
                    <div className={styles.solFeatRow}>
                      <span className={styles.solFeatTitle}>「@田中様」と打つだけで、過去履歴</span>
                    </div>
                    <div className={styles.solFeatSub}>LINEのトーク画面で過去施術・前回会話を瞬時に呼び出し。</div>
                  </div>
                </li>
                <li className={styles.solFeat}>
                  <span className={styles.solFeatIcon} aria-hidden="true">✉️</span>
                  <div className={styles.solFeatBody}>
                    <div className={styles.solFeatRow}>
                      <span className={styles.solFeatTitle}>次回ご案内の文案を、自動下書き</span>
                    </div>
                    <div className={styles.solFeatSub}>最適タイミングと文案を自動で。確認して送るだけ。</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer band */}
          <div className={styles.sband}>
            <div className={styles.sbandHd}>
              <span className={styles.sbandIcon} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h16M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className={styles.sbandTitle}>1人サロンの<br/>業務レイヤーが、整う</span>
            </div>
            <ul className={styles.sbandItems}>
              <li className={styles.sbandItem}>追加アプリ不要、LINEだけで完結</li>
              <li className={styles.sbandItem}>初期設定は5分、当日から運用開始</li>
              <li className={`${styles.sbandItem} ${styles.sbandItemHighlight}`}>HPB予約もLINEで一元管理</li>
              <li className={styles.sbandItem}>14日間無料、月¥1,980〜</li>
            </ul>
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
              alt="カルテ画面"
              width={720} height={480}
              sizes="(max-width: 980px) 90vw, 600px"
              className={styles.aiKarteImage}
            />
          </div>
          <div className={styles.aiKarteTextCol}>
            <p className={styles.aiKarteNum}>01 / AUTO</p>
            <h2 className={styles.aiKarteTitle}>自動でつくる、<br/>あなただけのカルテ。</h2>
            <p className={styles.aiKarteSub}>
              事前カウンセリングから自動解析。リスクの見落としを防ぎ、最適な提案で顧客満足度を高めます。
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
            <h2 className={styles.sectionTitle}>紙のカルテと、自動カルテ。<br/>差は、これくらい違う。</h2>
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
                  alt="自動カルテ"
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

      {/* FIRST CASE - キレイ鶴見店事例 */}
      <section id="cases" className={styles.cases}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionKicker}>FIRST CASE</p>
            <h2 className={styles.sectionTitle}>導入第一号、キレイ鶴見店。</h2>
            <p className={styles.sectionSub}>東京・神奈川エリアで白髪ケアに特化した小規模サロンが、SalonRink Concierge を実運用しています。</p>
          </div>

          <div className={styles.caseGrid}>
            {/* 左側: 店舗情報 */}
            <div className={styles.caseInfoCard}>
              <div className={styles.caseInfoBody}>
                <h3 className={styles.caseInfoTitle}>{CASE_STUDY.salon.name}</h3>
                <div className={styles.caseInfoMeta}>
                  <p className={styles.caseInfoRegion}>📍 {CASE_STUDY.salon.region}</p>
                  <p className={styles.caseInfoSpec}>{CASE_STUDY.salon.specialty}</p>
                  <p className={styles.caseInfoFeature}>{CASE_STUDY.salon.feature}</p>
                </div>
                <div className={styles.caseInfoLinks}>
                  {CASE_STUDY.salon.links.map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className={styles.caseInfoLink}>
                      {link.label} →
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* 右側: 導入効果 */}
            <div className={styles.caseEffectsCard}>
              <div className={styles.caseEffectsTag}>導入から1ヶ月 × 予約管理 LINE 完結 × カルテ自動化</div>
              <div className={styles.caseEffectsList}>
                {CASE_STUDY.effects.map((effect, i) => (
                  <div key={i} className={styles.caseEffect}>
                    <h4 className={styles.caseEffectTitle}>{effect.title}</h4>
                    <div className={styles.caseEffectComparison}>
                      <div className={styles.caseEffectBefore}>
                        <div className={styles.caseEffectLabel}>旧</div>
                        <p>{effect.before}</p>
                      </div>
                      <div className={styles.caseEffectArrow}>→</div>
                      <div className={styles.caseEffectAfter}>
                        <div className={styles.caseEffectLabel}>新</div>
                        <p>{effect.after}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.caseFootnote}>
            <p>※ 実運用中のサロンの声を、随時更新していきます。</p>
            <p className={styles.caseCta}>事例にご協力いただけるサロン様、<a href="mailto:support@salonrink.com">お問い合わせください</a></p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - 4 STEPS with images */}
      <section id="steps" className={styles.steps}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionKicker}>HOW IT WORKS</p>
            <h2 className={styles.sectionTitle}>使い方はカンタン、4ステップ。</h2>
            <p className={styles.sectionSub}>LINEでつながるだけで、自動化でサロン業務をもっとスマートに。</p>
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
            <h2 className={styles.sectionTitle}>他サービスとの比較</h2>
            <p className={styles.sectionSub}>1人サロンが選ぶべきは、どのタイプ?</p>
          </div>
          <div className={styles.compareTableWrap}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th></th>
                  <th className={styles.compareThSrk}>
                    <span className={styles.compareSrkLabel}>SalonRink<br/>Concierge</span>
                  </th>
                  <th>他サービス A<br/><span className={styles.compareThSub}>(予約管理型)</span></th>
                  <th>他サービス B<br/><span className={styles.compareThSub}>(予約系SaaS)</span></th>
                  <th>他サービス C<br/><span className={styles.compareThSub}>(カルテ専業型)</span></th>
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
                    <td>
                      <span className={row.c === '未対応' ? styles.compareNo : styles.compareValue}>{row.c}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.compareDisclaimer}>
            ※ 他サービス A / B / C は、予約管理SaaS・予約系SaaS・カルテ専業SaaSの一般的な水準を参考に記載しています。
            特定の競合サービスを指すものではありません。各サービスの料金・機能は変更される場合があります。
          </p>
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
                <a href="/register" className={`${styles.planCta} ${p.featured ? styles.planCtaFeatured : ''}`}>
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
            <a href="/register" className={styles.finalCtaPrimary}>14日間無料で試す<span className={styles.heroArrow} aria-hidden>→</span></a>
            <a href="https://lin.ee/UDNlEOAA" target="_blank" rel="noopener noreferrer" className={styles.finalCtaSecondary}>
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
            <a href="https://www.instagram.com/salonrink_concierge/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
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

      <StickyCTA />
    </main>
  );
}

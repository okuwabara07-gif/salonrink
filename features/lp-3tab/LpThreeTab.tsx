'use client';

/**
 * SalonRink Concierge — 3タブLP（お客様 / サロン / 代理店 ＋ about）
 * 配置: features/lp-3tab/LpThreeTab.tsx
 *
 * 画像は /public/lp/ に配置:
 *  /logo/salonrink-concierge-oval.png（既存）
 *  /lp/hero_customer.png /lp/hero_salon.png /lp/hero_partner.png
 *  /lp/after_home.png /lp/ui_karte.png /lp/ui_partner_sim.png /lp/ecosystem.png
 * 未配置でもアイボリー背景でフォールバックします。
 *
 * 法令ガード: 料金=Light¥1,980/Standard¥2,980/Premium¥4,580のみ / 実績数値なし(KPIは※シミュレーション値) /
 *  認証表記なし / 固有店名なし / 競合はA社B社C社 / 資料は「LINEで受け取る」/ 購入は「LINEで購入」/
 *  アレルギー・爪診断なし / Beauty DNA注記 / 禁止語なし / 色 お客様=コーラル サロン=緑 代理店=ゴールド(青なし)
 */

import { useState } from 'react';

const LINE_ADD = 'https://lin.ee/6hraAKM';
const DIAG_URL = '/tools/hair-check';
const MINIAPP = '/miniapp/products';

type Tab = 'customer' | 'salon' | 'agency';

export default function LpThreeTab() {
  const [tab, setTab] = useState<Tab>('customer');
  const go = (t: Tab) => { setTab(t); if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className={`sr3 sr3--${tab}`}>
      <style>{CSS}</style>

      <header className="sr3-header">
        <div className="sr3-wrap sr3-nav">
          <a className="sr3-brand" href="#top">
            <img className="sr3-emblem" src="/logo/salonrink-concierge-oval.png" alt="SalonRink Concierge" />
            <span className="sr3-wm">SalonRink<small>Concierge</small></span>
          </a>
          <div className="sr3-tabs" role="tablist">
            <button className={`sr3-tab ${tab === 'customer' ? 'is-on' : ''}`} onClick={() => go('customer')}>お客様</button>
            <button className={`sr3-tab ${tab === 'salon' ? 'is-on' : ''}`} onClick={() => go('salon')}>美容師・サロン</button>
            <button className={`sr3-tab ${tab === 'agency' ? 'is-on' : ''}`} onClick={() => go('agency')}>代理店</button>
          </div>
          <div className="sr3-navr">
            <a className="sr3-about" href="#about">サロンリンクとは</a>
            <a className="sr3-btn sr3-btn--line" href={LINE_ADD}>LINEで始める</a>
          </div>
        </div>
      </header>

      <main id="top">
        {tab === 'customer' && <CustomerTab />}
        {tab === 'salon' && <SalonTab />}
        {tab === 'agency' && <AgencyTab />}
        <AboutSection />
      </main>

      <footer className="sr3-footer">
        <div className="sr3-wrap">
          <div className="sr3-fcols">
            <a className="sr3-brand" href="#top">
              <img className="sr3-emblem" src="/logo/salonrink-concierge-oval.png" alt="" />
              <span className="sr3-wm">SalonRink<small>Concierge</small></span>
            </a>
            <nav className="sr3-flink">
              <a href="#about">サロンリンクとは</a><a href="#">運営会社</a><a href="#">プライバシーポリシー</a>
              <a href="#">利用規約</a><a href="#">特定商取引法に基づく表記</a><a href="#">お問い合わせ</a>
            </nav>
          </div>
          <p className="sr3-disc">
            ※「Beauty DNA」はDNA検査ではなく、ご回答にもとづく髪質・好みの傾向の可視化（メタファー）です。<br />
            ※本ページのKPI・シミュレーションは試算値（イメージ）で、効果・収益を保証するものではありません。<br />
            ※ヘアケアは「合うケア」のご提案です。他社名は A社／B社／C社 と表記。画像・お客様の声は同意のうえ掲載、または「イメージ」です。<br />
            © AOKAE合同会社　SalonRink Concierge
          </p>
        </div>
      </footer>

      <nav className="sr3-bottom">
        <button className="sr3-bt sr3-bt--c" onClick={() => go('customer')}>お客様のためのページ<span>理想の美容体験を、もっと自分らしく。</span></button>
        <button className="sr3-bt sr3-bt--s" onClick={() => go('salon')}>美容師・サロンのためのページ<span>サロンワークを、もっとスマートに。</span></button>
        <button className="sr3-bt sr3-bt--a" onClick={() => go('agency')}>代理店のためのページ<span>美容業界の未来を、一緒に創る。</span></button>
      </nav>
    </div>
  );
}

function CustomerTab() {
  const [pick, setPick] = useState<number | null>(null);
  const qs = ['パサつき・乾燥', '広がり・まとまらない', 'カラーの色落ち', '白髪が気になる'];
  return (
    <section className="sr3-tabpanel">
      <div className="sr3-hero sr3-hero--c">
        <div className="sr3-wrap sr3-hero-grid">
          <div>
            <span className="sr3-taglet">◍ LINEだけで完結</span>
            <div className="sr3-eye">For Customers</div>
            <h1 className="sr3-h1">あなたの<span className="sr3-accent">「美容データ」</span>を、<br />あなたの手に。</h1>
            <p className="sr3-lead">30秒の無料診断で、あなたの髪質や好みの傾向を可視化。あなたに「合うケア」と、ずっと通いたいサロンが見つかります。</p>
            <div className="sr3-cta">
              <a className="sr3-btn sr3-btn--coral" href={DIAG_URL}>無料で診断する</a>
              <a className="sr3-btn sr3-btn--ghost" href={LINE_ADD}>資料をLINEで受け取る</a>
            </div>
          </div>
          <Figure src="/lp/hero_customer.png" alt="サロンでスマホを使うお客様" ratio="4/5" />
        </div>
      </div>

      <Section bg="soft" eye="30 sec" title="たった30秒の無料診断" sub="いくつかの質問に答えるだけ。あなたの髪の「いま」と「合うケア」が分かります。">
        <div className="sr3-cards sr3-cards--coral">
          {[['1', '質問に答える', '髪の悩み・なりたい印象・ライフスタイルを30秒で。'],
            ['2', '傾向を可視化', '髪質と好みの傾向を「Beauty DNA」レーダーで表示。'],
            ['3', 'LINEで受け取る', '結果と「合うケア」の提案を、LINEでそのまま保存。']].map(([n, t, d]) => (
            <div className="sr3-card" key={n}><div className="sr3-ic sr3-ic--num">{n}</div><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
        <div className="sr3-diag">
          <div className="sr3-dq">Q1. いまの髪の、いちばんの悩みは？</div>
          <div className="sr3-chips">
            {qs.map((q, i) => (
              <button key={i} className={`sr3-chip ${pick === i ? 'is-sel' : ''}`} onClick={() => setPick(i)}>{q}</button>
            ))}
          </div>
          <div className="sr3-bar"><span style={{ width: pick === null ? '20%' : '40%' }} /></div>
          <p className="sr3-note">サンプル設問です（全5問・約30秒）。実際の質問は変わる場合があります。</p>
        </div>
      </Section>

      <Section eye="Beauty DNA" title="あなたの「好みの傾向」を、ひとつの指標に。" sub="">
        <div className="sr3-dna-grid">
          <div>
            <p className="sr3-prose">ツヤ・まとまり・うるおい・色持ち・扱いやすさ。5つの軸であなたの傾向を見える化し、毎回の施術やケア選びの"地図"になります。担当が代わっても、あなたの「いつもの」が伝わります。</p>
            <p className="sr3-note">※「Beauty DNA」はDNA検査ではありません。ご回答にもとづき髪質・好みの傾向を可視化した指標（メタファー）です。</p>
          </div>
          <div className="sr3-dna-card">
            <span className="sr3-dna-badge">Beauty DNA</span>
            <Radar />
            <p className="sr3-note">表示はイメージです。</p>
          </div>
        </div>
      </Section>

      <Section bg="ivory" eye="For You" title="あなたに「合うケア」" sub="診断結果をもとに、相性の良いアイテムをご提案。購入はLINEでそのまま完結します。">
        <div className="sr3-prods">
          {[['NAPLA', 'napla ケアシャンプー', '¥2,980', 'うるおい傾向の方へ「合うケア」'],
            ['MILBON', 'milbon トリートメント', '¥2,780', 'まとまり重視の方へ'],
            ['MAISON', 'Maison Orchidee セット', '¥4,580', 'トータルケアの方へ']].map(([brand, name, price, m], i) => (
            <div className="sr3-prod" key={i}>
              <div className={`sr3-pimg sr3-pimg--${i}`}>{brand}</div>
              <div className="sr3-pbody"><h3>{name}</h3><div className="sr3-pp">{price}<small>/月</small></div><div className="sr3-pm">{m}</div>
                <a className="sr3-btn sr3-btn--line sr3-btn--full" href={MINIAPP}>LINEで購入</a></div>
            </div>
          ))}
        </div>
        <div className="sr3-badges">
          <span className="sr3-rb">自宅配送</span>
          <span className="sr3-rb">直営サロン 受取 <b>−¥500</b></span>
          <span className="sr3-rb">加盟サロン 受取 <b>−¥300</b></span>
        </div>
        <p className="sr3-note sr3-center">価格・在庫は変更の場合があります。ヘアケアは「合うケア」のご提案で、効果を保証するものではありません。</p>
      </Section>

      <Section eye="After Visit" title="来店後も、ずっとつながる。" sub="次回までのケアや、合うアイテムをLINEでフォロー。世代を問わず、迷わずキレイが続きます。">
        <Figure src="/lp/after_home.png" alt="自宅でLINEを見るお客様" ratio="16/7" />
      </Section>

      <CtaBand label="Start on LINE" title="まずは、無料で診断してみませんか。" sub="結果も資料も、LINEだけで完結します。" cta="無料で診断する" href={DIAG_URL} />
    </section>
  );
}

function SalonTab() {
  return (
    <section className="sr3-tabpanel">
      <div className="sr3-hero sr3-hero--s">
        <div className="sr3-wrap sr3-hero-grid">
          <div>
            <span className="sr3-taglet">◍ お客様はLINEで完結＝登録が一瞬</span>
            <div className="sr3-eye">For Salons</div>
            <h1 className="sr3-h1">お客様が、<br /><span className="sr3-accent">また来たくなる。</span></h1>
            <p className="sr3-lead">LINE上に顧客の「記憶」を残し、施術のたびに関係を深める。AIカルテとパーソナライズ提案で、リピートと客単価の土台をつくります。</p>
            <div className="sr3-cta">
              <a className="sr3-btn sr3-btn--line" href={LINE_ADD}>14日間 無料で試す</a>
              <a className="sr3-btn sr3-btn--ghost" href={LINE_ADD}>資料をLINEで受け取る</a>
            </div>
            <div className="sr3-kpis">
              {[['顧客対応の工数', '−30', '分/日'], ['リピート率', '+25', '%'], ['客単価', '+15', '%']].map(([l, v, u]) => (
                <div className="sr3-kpi" key={l}><div className="sr3-kpi-l">{l}</div><div className="sr3-kpi-v">{v}<small>{u}</small></div><div className="sr3-note">※シミュレーション値</div></div>
              ))}
            </div>
          </div>
          <Figure src="/lp/hero_salon.png" alt="タブレットでカルテを見る美容師" ratio="4/5" />
        </div>
      </div>

      <Section bg="soft" eye="Problem" title="こんな悩み、ありませんか？" sub="">
        <div className="sr3-cards sr3-cards--coral">
          {[['🗂️', '顧客情報が紙任せ', '担当が代わると「いつもの」が分からない。引き継ぎに時間。'],
            ['⏱️', '連絡・予約がバラバラ', '電話・DM・予約サイトが分散。接客の時間が削られる。'],
            ['📉', 'リピートが安定しない', '「また来てね」で終わり。次回提案のきっかけが作れない。']].map(([i, t, d]) => (
            <div className="sr3-card" key={t}><div className="sr3-ic">{i}</div><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </Section>

      <Section eye="Features" title="LINEひとつで、サロン業務がまとまる" sub="">
        <div className="sr3-cards">
          {[['💬', '予約・相談が完結', 'お客様は使い慣れたLINEで。新アプリ不要、登録は一瞬。'],
            ['🗂️', 'AIカルテで記憶', 'カラー配合・髪質・好みを記録。担当が代わっても再現。'],
            ['⚙️', '連絡を自動化', 'リマインドや次回提案を自動化し、接客に集中できます。']].map(([i, t, d]) => (
            <div className="sr3-card" key={t}><div className="sr3-ic">{i}</div><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
        <Figure src="/lp/ui_karte.png" alt="AIカルテ・顧客管理画面（※画面はイメージ）" ratio="16/8" note="※画面はイメージです" />
      </Section>

      <Section bg="soft" eye="Pricing" title="初期費用0円・14日間無料" sub="">
        <div className="sr3-plans">
          {[['Light', '¥1,980', ['LINE予約・相談', '基本カルテ', 'リマインド配信'], false],
            ['Standard', '¥2,980', ['Lightの全機能', 'AIカルテ・提案', '物販 / SNS連携'], true],
            ['Premium', '¥4,580', ['Standardの全機能', '複数スタッフ管理', '優先サポート'], false]].map(([n, p, feats, feat]: any) => (
            <div className={`sr3-plan ${feat ? 'is-feat' : ''}`} key={n}>
              {feat && <span className="sr3-pbadge">人気</span>}
              <h3>{n}</h3><div className="sr3-price">{p}<small>/月</small></div>
              <ul>{feats.map((f: string) => <li key={f}>{f}</li>)}</ul>
              <a className={`sr3-btn sr3-btn--full ${feat ? 'sr3-btn--line' : 'sr3-btn--ghost'}`} href={LINE_ADD}>無料で試す</a>
            </div>
          ))}
        </div>
        <p className="sr3-note sr3-center">表示は税込・初期費用0円。価格・内容は予告なく変更する場合があります。</p>
      </Section>

      <Section eye="Compare" title="他サービスとの違い" sub="比較は当社調べ（2026年時点）。他社名は A社／B社／C社 と表記。">
        <div className="sr3-tblwrap">
          <table className="sr3-tbl">
            <thead><tr><th>項目</th><th className="own">SalonRink</th><th>A社</th><th>B社</th><th>C社</th></tr></thead>
            <tbody>
              {[['LINEで予約・相談が完結', '○', '○', '△', '×'],
                ['AIカルテ・提案', '○', '×', '△', '×'],
                ['物販・SNS連携', '○', '△', '×', '△'],
                ['初期費用', '0円', 'あり', 'あり', '0円']].map((r) => (
                <tr key={r[0]}><td>{r[0]}</td><td className="own">{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section bg="soft" eye="FAQ" title="よくあるご質問" sub="">
        <div className="sr3-faq">
          {[['導入に専門知識は必要ですか？', 'いいえ。お客様もサロンも普段のLINEで使えます。初期設定はサポートします。'],
            ['今の予約サイトと併用できますか？', '併用いただけます。ホットペッパービューティー等の取り込みにも対応。'],
            ['無料期間中に解約できますか？', '14日間の無料期間中はいつでも解約でき、費用はかかりません。']].map(([q, a]) => (
            <details className="sr3-q" key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </div>
      </Section>
    </section>
  );
}

function AgencyTab() {
  return (
    <section className="sr3-tabpanel">
      <div className="sr3-hero sr3-hero--a">
        <div className="sr3-wrap sr3-hero-grid">
          <div>
            <span className="sr3-taglet sr3-taglet--gold">◍ 導入先がLINEで完結＝売りやすい</span>
            <div className="sr3-eye">For Partners</div>
            <h1 className="sr3-h1">「売りやすい」を、<br /><span className="sr3-accent">仕組みにする。</span></h1>
            <p className="sr3-lead">説明がシンプルで、現場が使い続けられる。だから紹介が決まりやすい。SalonRink の代理店パートナーを募集しています。</p>
            <div className="sr3-cta">
              <a className="sr3-btn sr3-btn--gold" href={LINE_ADD}>相談を予約する</a>
              <a className="sr3-btn sr3-btn--ghost" href={LINE_ADD}>資料をLINEで受け取る</a>
            </div>
          </div>
          <Figure src="/lp/hero_partner.png" alt="代理店の商談（※画面はイメージ）" ratio="4/5" />
        </div>
      </div>

      <Section bg="soft" eye="Simulation" title="収益シミュレーション" sub="下記は試算例であり、収益を保証するものではありません。">
        <div className="sr3-sim">
          <div className="sr3-sim-row">
            <div className="sr3-sim-it"><div className="sr3-sim-v">10</div><div className="sr3-note">成約サロン数</div></div>
            <span className="sr3-sim-op">×</span>
            <div className="sr3-sim-it"><div className="sr3-sim-v">¥2,980</div><div className="sr3-note">月額（Standard例）</div></div>
            <span className="sr3-sim-op">→</span>
            <div className="sr3-sim-it"><div className="sr3-sim-v sr3-sim-v--g">継続収益</div><div className="sr3-note">紹介料率は別途ご案内</div></div>
          </div>
          <p className="sr3-note sr3-center">※試算例（イメージ）。実際の紹介料・条件は契約により異なります。収益を保証するものではありません。</p>
        </div>
        <Figure src="/lp/ui_partner_sim.png" alt="代理店 収益シミュレーション画面（※画面はイメージ）" ratio="16/9" note="※画面はイメージです。プラン単価は確定料金に準拠" />
      </Section>

      <Section eye="Why" title="なぜ「売りやすい」のか" sub="">
        <div className="sr3-cards">
          {[['🗣️', '説明がシンプル', '「今のLINEに記憶を足すだけ」。導入の心理的ハードルが低い。'],
            ['🔁', '使い続けられる', '現場が毎日使う設計だから定着し、継続につながる。'],
            ['💴', '初期費用0円', '14日無料で体験できるので、最初の一歩を勧めやすい。']].map(([i, t, d]) => (
            <div className="sr3-card" key={t}><div className="sr3-ic">{i}</div><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </Section>

      <Section bg="soft" eye="Flow" title="紹介のながれ" sub="">
        <div className="sr3-flow">
          {['①お問い合わせ', '②サロンへ紹介', '③14日無料で体験', '④契約・継続収益'].map((s, i) => (
            <span key={s}>{i > 0 && <em className="sr3-arrow">→</em>}<span className="sr3-step">{s}</span></span>
          ))}
        </div>
        <div className="sr3-center" style={{ marginTop: 30 }}><a className="sr3-btn sr3-btn--gold" href={LINE_ADD}>代理店の相談を予約する</a></div>
      </Section>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="sr3-about-sec">
      <div className="sr3-wrap">
        <div className="sr3-sechead"><span className="sr3-eye">About</span><h2>美容を、もっとフェアに。</h2>
          <p>美容のデータは、本来お客様自身のもの。それをお客様の手に戻し、サロンと一緒に育てていく。それが SalonRink の考え方です。</p></div>
        <div className="sr3-three">
          {[['🙂', 'お客様', '自分の髪のデータを持ち歩け、どこでも「合うケア」を受けられる。'],
            ['✂️', 'サロン', '記憶が積み上がり、関係が深まる。接客という価値に集中できる。'],
            ['🤝', 'みんな', '三者すべてにとって良い形で、美容の体験が循環していく。']].map(([e, t, d]) => (
            <div className="sr3-tcard" key={t}><div className="sr3-temoji">{e}</div><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
        <Figure src="/lp/ecosystem.png" alt="SalonRink エコシステム図" ratio="16/9" rounded />
      </div>
    </section>
  );
}

function Section({ children, eye, title, sub, bg }: any) {
  return (
    <section className={`sr3-section ${bg === 'soft' ? 'sr3-bg-soft' : bg === 'ivory' ? 'sr3-bg-ivory' : ''}`}>
      <div className="sr3-wrap">
        {(eye || title) && (
          <div className="sr3-sechead">
            {eye && <span className="sr3-eye">{eye}</span>}
            {title && <h2>{title}</h2>}
            {sub && <p>{sub}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

function Figure({ src, alt, ratio = '4/5', note, rounded }: any) {
  return (
    <figure className={`sr3-fig ${rounded ? 'is-rounded' : ''}`} style={{ aspectRatio: ratio }}>
      <img src={src} alt={alt} loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0'; }} />
      {note && <figcaption className="sr3-note">{note}</figcaption>}
    </figure>
  );
}

function CtaBand({ label, title, sub, cta, href }: any) {
  return (
    <div className="sr3-section"><div className="sr3-wrap"><div className="sr3-band">
      <span className="sr3-eye sr3-eye--gold">{label}</span>
      <h2>{title}</h2><p>{sub}</p>
      <a className="sr3-btn sr3-btn--line sr3-btn--lg" href={href}>{cta}</a>
    </div></div></div>
  );
}

function Radar() {
  return (
    <svg className="sr3-radar" viewBox="0 0 200 200" aria-hidden="true">
      <polygon points="100,20 173,72 145,158 55,158 27,72" fill="none" stroke="#ece5d8" />
      <polygon points="100,58 152,76 128,150 64,148 50,84" fill="none" stroke="#e7d7c8" />
      <polygon points="100,50 140,82 126,140 70,134 56,85" fill="rgba(197,112,92,.16)" stroke="#C5705C" strokeWidth="2.2" />
      <g fontSize="10" fill="#71776e" fontFamily="'Noto Sans JP',sans-serif" textAnchor="middle">
        <text x="100" y="12">ツヤ</text><text x="186" y="73">まとまり</text>
        <text x="150" y="176">うるおい</text><text x="50" y="176">色持ち</text><text x="13" y="73">扱いやすさ</text>
      </g>
    </svg>
  );
}

const CSS = `
.sr3{--bg:#fff;--ivory:#FAF0E0;--ivory2:#FBF5EA;--soft:#F8F5EF;--ink:#11140f;--ink2:#3a4340;--ink3:#71776e;
--gold:#C9A961;--gold-dk:#a88a44;--gold-soft:#f5ecd6;--gold-ink:#6b5226;--green:#06C755;--green-dk:#05a648;--green-soft:#e6f7ec;
--coral:#C5705C;--coral-dk:#a8543f;--coral-soft:#f7e7e1;--line:#ece5d8;--line2:#f0ebe2;
--serif:'Noto Serif JP',serif;--sans:'Noto Sans JP',sans-serif;--num:'Cormorant Garamond',serif;--label:'Cinzel',serif;
--acc:var(--coral);--acc-dk:var(--coral-dk);--acc-soft:var(--coral-soft);
font-family:var(--sans);color:var(--ink);background:var(--bg);line-height:1.78;-webkit-font-smoothing:antialiased}
.sr3--salon{--acc:var(--green);--acc-dk:var(--green-dk);--acc-soft:var(--green-soft)}
.sr3--agency{--acc:var(--gold);--acc-dk:var(--gold-dk);--acc-soft:var(--gold-soft)}
.sr3 *{box-sizing:border-box}
.sr3-wrap{max-width:1140px;margin:0 auto;padding:0 24px}
.sr3 h1,.sr3 h2,.sr3 h3{font-family:var(--serif);font-weight:700;line-height:1.34;margin:0}
.sr3 a{color:inherit;text-decoration:none}
.sr3-eye{font-family:var(--label);font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--acc-dk)}
.sr3--agency .sr3-eye{color:var(--gold-dk)}
.sr3-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;cursor:pointer;font-family:var(--sans);font-weight:700;font-size:15px;padding:14px 26px;border-radius:999px;transition:transform .15s,background .2s}
.sr3-btn:hover{transform:translateY(-1px)}
.sr3-btn--line{background:var(--green);color:#fff}.sr3-btn--line:hover{background:var(--green-dk)}
.sr3-btn--coral{background:var(--coral);color:#fff}.sr3-btn--coral:hover{background:var(--coral-dk)}
.sr3-btn--gold{background:var(--gold);color:#fff}.sr3-btn--gold:hover{background:var(--gold-dk)}
.sr3-btn--ghost{background:#fff;color:var(--ink);border:1px solid var(--line)}.sr3-btn--ghost:hover{border-color:var(--gold)}
.sr3-btn--full{width:100%}.sr3-btn--lg{font-size:16px;padding:16px 32px}
.sr3-header{position:sticky;top:0;z-index:60;background:rgba(255,255,255,.9);backdrop-filter:blur(12px);border-bottom:1px solid var(--line2)}
.sr3-nav{display:flex;align-items:center;justify-content:space-between;height:76px;gap:18px}
.sr3-brand{display:flex;align-items:center;gap:10px}
.sr3-emblem{height:40px;width:auto}
.sr3-wm{font-family:var(--serif);font-weight:600;font-size:20px;line-height:1}
.sr3-wm small{display:block;font-family:var(--label);font-size:8.5px;letter-spacing:.32em;color:var(--gold-dk);margin-top:3px;text-transform:uppercase}
.sr3-tabs{display:flex;gap:4px;background:var(--soft);padding:5px;border-radius:999px}
.sr3-tab{border:none;background:transparent;font-family:var(--sans);font-weight:700;font-size:14px;color:var(--ink3);padding:9px 18px;border-radius:999px;cursor:pointer;white-space:nowrap}
.sr3-tab.is-on{background:#fff;box-shadow:0 2px 8px rgba(17,20,15,.08)}
.sr3--customer .sr3-tab.is-on{color:var(--coral-dk)}.sr3--salon .sr3-tab.is-on{color:var(--green-dk)}.sr3--agency .sr3-tab.is-on{color:var(--gold-dk)}
.sr3-navr{display:flex;align-items:center;gap:16px}
.sr3-about{font-size:13px;color:var(--ink2)}.sr3-about:hover{color:var(--gold-dk)}
.sr3-navr .sr3-btn{padding:10px 18px;font-size:14px}
.sr3-hero{padding:74px 0 64px}
.sr3-hero--c{background:radial-gradient(120% 90% at 82% 0,var(--coral-soft),#fff 56%)}
.sr3-hero--s{background:radial-gradient(120% 90% at 82% 0,var(--green-soft),#fff 56%)}
.sr3-hero--a{background:radial-gradient(120% 90% at 82% 0,var(--gold-soft),#fff 56%)}
.sr3-hero-grid{display:grid;grid-template-columns:1.04fr .96fr;gap:50px;align-items:center}
.sr3-h1{font-size:clamp(33px,4.6vw,56px);margin:16px 0 18px}
.sr3-accent{color:var(--acc-dk)}.sr3--agency .sr3-accent{color:var(--gold-dk)}
.sr3-lead{font-size:17px;color:var(--ink2);max-width:31em;margin:0 0 28px}
.sr3-taglet{display:inline-flex;align-items:center;gap:8px;background:var(--acc-soft);color:var(--acc-dk);font-size:12.5px;font-weight:700;padding:7px 15px;border-radius:999px;margin-bottom:14px}
.sr3-taglet--gold{background:var(--gold-soft);color:var(--gold-ink)}
.sr3-cta{display:flex;gap:12px;flex-wrap:wrap}
.sr3-fig{position:relative;width:100%;border-radius:22px;overflow:hidden;background:linear-gradient(150deg,var(--ivory),#fff);border:1px solid var(--line2);box-shadow:0 24px 60px rgba(17,20,15,.10);justify-self:center}
.sr3-fig.is-rounded{box-shadow:none;border:none;background:transparent}
.sr3-fig img{width:100%;height:100%;object-fit:cover;display:block}
.sr3-fig figcaption{position:absolute;left:10px;bottom:8px;background:rgba(255,255,255,.85);padding:3px 8px;border-radius:8px}
.sr3-section{padding:80px 0}.sr3-bg-soft{background:var(--soft)}.sr3-bg-ivory{background:linear-gradient(180deg,var(--ivory2),var(--ivory))}
.sr3-sechead{text-align:center;max-width:720px;margin:0 auto 44px}
.sr3-sechead h2{font-size:clamp(25px,3vw,37px);margin:10px 0}.sr3-sechead p{color:var(--ink3);font-size:15px}
.sr3-prose{font-size:15px;color:var(--ink2)}
.sr3-note{font-size:11.5px;color:var(--ink3);line-height:1.7}.sr3-center{text-align:center;margin-top:16px}
.sr3-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.sr3-card{background:#fff;border:1px solid var(--line2);border-radius:22px;padding:28px;transition:transform .18s,box-shadow .18s}
.sr3-card:hover{transform:translateY(-3px);box-shadow:0 12px 30px rgba(17,20,15,.06)}
.sr3-ic{width:48px;height:48px;border-radius:14px;background:var(--gold-soft);color:var(--gold-dk);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:14px}
.sr3-ic--num{font-family:var(--num);font-weight:700;font-size:24px}
.sr3-cards--coral .sr3-ic{background:var(--coral-soft);color:var(--coral-dk)}
.sr3-card h3{font-size:17px;margin-bottom:7px}.sr3-card p{font-size:14px;color:var(--ink2)}
.sr3-diag{max-width:620px;margin:34px auto 0;background:#fff;border:1px solid var(--line2);border-radius:22px;padding:30px;box-shadow:0 12px 30px rgba(17,20,15,.05);text-align:center}
.sr3-dq{font-family:var(--serif);font-weight:700;font-size:19px;margin-bottom:18px}
.sr3-chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.sr3-chip{border:1px solid var(--line);background:#fff;color:var(--ink2);font-family:var(--sans);font-size:14px;padding:10px 18px;border-radius:999px;cursor:pointer;transition:.15s}
.sr3-chip:hover{border-color:var(--coral)}.sr3-chip.is-sel{background:var(--coral);color:#fff;border-color:var(--coral)}
.sr3-bar{height:5px;background:var(--line2);border-radius:999px;margin:20px auto 8px;max-width:300px;overflow:hidden}
.sr3-bar span{display:block;height:100%;background:var(--coral);border-radius:999px;transition:width .35s}
.sr3-dna-grid{display:grid;grid-template-columns:1fr 1fr;gap:46px;align-items:center}
.sr3-dna-card{background:#fff;border:1px solid var(--line2);border-radius:22px;padding:30px;text-align:center;box-shadow:0 12px 30px rgba(17,20,15,.05)}
.sr3-dna-badge{display:inline-block;font-family:var(--label);letter-spacing:.18em;font-size:11px;color:var(--coral-dk);background:var(--coral-soft);padding:5px 15px;border-radius:999px;margin-bottom:12px}
.sr3-radar{width:230px;height:230px;display:block;margin:0 auto}
.sr3-prods{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.sr3-prod{background:#fff;border:1px solid var(--line2);border-radius:22px;overflow:hidden;transition:transform .18s}.sr3-prod:hover{transform:translateY(-3px)}
.sr3-pimg{aspect-ratio:5/4;display:flex;align-items:center;justify-content:center;font-family:var(--label);letter-spacing:.16em;font-size:13px;color:#fff}
.sr3-pimg--0{background:linear-gradient(150deg,#caa46a,#a8854a)}.sr3-pimg--1{background:linear-gradient(150deg,#c98c7a,#a8543f)}.sr3-pimg--2{background:linear-gradient(150deg,#7fa68f,#4f7a63)}
.sr3-pbody{padding:16px}.sr3-prod h3{font-size:15px;margin-bottom:3px}
.sr3-pp{font-family:var(--num);font-size:30px;font-weight:700;color:var(--gold-dk)}.sr3-pp small{font-size:13px;color:var(--ink3)}
.sr3-pm{font-size:11.5px;color:var(--ink3);margin:5px 0 12px}
.sr3-badges{display:flex;flex-wrap:wrap;gap:9px;justify-content:center;margin-top:28px}
.sr3-rb{background:#fff;border:1px solid var(--line);border-radius:999px;padding:9px 17px;font-size:12.5px;color:var(--ink2)}.sr3-rb b{color:var(--green-dk)}
.sr3-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:32px;max-width:560px}
.sr3-kpi{background:#fff;border:1px solid var(--line2);border-radius:14px;padding:18px 14px;text-align:center}
.sr3-kpi-l{font-size:12px;color:var(--ink3)}.sr3-kpi-v{font-family:var(--num);font-weight:700;font-size:40px;color:var(--gold-dk);line-height:1.05;margin:3px 0}.sr3-kpi-v small{font-size:15px}
.sr3-plans{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.sr3-plan{background:#fff;border:1px solid var(--line2);border-radius:22px;padding:30px;text-align:center;position:relative}
.sr3-plan.is-feat{border:2px solid var(--green);box-shadow:0 12px 30px rgba(17,20,15,.06)}
.sr3-pbadge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--green);color:#fff;font-size:11px;font-weight:700;padding:4px 15px;border-radius:999px}
.sr3-plan h3{font-size:16px;color:var(--green-dk)}
.sr3-price{font-family:var(--num);font-size:46px;font-weight:700;margin:6px 0;line-height:1.05}.sr3-price small{font-size:15px;color:var(--ink3)}
.sr3-plan ul{list-style:none;text-align:left;margin:16px 0;padding:0;display:grid;gap:9px;font-size:13.5px;color:var(--ink2)}
.sr3-plan li::before{content:"✓";color:var(--green-dk);font-weight:700;margin-right:8px}
.sr3-tblwrap{overflow-x:auto}
.sr3-tbl{width:100%;border-collapse:collapse;background:#fff;border-radius:22px;overflow:hidden;border:1px solid var(--line2);font-size:14px}
.sr3-tbl th,.sr3-tbl td{padding:16px;text-align:center;border-bottom:1px solid var(--line2)}
.sr3-tbl th{background:var(--ivory);font-family:var(--serif);font-weight:600}
.sr3-tbl td:first-child,.sr3-tbl th:first-child{text-align:left;color:var(--ink2)}
.sr3-tbl .own{background:var(--gold-soft);font-weight:700;color:var(--gold-ink)}
.sr3-sim{background:#fff;border:1px solid var(--line2);border-radius:22px;padding:32px;max-width:780px;margin:0 auto;box-shadow:0 12px 30px rgba(17,20,15,.05)}
.sr3-sim-row{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:18px}
.sr3-sim-it{text-align:center}.sr3-sim-v{font-family:var(--num);font-size:40px;font-weight:700;color:var(--gold-dk);line-height:1}.sr3-sim-v--g{color:var(--green-dk)}
.sr3-sim-op{font-family:var(--num);font-size:30px;color:var(--gold)}
.sr3-flow{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;align-items:center}
.sr3-step{background:var(--gold-soft);color:var(--gold-ink);font-weight:700;font-size:13px;padding:11px 18px;border-radius:999px}
.sr3-arrow{color:var(--gold);font-style:normal;margin:0 4px}
.sr3-faq{max-width:760px;margin:0 auto}
.sr3-q{background:#fff;border:1px solid var(--line2);border-radius:14px;margin-bottom:12px;overflow:hidden}
.sr3-q summary{padding:18px 22px;font-weight:500;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:12px;align-items:center}
.sr3-q summary::-webkit-details-marker{display:none}.sr3-q summary::after{content:"+";color:var(--gold-dk);font-size:20px}.sr3-q[open] summary::after{content:"–"}
.sr3-q p{padding:0 22px 20px;color:var(--ink2);font-size:14px;margin:0}
.sr3-about-sec{padding:80px 0;background:linear-gradient(180deg,var(--ivory2),var(--ivory))}
.sr3-three{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-bottom:30px}
.sr3-tcard{background:#fff;border:1px solid var(--line2);border-radius:22px;padding:28px;text-align:center}
.sr3-temoji{font-size:30px;margin-bottom:10px}.sr3-tcard h3{font-size:17px}.sr3-tcard p{font-size:13.5px;color:var(--ink2);margin-top:6px}
.sr3-band{background:linear-gradient(135deg,#1a241d,#11140f);color:#fff;text-align:center;border-radius:28px;padding:62px 24px;position:relative;overflow:hidden}
.sr3-band h2{color:#fff;font-size:clamp(25px,3.2vw,38px);margin-top:10px}.sr3-band p{color:rgba(255,255,255,.72);margin:14px 0 26px}
.sr3-eye--gold{color:var(--gold)}
.sr3-footer{background:var(--soft);padding:52px 0 40px;font-size:13px;color:var(--ink3)}
.sr3-fcols{display:flex;justify-content:space-between;flex-wrap:wrap;gap:24px;align-items:flex-start}
.sr3-flink{display:flex;gap:20px;flex-wrap:wrap}.sr3-flink a:hover{color:var(--gold-dk)}
.sr3-disc{margin-top:24px;padding-top:20px;border-top:1px solid var(--line2);font-size:11.5px;line-height:1.85}
.sr3-bottom{display:grid;grid-template-columns:repeat(3,1fr);gap:0}
.sr3-bt{border:none;cursor:pointer;color:#fff;font-family:var(--serif);font-weight:700;font-size:15px;padding:26px 20px;text-align:left;display:flex;flex-direction:column;gap:4px}
.sr3-bt span{font-family:var(--sans);font-weight:400;font-size:12px;opacity:.85}
.sr3-bt--c{background:var(--coral)}.sr3-bt--s{background:var(--green-dk)}.sr3-bt--a{background:var(--gold-dk)}
.sr3-bt:hover{filter:brightness(1.06)}
@media(max-width:900px){
  .sr3-hero-grid,.sr3-dna-grid{grid-template-columns:1fr;gap:34px}
  .sr3-cards,.sr3-prods,.sr3-plans,.sr3-three{grid-template-columns:1fr}
  .sr3-nav{flex-wrap:wrap;height:auto;padding:12px 0;gap:12px}.sr3-tabs{order:3;width:100%;justify-content:center;overflow-x:auto}
  .sr3-about{display:none}.sr3-kpis{max-width:none}.sr3-bottom{grid-template-columns:1fr}
}
`;

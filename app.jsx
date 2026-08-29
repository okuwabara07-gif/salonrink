// app.jsx — 5本柱 × 各3枚（画像①表紙／画像②詳細／③リール動画）のモックアップ
const {
  DesignCanvas, DCSection, DCArtboard, DCPostIt,
  FormatACover, FormatADetail, FormatAReel,
  FormatBCover, FormatBDetail, FormatBReel,
  FormatCCover, FormatCDetail, FormatCReel,
  FormatDCover, FormatDDetail, FormatDReel,
  FormatECover, FormatEDetail, FormatEReel,
} = window;

const IG_W = 1080;
const IG_H = 1920;

// ── 写真プール（カテゴリ別ローテーション）設定 ───────────────────────
// rename-pool.zsh で assets/photos/pool/<slug>-01.png .. -NN.png に統一済み前提。
// 各カテゴリの「実際の枚数」。スクリプトの result 表示と合わせる。
window.PHOTO_CATS = {
  'hair-gloss': 7, 'hair-fade': 5, 'hair-frizz': 5,
  'finish-back': 5, 'finish-profile': 5,
  'salon': 5, 'counseling': 5,
  'treatment': 3, 'backwash': 3, 'blowdry': 3,
  'interior': 3, 'chair': 3, 'product': 4,
  'tablet': 3, 'reception': 2,
};
// 各枠で使うカテゴリ（複数指定＝連結してローテーション）。ここを編集すれば自由に再配分できる。
window.PHOTO_SLOTS = {
  'a1-photo':  ['counseling', 'salon', 'tablet', 'reception'], // 柱⑤ 導入ストーリー
  'b1-photo':  ['interior', 'chair'],                          // 柱④ 失敗談（暗い系のみ）
  'e1-photo':  ['hair-fade', 'hair-frizz', 'hair-gloss'],      // 柱③ お悩み（悩み→艶）
  'c2-photo':  ['finish-back', 'finish-profile', 'treatment', 'blowdry'], // 柱① 仕上がり/施術
  'c1-before': ['hair-fade', 'hair-frizz'],                    // 柱① Before
  'c1-after':  ['hair-gloss', 'finish-back', 'finish-profile'],// 柱① After
  'c3-before': ['hair-frizz', 'hair-fade'],                    // 柱① リールBefore
  'c3-after':  ['hair-gloss', 'finish-profile', 'backwash'],   // 柱① リールAfter
};
// 全ページの写真を一括でずらす。0→1→2… と変えて開き直すとローテーション。
window.PHOTO_ROTATE = 0;
// 特定の枠を1枚に固定したいとき（例 柱①を実写ペアに）。値は pool 内のファイル名（拡張子なし）。
//   { 'c1-before': 'real-before', 'c1-after': 'real-after' }
window.PHOTO_FIXED = {};

window.photoSrc = function (id) {
  var base = 'assets/photos/pool/';
  var fx = window.PHOTO_FIXED || {};
  if (fx[id]) return base + fx[id] + '.png';
  var cats = (window.PHOTO_SLOTS || {})[id] || ['salon'];
  var list = [];
  for (var c = 0; c < cats.length; c++) {
    var cat = cats[c], n = (window.PHOTO_CATS || {})[cat] || 0;
    for (var k = 1; k <= n; k++) list.push(cat + '-' + (k < 10 ? '0' + k : '' + k));
  }
  if (!list.length) return base + 'salon-01.png';
  var pick = list[(window.PHOTO_ROTATE || 0) % list.length];
  return base + pick + '.png';
};
// ──────────────────────────────────────────────────────────────────

function App() {
  return (
    <DesignCanvas>
      <DCSection
        id="pillar-1"
        title="柱① Before→After ── エディトリアル・ホワイト"
        subtitle="症例の記録を雑誌風に。差し替え：CASE番号・写真2点・見出し・カルテ項目"
      >
        <DCArtboard id="c-cover" label="① 画像・表紙" width={IG_W} height={IG_H}><FormatCCover /></DCArtboard>
        <DCArtboard id="c-detail" label="② 画像・詳細" width={IG_W} height={IG_H}><FormatCDetail /></DCArtboard>
        <DCArtboard id="c-reel" label="③ リール動画（動きのイメージ）" width={IG_W} height={IG_H}><FormatCReel /></DCArtboard>
      </DCSection>

      <DCSection
        id="pillar-2"
        title="柱② 美容師あるある ── あるあるノート"
        subtitle="共感→保存→シェアを狙うテンポ重視。差し替え：#番号・あるある7項目"
      >
        <DCArtboard id="d-cover" label="① 画像・表紙" width={IG_W} height={IG_H}><FormatDCover /></DCArtboard>
        <DCArtboard id="d-detail" label="② 画像・詳細" width={IG_W} height={IG_H}><FormatDDetail /></DCArtboard>
        <DCArtboard id="d-reel" label="③ リール動画（動きのイメージ）" width={IG_W} height={IG_H}><FormatDReel /></DCArtboard>
      </DCSection>

      <DCSection
        id="pillar-3"
        title="柱③ お客様の悩み解決 ── お悩み相談室"
        subtitle="Q&A形式で専門性と信頼を打ち出す。差し替え：Q番号・質問・回答3項目・写真"
      >
        <DCArtboard id="e-cover" label="① 画像・表紙（Q）" width={IG_W} height={IG_H}><FormatECover /></DCArtboard>
        <DCArtboard id="e-detail" label="② 画像・詳細（A）" width={IG_W} height={IG_H}><FormatEDetail /></DCArtboard>
        <DCArtboard id="e-reel" label="③ リール動画（動きのイメージ）" width={IG_W} height={IG_H}><FormatEReel /></DCArtboard>
      </DCSection>

      <DCSection
        id="pillar-4"
        title="柱④ サロン経営の失敗談 ── ミッドナイト・ゴールド"
        subtitle="黒×金でドラマ性とフックを最大化。差し替え：FILE番号・見出し・失敗3項目・写真"
      >
        <DCArtboard id="b-cover" label="① 画像・表紙" width={IG_W} height={IG_H}><FormatBCover /></DCArtboard>
        <DCArtboard id="b-detail" label="② 画像・詳細" width={IG_W} height={IG_H}><FormatBDetail /></DCArtboard>
        <DCArtboard id="b-reel" label="③ リール動画（動きのイメージ）" width={IG_W} height={IG_H}><FormatBReel /></DCArtboard>
      </DCSection>

      <DCSection
        id="pillar-5"
        title="柱⑤ SalonRink導入ストーリー ── アイボリー・クレスト"
        subtitle="ロゴの世界観で上品に信頼を語る。差し替え：VOL番号・見出し・Before/After3項目・写真"
      >
        <DCArtboard id="a-cover" label="① 画像・表紙" width={IG_W} height={IG_H}><FormatACover /></DCArtboard>
        <DCArtboard id="a-detail" label="② 画像・詳細" width={IG_W} height={IG_H}><FormatADetail /></DCArtboard>
        <DCArtboard id="a-reel" label="③ リール動画（動きのイメージ）" width={IG_W} height={IG_H}><FormatAReel /></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

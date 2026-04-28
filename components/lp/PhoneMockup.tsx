export default function PhoneMockup() {
  return (
    <div className="relative mx-auto" style={{ width: "280px" }}>
      {/* iPhone 黒い外枠（ベゼル） */}
      <div className="relative bg-slate-900 rounded-[48px] p-3 shadow-2xl">
        {/* 画面領域（overflow を完全に制御） */}
        <div
          className="relative bg-white rounded-[36px] overflow-hidden"
          style={{ aspectRatio: "9/19.5" }}
        >
          {/* Dynamic Island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-7 bg-slate-900 rounded-full z-20" />

          {/* ステータスバー */}
          <div className="absolute top-0 left-0 right-0 px-6 py-3 flex justify-between items-center text-xs font-semibold text-slate-900 z-10">
            <span>9:41</span>
            <div className="flex gap-1 items-center">
              <span>📶</span>
              <span>🔋</span>
            </div>
          </div>

          {/* スクリーンコンテンツ */}
          <div className="absolute inset-0 pt-12 pb-4 px-4 flex flex-col">
            {/* ヘッダー */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-slate-500">こんにちは</p>
                <h3 className="text-lg font-bold text-slate-900">
                  キレイ鶴見店
                </h3>
              </div>
              <div className="w-9 h-9 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-pink-500 text-sm">🔔</span>
              </div>
            </div>

            {/* サマリーカード */}
            <div className="bg-pink-100 rounded-2xl p-3 mb-4 flex justify-between">
              <div>
                <p className="text-[10px] text-slate-600 mb-1">本日の予約</p>
                <p className="text-2xl font-bold text-slate-900">
                  8<span className="text-xs font-normal ml-1">件</span>
                </p>
                <p className="text-[9px] text-slate-500 mt-1">前週比 +2件</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-600 mb-1">本日の売上</p>
                <p className="text-lg font-bold text-slate-900">¥86,400</p>
                <p className="text-[9px] text-slate-500 mt-1">目標達成 96%</p>
              </div>
            </div>

            {/* 予約リスト */}
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-bold text-slate-900">直近の予約</p>
                <p className="text-[9px] text-pink-500">すべて見る ›</p>
              </div>

              <div className="space-y-2">
                {/* 予約1 */}
                <div className="bg-white border border-slate-100 rounded-xl p-2 flex items-center gap-2 shadow-sm">
                  <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center text-xs font-bold text-pink-700">
                    M
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-900 truncate">
                      松本 美咲 様
                    </p>
                    <p className="text-[9px] text-slate-500 truncate">
                      カラー＋カット
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-900">
                      ¥12,800
                    </p>
                    <p className="text-[8px] text-pink-500 bg-pink-50 px-1 rounded mt-0.5">
                      14:00
                    </p>
                  </div>
                </div>

                {/* 予約2 */}
                <div className="bg-white border border-slate-100 rounded-xl p-2 flex items-center gap-2 shadow-sm">
                  <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                    S
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-900 truncate">
                      佐藤 結衣 様
                    </p>
                    <p className="text-[9px] text-slate-500 truncate">
                      カット＋トリートメント
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-900">
                      ¥8,400
                    </p>
                    <p className="text-[8px] text-blue-500 bg-blue-50 px-1 rounded mt-0.5">
                      15:30
                    </p>
                  </div>
                </div>

                {/* 予約3 */}
                <div className="bg-white border border-slate-100 rounded-xl p-2 flex items-center gap-2 shadow-sm">
                  <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold text-green-700">
                    A
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-900 truncate">
                      青木 麻衣 様
                    </p>
                    <p className="text-[9px] text-slate-500 truncate">
                      パーマ
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-900">
                      ¥14,200
                    </p>
                    <p className="text-[8px] text-green-500 bg-green-50 px-1 rounded mt-0.5">
                      17:00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ボトムナビ（画面内に完全収納） */}
            <div className="bg-white border-t border-slate-100 -mx-4 px-2 pt-2 pb-1 flex justify-around mt-3">
              <NavItem icon="🏠" label="ホーム" active />
              <NavItem icon="📅" label="予約" />
              <NavItem icon="👤" label="顧客" />
              <NavItem icon="🔗" label="連携" />
              <NavItem icon="⋯" label="その他" />
            </div>
          </div>

          {/* ホームインジケーター */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-900 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-base">{icon}</span>
      <span
        className={`text-[8px] ${
          active ? "text-pink-500 font-semibold" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

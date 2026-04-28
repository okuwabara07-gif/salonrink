import Image from "next/image";

type Step = {
  number: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  tone: "pink" | "purple";
};

const STEPS: Step[] = [
  {
    number: "01",
    title: "LINE友だち追加",
    description: "QRコード or URLから",
    image: "/images/lp/setup/01-line-friend.jpg",
    alt: "LINE友だち追加用QRコードが表示されたスマートフォン",
    tone: "pink",
  },
  {
    number: "02",
    title: "メニュー選択",
    description: "画像と価格でシンプル選択",
    image: "/images/lp/setup/02-menu-select.jpg",
    alt: "サロンメニューを確認する手元",
    tone: "pink",
  },
  {
    number: "03",
    title: "スタッフ指名(任意)",
    description: "指名なしも選択可能",
    image: "/images/lp/setup/03-staff-select.jpg",
    alt: "笑顔の美容師スタッフ",
    tone: "pink",
  },
  {
    number: "04",
    title: "日時選択",
    description: "カレンダーから空き枠を選ぶ",
    image: "/images/lp/setup/04-datetime-select.jpg",
    alt: "予約日時を選ぶカレンダー",
    tone: "pink",
  },
  {
    number: "05",
    title: "予約内容確認",
    description: "メニュー・スタッフ・日時を一覧",
    image: "/images/lp/setup/05-confirm.jpg",
    alt: "予約内容を確認するタブレット画面",
    tone: "purple",
  },
  {
    number: "06",
    title: "予約完了通知",
    description: "即座にLINEへ確定通知",
    image: "/images/lp/setup/06-complete.jpg",
    alt: "予約完了通知が届いたスマートフォン",
    tone: "purple",
  },
  {
    number: "07",
    title: "前日リマインド",
    description: "自動メッセージで来店忘れ防止",
    image: "/images/lp/setup/07-reminder.jpg",
    alt: "前日リマインドが届いたスマートフォン",
    tone: "purple",
  },
  {
    number: "08",
    title: "来店・施術後フォロー",
    description: "マイページで履歴管理",
    image: "/images/lp/setup/08-followup.jpg",
    alt: "施術後のサンキューカード",
    tone: "purple",
  },
];

const STATS = [
  { label: "お客様の操作", value: "約30秒" },
  { label: "受付対応", value: "24時間" },
  { label: "サロンの操作", value: "ゼロ" },
];

export default function SetupFlow() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* セクション見出し */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            予約から来店までの流れ
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            お客様はLINEから30秒で完結。サロン側の操作はゼロ。
          </p>
        </div>

        {/* 8カードグリッド */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-12">
          {STEPS.map((step) => {
            const cardBg =
              step.tone === "pink" ? "bg-pink-50" : "bg-purple-50";
            const numberColor =
              step.tone === "pink" ? "text-pink-500" : "text-purple-500";

            return (
              <article
                key={step.number}
                className={`${cardBg} rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300`}
              >
                {/* 画像 */}
                <div className="relative aspect-[4/3] bg-gray-100">
                  <Image
                    src={step.image}
                    alt={step.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>

                {/* テキスト部分 */}
                <div className="p-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-xl font-bold ${numberColor}`}>
                      {step.number}
                    </span>
                    <h3 className="text-sm md:text-base font-bold text-gray-900 leading-tight">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed pl-7">
                    {step.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* 統計バッジ（3カード） */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-800 text-white rounded-xl px-8 py-5 text-center shadow-md min-w-[160px]"
            >
              <p className="text-xs text-slate-300 mb-1">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

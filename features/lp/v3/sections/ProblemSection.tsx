'use client';

import FadeUp from '@/features/lp/v3/components/FadeUp';
import ImageSlot from '@/features/lp/v3/components/ImageSlot';

const PROBLEMS = [
  { ph: '悩む美容師の写真', t: ['アレルギーや体調の確認が', '毎回不安...'] },
  { ph: '紙のカルテで困る写真', t: ['カウンセリング内容が', 'バラバラで引き継ぎが大変'] },
  { ph: 'スマホで管理する美容師', t: ['LINEや手書き管理が', '手間で時間が足りない'] },
];

export default function ProblemSection() {
  return (
    <section className="section section-soft">
      <div className="container">
        <FadeUp>
          <h2 className="h2" style={{ textAlign: 'center' }}>こんなお悩み、ありませんか？</h2>
        </FadeUp>
        <div className="grid-3" style={{ marginTop: 36 }}>
          {PROBLEMS.map((p, i) => (
            <FadeUp key={i} delay={i * 80}>
              <div className="prob">
                <div className="prob-img">
                  <ImageSlot id={`prob-${i}`} placeholder={p.ph} />
                </div>
                <div className="prob-body">
                  {p.t.map((line, j) => <div key={j}>{line}</div>)}
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

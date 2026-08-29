/**
 * lib/tools/hair-check.ts
 *
 * 髪質・ダメージ診断 Step 1（質問式クイズ）の判定ロジック。
 * Claude を呼ばないスコアリング方式。コスト¥0・即時・無制限。
 *
 * 設問・選択肢・スコア・結果文をここに集約し、API/画面で共有する。
 */

export type ChoiceId = string

export interface Choice {
  id: ChoiceId
  label: string
  score: number // ダメージ寄与スコア(0=健康 〜 3=高ダメージ)
  tag?: string // 悩みタグ(任意)
}

export interface Question {
  id: string
  text: string
  choices: Choice[]
}

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: '髪を乾かした後の手触りは？',
    choices: [
      { id: 'q1a', label: 'しっとりまとまる', score: 0 },
      { id: 'q1b', label: '普通', score: 1 },
      { id: 'q1c', label: 'パサつく', score: 2, tag: '乾燥' },
      { id: 'q1d', label: 'きしむ・からまる', score: 3, tag: '乾燥' },
    ],
  },
  {
    id: 'q2',
    text: '朝のスタイリングのしやすさは？',
    choices: [
      { id: 'q2a', label: 'まとまりやすい', score: 0 },
      { id: 'q2b', label: '普通', score: 1 },
      { id: 'q2c', label: '広がりやすい', score: 2, tag: '広がり' },
      { id: 'q2d', label: 'うねる・決まらない', score: 3, tag: '広がり' },
    ],
  },
  {
    id: 'q3',
    text: 'カラー・パーマの履歴は？',
    choices: [
      { id: 'q3a', label: 'ほとんどしない', score: 0 },
      { id: 'q3b', label: '半年に一度くらい', score: 1 },
      { id: 'q3c', label: '3ヶ月に一度くらい', score: 2, tag: 'ダメージ' },
      { id: 'q3d', label: '繰り返している', score: 3, tag: 'ダメージ' },
    ],
  },
  {
    id: 'q4',
    text: '毛先の状態は？',
    choices: [
      { id: 'q4a', label: '健康的', score: 0 },
      { id: 'q4b', label: 'やや乾燥', score: 1, tag: '乾燥' },
      { id: 'q4c', label: '枝毛がある', score: 2, tag: 'ダメージ' },
      { id: 'q4d', label: '切れ毛がある', score: 3, tag: 'ダメージ' },
    ],
  },
  {
    id: 'q5',
    text: '一番気になる悩みは？',
    choices: [
      { id: 'q5a', label: '乾燥', score: 1, tag: '乾燥' },
      { id: 'q5b', label: '広がり・うねり', score: 1, tag: '広がり' },
      { id: 'q5c', label: 'ダメージ・傷み', score: 2, tag: 'ダメージ' },
      { id: 'q5d', label: '白髪', score: 1, tag: '白髪' },
    ],
  },
]

export type DamageLevel = 1 | 2 | 3 | 4

export interface DiagnosisResult {
  damage_level: DamageLevel
  level_name: string
  hair_condition_analysis: string
  recommended_care: string
  concern_tags: string[]
}

// レベルごとの結果文(テンプレート・薬機法配慮で断定/効能表現は避ける)
const LEVEL_CONTENT: Record<DamageLevel, { name: string; analysis: string; care: string }> = {
  1: {
    name: '健康毛',
    analysis: '今の髪はとても良いコンディションを保てているようです。',
    care: '現状を保つために、保湿系のシャンプー・トリートメントでのケアを続けるのがおすすめです。',
  },
  2: {
    name: '軽度乾燥',
    analysis: 'やや乾燥のサインが見られます。早めのケアで扱いやすさを保ちやすくなります。',
    care: '洗い流すトリートメントに加え、週1-2回の集中ケアを取り入れるのがおすすめです。',
  },
  3: {
    name: '中度ダメージ',
    analysis: 'カラーや乾燥の影響でダメージが蓄積しているサインが見られます。',
    care: '毛先中心の集中ケアと、ドライヤー前の洗い流さないトリートメントがおすすめです。一度サロンでのケア相談も有効です。',
  },
  4: {
    name: '高度ダメージ',
    analysis: '髪の負担が大きくなっているサインが見られます。ケア方法の見直しが扱いやすさに繋がりやすい状態です。',
    care: 'ホームケアに加え、サロンでの集中トリートメントやカット相談がおすすめです。施術内容の調整も検討の価値があります。',
  },
}

/**
 * 回答(選択肢IDの配列)から診断結果を算出する。
 * @param answers 各設問で選んだ choice.id の配列
 */
export function diagnose(answers: ChoiceId[]): DiagnosisResult {
  const chosen: Choice[] = []
  for (const q of QUESTIONS) {
    const c = q.choices.find((ch) => answers.includes(ch.id))
    if (c) chosen.push(c)
  }

  const totalScore = chosen.reduce((sum, c) => sum + c.score, 0)
  // 最大スコア = 各設問の最大スコア合計
  const maxScore = QUESTIONS.reduce(
    (sum, q) => sum + Math.max(...q.choices.map((c) => c.score)),
    0
  )

  // スコア比率でレベル分け
  const ratio = maxScore > 0 ? totalScore / maxScore : 0
  let level: DamageLevel = 1
  if (ratio >= 0.7) level = 4
  else if (ratio >= 0.45) level = 3
  else if (ratio >= 0.2) level = 2
  else level = 1

  // 悩みタグを重複なしで集計
  const tags = Array.from(new Set(chosen.map((c) => c.tag).filter((t): t is string => !!t)))

  const content = LEVEL_CONTENT[level]
  return {
    damage_level: level,
    level_name: content.name,
    hair_condition_analysis: content.analysis,
    recommended_care: content.care,
    concern_tags: tags,
  }
}

/** 全設問に回答済みかの検証 */
export function isComplete(answers: ChoiceId[]): boolean {
  return QUESTIONS.every((q) => q.choices.some((c) => answers.includes(c.id)))
}

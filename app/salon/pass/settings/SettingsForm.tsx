'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SalonShell } from '../../_components/SalonShell'

const C = {
  text: '#1F2A37',
  weak: '#98948A',
  label: '#66716A',
  primary: '#2F6FC4',
  line: '#DDE5EF',
  line2: '#E3E9F1',
  ok: '#4F7E60',
  error: '#A0522D',
}

type Program = {
  yen_per_point: string
  next_booking_bonus: string
  expiry_months: string
  include_retail: boolean
  migration_bonus_points: string
}

type Reward = {
  id: string | null
  name: string
  points_required: string
  hpb_menu_keyword: string
  active: boolean
}

type Msg = { kind: 'ok' | 'error'; text: string } | null

const card = {
  background: '#FFFFFF',
  borderRadius: '22px',
  padding: '20px 22px',
  boxShadow: '0 4px 14px rgba(40,70,120,.08)',
  border: `1px solid ${C.line2}`,
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
} as const

const box = {
  fontSize: '13px',
  padding: '10px 12px',
  borderRadius: '12px',
  border: 'none',
  boxShadow: `inset 0 0 0 1px ${C.line}`,
  background: '#fff',
  color: C.text,
  minWidth: 0,
  width: '100%',
  boxSizing: 'border-box',
} as const

function posInt(v: string): number | null {
  const n = Number(v.trim())
  return Number.isInteger(n) && n >= 0 ? n : null
}

export default function SettingsForm({ salonId, salonName }: { salonId: string; salonName: string }) {
  const [program, setProgram] = useState<Program | null>(null)
  const [rewards, setRewards] = useState<Reward[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [programMsg, setProgramMsg] = useState<Msg>(null)
  const [rewardMsg, setRewardMsg] = useState<Msg>(null)
  const [busy, setBusy] = useState<'program' | 'rewards' | null>(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    Promise.all([
      supabase
        .from('pass_programs')
        .select('yen_per_point, next_booking_bonus, expiry_months, include_retail, migration_bonus_points')
        .eq('salon_id', salonId)
        .maybeSingle(),
      supabase
        .from('pass_rewards')
        .select('id, name, points_required, hpb_menu_keyword, active, sort_order')
        .eq('salon_id', salonId)
        .order('sort_order', { ascending: true })
        .order('points_required', { ascending: true }),
    ]).then(([p, r]) => {
      if (cancelled) return
      if (p.error || r.error) {
        setLoadError((p.error ?? r.error)?.message ?? '')
        return
      }
      const d = p.data
      setProgram({
        yen_per_point: String(d?.yen_per_point ?? 1000),
        next_booking_bonus: String(d?.next_booking_bonus ?? 2),
        expiry_months: String(d?.expiry_months ?? 12),
        include_retail: d?.include_retail ?? true,
        migration_bonus_points: String(d?.migration_bonus_points ?? 5),
      })
      setRewards(
        (r.data ?? []).map((x) => ({
          id: x.id as string,
          name: (x.name as string) ?? '',
          points_required: String(x.points_required ?? ''),
          hpb_menu_keyword: (x.hpb_menu_keyword as string) ?? '',
          active: x.active !== false,
        })),
      )
    })
    return () => {
      cancelled = true
    }
  }, [salonId, nonce])

  const saveProgram = async () => {
    if (!program) return
    const yen = posInt(program.yen_per_point)
    const bonus = posInt(program.next_booking_bonus)
    const months = posInt(program.expiry_months)
    const mig = posInt(program.migration_bonus_points)
    if (!yen || bonus == null || !months || mig == null) {
      setProgramMsg({ kind: 'error', text: '数字（0以上の整数）で入力してください。円とヶ月は1以上です。' })
      return
    }
    setBusy('program')
    setProgramMsg(null)
    const { error } = await createClient()
      .from('pass_programs')
      .upsert(
        {
          salon_id: salonId,
          yen_per_point: yen,
          next_booking_bonus: bonus,
          expiry_months: months,
          include_retail: program.include_retail,
          migration_bonus_points: mig,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'salon_id' },
      )
    setBusy(null)
    setProgramMsg(error ? { kind: 'error', text: `保存できませんでした（${error.message}）` } : { kind: 'ok', text: '保存しました' })
  }

  const saveRewards = async () => {
    if (!rewards) return
    for (const r of rewards) {
      const p = posInt(r.points_required)
      if (!r.name.trim() || !p || !r.hpb_menu_keyword.trim()) {
        setRewardMsg({ kind: 'error', text: '名称・必要P（1以上）・交換メニュー名をすべて入力してください。' })
        return
      }
    }
    setBusy('rewards')
    setRewardMsg(null)
    const supabase = createClient()
    for (const [i, r] of rewards.entries()) {
      const fields = {
        name: r.name.trim(),
        points_required: posInt(r.points_required),
        hpb_menu_keyword: r.hpb_menu_keyword.trim(),
        active: r.active,
        sort_order: i,
      }
      const { error } = r.id
        ? await supabase.from('pass_rewards').update(fields).eq('id', r.id)
        : await supabase.from('pass_rewards').insert({ salon_id: salonId, ...fields })
      if (error) {
        setBusy(null)
        setRewardMsg({ kind: 'error', text: `保存できませんでした（${error.message}）` })
        return
      }
    }
    setBusy(null)
    setRewardMsg({ kind: 'ok', text: '保存しました' })
    setNonce((n) => n + 1)
  }

  const setReward = (i: number, patch: Partial<Reward>) =>
    setRewards((rs) => (rs ? rs.map((r, j) => (j === i ? { ...r, ...patch } : r)) : rs))

  const rewardCols = 'minmax(210px,1.3fr) 64px minmax(0,1.4fr) 52px'

  return (
    <SalonShell active="settings" salonName={salonName}>
      <main style={{ minWidth: 0, padding: '30px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <h1 style={{ margin: 0, fontSize: '36px', fontWeight: 900, lineHeight: 1.2 }}>PASS設定</h1>
        {loadError && <span style={{ color: C.error }}>設定を読み込めませんでした（{loadError}）</span>}
        {!loadError && (!program || !rewards) && <span style={{ color: C.weak }}>読み込み中…</span>}

        {program && (
          <section style={{ ...card, width: '1100px', maxWidth: '100%', boxSizing: 'border-box' }}>
            <strong style={{ fontSize: '15px', fontWeight: 900 }}>ポイント規定</strong>
            <RuleRow k="購入ポイント" sub="税込会計額・端数切り捨て">
              <NumInput value={program.yen_per_point} onChange={(v) => setProgram({ ...program, yen_per_point: v })} width="84px" />
              <Unit>円 = 1P</Unit>
            </RuleRow>
            <RuleRow k="次回予約ボーナス" sub="来店当日の次回予約。次回会計時に付与">
              <Unit>+</Unit>
              <NumInput value={program.next_booking_bonus} onChange={(v) => setProgram({ ...program, next_booking_bonus: v })} />
              <Unit>P</Unit>
            </RuleRow>
            <RuleRow k="有効期限" sub="最終来店日から">
              <NumInput value={program.expiry_months} onChange={(v) => setProgram({ ...program, expiry_months: v })} />
              <Unit>ヶ月</Unit>
            </RuleRow>
            <RuleRow k="店販を対象に含む" sub="物販の会計もポイント対象">
              <Toggle on={program.include_retail} onChange={(on) => setProgram({ ...program, include_retail: on })} label="店販を対象に含む" />
              <Unit>{program.include_retail ? 'ON' : 'OFF'}</Unit>
            </RuleRow>
            <RuleRow k="移行特典" sub="会員連携の完了時に一律（お一人1回）">
              <NumInput value={program.migration_bonus_points} onChange={(v) => setProgram({ ...program, migration_bonus_points: v })} />
              <Unit>P</Unit>
            </RuleRow>
            <SaveBar busy={busy === 'program'} msg={programMsg} onSave={() => void saveProgram()} />
          </section>
        )}

        {rewards && (
          <section style={{ ...card, width: '1100px', maxWidth: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <strong style={{ fontSize: '15px', fontWeight: 900 }}>特典</strong>
              <span style={{ fontSize: '11px', color: C.weak }}>
                SALON BOARDに0円・店内専用で登録したメニュー名と前方一致で判定
              </span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: rewardCols,
                gap: '12px',
                fontSize: '11px',
                fontWeight: 700,
                color: C.weak,
                padding: '0 4px',
              }}
            >
              <span>名称</span>
              <span>必要P</span>
              <span>SALON BOARDの交換メニュー名</span>
              <span>有効</span>
            </div>
            {rewards.map((r, i) => (
              <div
                key={r.id ?? `new-${i}`}
                style={{ display: 'grid', gridTemplateColumns: rewardCols, gap: '12px', alignItems: 'center' }}
              >
                <input value={r.name} onChange={(e) => setReward(i, { name: e.target.value })} style={box} aria-label="名称" />
                <input
                  value={r.points_required}
                  onChange={(e) => setReward(i, { points_required: e.target.value })}
                  inputMode="numeric"
                  style={{ ...box, fontWeight: 900, color: C.primary }}
                  aria-label="必要P"
                />
                <input
                  value={r.hpb_menu_keyword}
                  onChange={(e) => setReward(i, { hpb_menu_keyword: e.target.value })}
                  placeholder="【PASS交換】スタンダードTR 25P"
                  style={{ ...box, fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                  aria-label="SALON BOARDの交換メニュー名"
                />
                <Toggle on={r.active} onChange={(on) => setReward(i, { active: on })} label="有効" />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setRewards((rs) => [
                  ...(rs ?? []),
                  { id: null, name: '', points_required: '', hpb_menu_keyword: '', active: true },
                ])
              }
              style={{
                alignSelf: 'flex-start',
                fontSize: '12px',
                fontWeight: 700,
                color: C.weak,
                padding: '8px 16px',
                borderRadius: '999px',
                border: 'none',
                background: '#fff',
                boxShadow: `inset 0 0 0 1px ${C.line}`,
                cursor: 'pointer',
              }}
            >
              ＋ 特典を追加
            </button>
            <SaveBar busy={busy === 'rewards'} msg={rewardMsg} onSave={() => void saveRewards()} />
          </section>
        )}
      </main>
    </SalonShell>
  )
}

function RuleRow({ k, sub, children }: { k: string; sub: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 15px',
        borderRadius: '14px',
        boxShadow: `inset 0 0 0 1px ${C.line}`,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <strong style={{ fontSize: '12.5px', lineHeight: 1.5 }}>{k}</strong>
        <span style={{ fontSize: '10.5px', color: C.weak }}>{sub}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{children}</div>
    </div>
  )
}

function Unit({ children }: { children: ReactNode }) {
  return <span style={{ fontSize: '14px', fontWeight: 900, color: C.primary, whiteSpace: 'nowrap' }}>{children}</span>
}

function NumInput({ value, onChange, width = '56px' }: { value: string; onChange: (v: string) => void; width?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputMode="numeric"
      style={{ ...box, width, textAlign: 'right', fontSize: '14px', fontWeight: 900, color: C.primary, padding: '6px 10px' }}
    />
  )
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      style={{
        width: '46px',
        height: '26px',
        borderRadius: '999px',
        border: 'none',
        padding: 0,
        position: 'relative',
        cursor: 'pointer',
        background: on ? 'linear-gradient(90deg,#3C82D6,#2F6FC4)' : '#D5DDE8',
        flex: 'none',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '3px',
          left: on ? '23px' : '3px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#fff',
          transition: 'left .15s',
        }}
      />
    </button>
  )
}

function SaveBar({ busy, msg, onSave }: { busy: boolean; msg: Msg; onSave: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
      {msg && <span style={{ fontSize: '13px', color: msg.kind === 'ok' ? C.ok : C.error }}>{msg.text}</span>}
      <button
        type="button"
        onClick={onSave}
        disabled={busy}
        style={{
          minHeight: '44px',
          padding: '0 24px',
          borderRadius: '12px',
          border: 'none',
          background: 'linear-gradient(90deg,#3C82D6,#2F6FC4)',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer',
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? '保存中…' : '保存する'}
      </button>
    </div>
  )
}

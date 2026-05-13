// =======================================================
// メインアプリ
// =======================================================
const { useState, useMemo, useEffect } = React;

function App() {
  const [layout, setLayout] = useState("hero-6");
  const [slots, setSlots] = useState([
    { presetId: "reserve", label: "予約する", url: "https://reserve.example.com" },
    { presetId: "menu", label: "メニュー", url: "" },
    { presetId: "coupon", label: "クーポン", url: "" },
    { presetId: "catalog", label: "ヘアカタログ", url: "" },
    { presetId: "access", label: "アクセス", url: "" },
    { presetId: "ig", label: "インスタグラム", url: "" },
    { presetId: "contact", label: "お問い合わせ", url: "" },
  ]);
  const [focused, setFocused] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("すべて");
  const [activeTemplateId, setActiveTemplateId] = useState(null);
  const [titleText, setTitleText] = useState(window.GREETING_PRESETS[0].text);
  const [activeGreetingId, setActiveGreetingId] = useState("standard");
  const [avatar, setAvatar] = useState(window.AVATAR_PRESETS[0]);
  const [chatTitle, setChatTitle] = useState("キレイ鶴見店");
  const [style, setStyle] = useState(window.RICHMENU_STYLES[0]);

  const lay = window.LAYOUTS[layout];
  // 現在のレイアウトに合わせて slots をトリム/拡張
  const displaySlots = useMemo(() => {
    const out = [];
    for (let i = 0; i < lay.slots; i++) out.push(slots[i] || null);
    return out;
  }, [slots, lay.slots]);

  const usedPresetIds = new Set(displaySlots.filter(Boolean).map(s => s.presetId));

  const applyTemplate = (tpl) => {
    setLayout(tpl.layout);
    setActiveTemplateId(tpl.id);
    const newSlots = tpl.buttons.map(pid => {
      const p = window.PRESETS.find(x => x.id === pid);
      return { presetId: pid, label: p?.label || "", url: p?.urlTemplate || "" };
    });
    setSlots(newSlots);
  };

  const placePreset = (slotIndex, presetId) => {
    const p = window.PRESETS.find(x => x.id === presetId);
    if (!p) return;
    const next = [...slots];
    while (next.length < lay.slots) next.push(null);
    next[slotIndex] = { presetId, label: p.label, url: p.urlTemplate || "" };
    setSlots(next);
    setFocused(slotIndex);
    setActiveTemplateId(null);
  };

  const clearSlot = (i) => {
    const next = [...slots];
    next[i] = null;
    setSlots(next);
    if (focused === i) setFocused(null);
    setActiveTemplateId(null);
  };

  // クリックで埋める: focused がある→そこへ。なければ最初の空きへ。
  const addPresetSmart = (preset) => {
    const idx = focused != null && !displaySlots[focused] ? focused
              : displaySlots.findIndex(s => !s);
    if (idx === -1) return;
    placePreset(idx, preset.id);
  };

  const updateSlotField = (i, key, value) => {
    const next = [...slots];
    if (!next[i]) return;
    next[i] = { ...next[i], [key]: value };
    setSlots(next);
    setActiveTemplateId(null);
  };

  const categories = ["すべて", ...Array.from(new Set(window.PRESETS.map(p => p.category)))];
  const filteredPresets = categoryFilter === "すべて"
    ? window.PRESETS
    : window.PRESETS.filter(p => p.category === categoryFilter);

  const filledCount = displaySlots.filter(Boolean).length;
  const focusedSlot = focused != null ? displaySlots[focused] : null;
  const focusedPreset = focusedSlot ? window.PRESETS.find(p => p.id === focusedSlot.presetId) : null;

  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <div className="crumbs">
          <span>連携</span>
          <span className="sep">/</span>
          <span>LINE</span>
          <span className="sep">/</span>
          <span className="here">リッチメニュー</span>
        </div>

        <div className="head">
          <div>
            <h1>リッチメニュー</h1>
            <div className="sub">テンプレートまたはプリセットから選ぶだけで、リッチメニューが完成します。</div>
          </div>
          <div className="actions">
            <button className="btn ghost">下書き保存</button>
            <button className="btn">プレビュー共有</button>
            <button className="btn primary">公開する</button>
          </div>
        </div>

        <div className="workspace">
          {/* LEFT — workspace */}
          <div>
            {/* ===== STEP 1: テンプレート ===== */}
            <section className="section">
              <div className="section-head">
                <h2>
                  <span className="step">01</span>
                  テンプレートから始める
                </h2>
                <span className="hint">推奨構成を1クリックで適用</span>
              </div>
              <div className="section-body">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                  {window.TEMPLATES.map(t => (
                    <TemplateCard key={t.id} tpl={t}
                      active={activeTemplateId === t.id}
                      onSelect={applyTemplate} />
                  ))}
                </div>
              </div>
            </section>

            {/* ===== STEP 2: ビジュアルスタイル ===== */}
            <section className="section">
              <div className="section-head">
                <h2>
                  <span className="step">02</span>
                  デザインを選ぶ
                </h2>
                <span className="hint">5パターンから雰囲気を選択</span>
              </div>
              <div className="section-body">
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: 14,
                }}>
                  {window.RICHMENU_STYLES.map(s => (
                    <StyleCard key={s.id} style={s}
                      active={style.id === s.id}
                      onSelect={setStyle} />
                  ))}
                </div>
              </div>
            </section>

            {/* ===== STEP 3: 配置 ===== */}
            <section className="section">
              <div className="section-head">
                <h2>
                  <span className="step">03</span>
                  ボタンを配置する
                </h2>
                <span className="hint">
                  {filledCount} / {lay.slots} 配置済み
                </span>
              </div>
              <div className="section-body">
                <div style={{ marginBottom: 16 }}>
                  <div className="field-label">レイアウト</div>
                  <LayoutSwitch value={layout} onChange={(v) => {
                    setLayout(v);
                    setActiveTemplateId(null);
                  }} />
                </div>

                {/* グリッドエディタ */}
                <div style={{
                  background: "var(--bg-2)", padding: 16, borderRadius: 6,
                  border: "1px dashed var(--line-2)",
                }}>
                  <div className="drag-hint" style={{ marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                    <span>↓ 下のプリセットをドラッグ、または空きスロットをクリック</span>
                    <span style={{ opacity: 0.6 }} className="mono">{lay.cols}×{lay.rows}</span>
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${lay.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${lay.rows}, 1fr)`,
                    gap: 8,
                    aspectRatio: `${lay.cols} / ${lay.rows * 0.62}`,
                  }}>
                    {displaySlots.map((slot, i) => (
                      <GridSlot key={i} index={i} slot={slot}
                        focused={focused === i}
                        layoutCols={lay.cols}
                        onDrop={placePreset}
                        onClear={clearSlot}
                        onClick={(idx) => setFocused(idx)}
                      />
                    ))}
                  </div>
                </div>

                {/* フォーカス中のスロット詳細 */}
                {focused != null && focusedSlot && (
                  <div style={{
                    marginTop: 14, padding: 16, background: "#fff",
                    border: "1px solid var(--line)", borderRadius: 6,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 4,
                          background: (focusedPreset?.color || "#999") + "20",
                          color: focusedPreset?.color || "#666",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Icon path={focusedPreset?.icon} size={16} />
                        </div>
                        <div className="serif" style={{ fontSize: 15, letterSpacing: "0.08em" }}>
                          ボタン {focused + 1} の詳細
                        </div>
                      </div>
                      <button onClick={() => setFocused(null)}
                        style={{ background: "transparent", border: 0, color: "var(--muted)", fontSize: 12 }}>
                        閉じる
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <div className="field-label">ラベル</div>
                        <input className="text-input" value={focusedSlot.label}
                          onChange={(e) => updateSlotField(focused, "label", e.target.value)} />
                      </div>
                      <div>
                        <div className="field-label">アクション</div>
                        <select className="select-input" value={focusedSlot.action || focusedPreset?.action || "URL"}
                          onChange={(e) => updateSlotField(focused, "action", e.target.value)}>
                          {window.ACTIONS.map(a => <option key={a}>{a}</option>)}
                        </select>
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <div className="field-label">URL / 設定値</div>
                        <input className="text-input" value={focusedSlot.url}
                          placeholder={focusedPreset?.urlTemplate || "https://..."}
                          onChange={(e) => updateSlotField(focused, "url", e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ===== STEP 4: プリセット ライブラリ ===== */}
            <section className="section">
              <div className="section-head">
                <h2>
                  <span className="step">04</span>
                  プリセットから選ぶ
                </h2>
                <span className="hint">クリックまたはドラッグで配置</span>
              </div>
              <div className="section-body">
                <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                  {categories.map(c => (
                    <button key={c} onClick={() => setCategoryFilter(c)}
                      style={{
                        padding: "6px 12px", borderRadius: 999,
                        border: `1px solid ${categoryFilter === c ? "var(--ink)" : "var(--line-2)"}`,
                        background: categoryFilter === c ? "var(--ink)" : "transparent",
                        color: categoryFilter === c ? "#f3ede1" : "var(--ink-2)",
                        fontSize: 12, letterSpacing: "0.08em",
                      }}>
                      {c}
                    </button>
                  ))}
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: 10,
                }}>
                  {filteredPresets.map(p => (
                    <PresetChip key={p.id} preset={p}
                      used={usedPresetIds.has(p.id)}
                      onAdd={addPresetSmart} />
                  ))}
                </div>
              </div>
            </section>

            {/* ===== STEP 5: メッセージ ===== */}
            <section className="section">
              <div className="section-head">
                <h2>
                  <span className="step">05</span>
                  あいさつメッセージ
                </h2>
                <span className="hint">テンプレートから選ぶか、自由入力</span>
              </div>
              <div className="section-body">
                {/* 店舗名 + アバター */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16, marginBottom: 22 }}>
                  <div>
                    <div className="field-label">店舗名（トーク画面に表示）</div>
                    <input className="text-input" value={chatTitle}
                      onChange={(e) => setChatTitle(e.target.value)} />
                  </div>
                  <div>
                    <div className="field-label">アイコン</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {window.AVATAR_PRESETS.map(a => (
                        <button key={a.id} onClick={() => setAvatar(a)}
                          title={a.label}
                          style={{
                            padding: 4, background: "transparent",
                            border: `2px solid ${avatar.id === a.id ? "var(--ink)" : "transparent"}`,
                            borderRadius: "50%", cursor: "pointer",
                          }}>
                          <AvatarCircle avatar={a} size={36} fontSize={15} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* あいさつテンプレート */}
                <div className="field-label" style={{ marginBottom: 10 }}>あいさつ文テンプレート</div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 10, marginBottom: 14,
                }}>
                  {window.GREETING_PRESETS.map(g => {
                    const active = activeGreetingId === g.id;
                    return (
                      <button key={g.id} onClick={() => {
                        setTitleText(g.text);
                        setActiveGreetingId(g.id);
                      }}
                        className="preset-card"
                        style={{
                          textAlign: "left", padding: 14,
                          background: active ? "var(--ink)" : "#fff",
                          color: active ? "#f3ede1" : "var(--ink)",
                          border: `1px solid ${active ? "var(--ink)" : "var(--line)"}`,
                          borderRadius: 6, cursor: "pointer",
                          display: "flex", flexDirection: "column", gap: 8,
                        }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span className="serif" style={{ fontSize: 13.5, letterSpacing: "0.06em" }}>
                            {g.label}
                          </span>
                          <span style={{
                            fontSize: 10, padding: "2px 7px", borderRadius: 2,
                            background: active ? "rgba(243,237,225,0.16)" : "var(--bg-2)",
                            color: active ? "#f3ede1" : "var(--muted)",
                            letterSpacing: "0.08em",
                          }}>{g.tone}</span>
                        </div>
                        <div style={{
                          fontSize: 11.5, lineHeight: 1.6, whiteSpace: "pre-line",
                          opacity: active ? 0.9 : 0.75,
                        }}>
                          {g.text}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* カスタム編集 */}
                <details style={{
                  background: "var(--bg-2)", borderRadius: 6, padding: "10px 14px",
                  border: "1px solid var(--line)",
                }}>
                  <summary style={{
                    cursor: "pointer", fontSize: 12.5, color: "var(--ink-2)",
                    letterSpacing: "0.06em", listStyle: "none",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ color: "var(--gold)", fontSize: 11 }}>✎</span>
                    自由に編集する
                  </summary>
                  <textarea
                    value={titleText}
                    onChange={(e) => { setTitleText(e.target.value); setActiveGreetingId(null); }}
                    rows={3}
                    style={{
                      width: "100%", marginTop: 10, padding: "10px 12px",
                      background: "#fff", border: "1px solid var(--line)",
                      borderRadius: 4, fontSize: 13, color: "var(--ink)",
                      fontFamily: "inherit", resize: "vertical", lineHeight: 1.6,
                    }} />
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6, letterSpacing: "0.04em" }}>
                    改行も使えます。{titleText.length} 文字
                  </div>
                </details>
              </div>
            </section>
          </div>

          {/* RIGHT — preview */}
          <div className="preview-col">
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 14, padding: "0 4px",
            }}>
              <div className="serif" style={{ fontSize: 16, letterSpacing: "0.1em" }}>
                プレビュー
              </div>
              <div className="mode-tabs">
                <button className="mode-tab active">LINE</button>
                <button className="mode-tab">画像書き出し</button>
              </div>
            </div>
            <Preview layout={layout} slots={displaySlots} title={chatTitle} greeting={titleText} avatar={avatar} style={style} />
            <div style={{
              marginTop: 14, padding: 14, background: "var(--card)",
              border: "1px solid var(--line)", borderRadius: 6,
              fontSize: 11.5, color: "var(--muted)", letterSpacing: "0.04em",
              lineHeight: 1.7,
            }}>
              <div style={{ fontSize: 11, color: "var(--gold)", letterSpacing: "0.1em", marginBottom: 4 }} className="mono">
                STATUS — 下書き
              </div>
              {filledCount === lay.slots
                ? "✓ すべてのボタンが設定済み。「公開する」でLINEに反映されます。"
                : `${lay.slots - filledCount} 個のボタンが未設定です。上のプリセットから選んで配置してください。`}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

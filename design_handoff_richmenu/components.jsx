// =======================================================
// 共通アイコン
// =======================================================
const Icon = ({ path, size = 20, stroke = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor"
       strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

// =======================================================
// サイドバー
// =======================================================
function Sidebar() {
  const items = [
    { label: "ホーム", key: "home" },
    { label: "予約", key: "book" },
    { label: "顧客", key: "clients" },
    { label: "連携", key: "integrations", active: true },
    { label: "その他", key: "other" },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-title serif">中身</div>
        <div className="brand-sub">SALON OS</div>
      </div>
      <nav className="nav">
        {items.map(it => (
          <a key={it.key} className={it.active ? "active" : ""} href="#">
            <span className="dot"></span>{it.label}
          </a>
        ))}
      </nav>
      <div className="user">
        <div>キレイ鶴見店</div>
        <div className="who">テスト太郎</div>
      </div>
      <button className="logout">ログアウト</button>
    </aside>
  );
}

// =======================================================
// テンプレートカード
// =======================================================
function TemplateCard({ tpl, active, onSelect }) {
  const layout = window.LAYOUTS[tpl.layout];
  return (
    <button
      onClick={() => onSelect(tpl)}
      style={{
        display: "block", textAlign: "left", width: "100%",
        background: active ? "var(--ink)" : "var(--card)",
        color: active ? "#f3ede1" : "var(--ink)",
        border: `1px solid ${active ? "var(--ink)" : "var(--line)"}`,
        borderRadius: 8, padding: 18, cursor: "pointer",
        transition: "all .15s ease",
      }}
      className="preset-card"
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div className="serif" style={{ fontSize: 17, letterSpacing: "0.08em", marginBottom: 4 }}>
            {tpl.name}
          </div>
          <div style={{ fontSize: 11.5, opacity: 0.7, letterSpacing: "0.04em" }}>
            {tpl.description}
          </div>
        </div>
        <div style={{
          fontSize: 10, padding: "2px 7px", borderRadius: 2,
          background: active ? "rgba(243,237,225,0.12)" : "var(--bg-2)",
          letterSpacing: "0.1em",
        }}>{tpl.tag}</div>
      </div>
      {/* layout preview */}
      <div style={{
        marginTop: 14,
        display: "grid",
        gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
        gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
        gap: 3,
        aspectRatio: `${layout.cols} / ${layout.rows * 0.62}`,
        background: active ? "rgba(243,237,225,0.06)" : "var(--bg)",
        padding: 5, borderRadius: 4,
      }}>
        {Array.from({ length: layout.slots }).map((_, i) => {
          const presetId = tpl.buttons[i];
          const preset = window.PRESETS.find(p => p.id === presetId);
          return (
            <div key={i} style={{
              background: active ? "rgba(243,237,225,0.18)" : "#fff",
              border: `1px solid ${active ? "rgba(243,237,225,0.15)" : "var(--line)"}`,
              borderRadius: 2,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, color: active ? "#f3ede1" : "var(--ink-2)",
              padding: 2, textAlign: "center", lineHeight: 1.2,
            }}>
              {preset?.label || ""}
            </div>
          );
        })}
      </div>
    </button>
  );
}

// =======================================================
// プリセットチップ (ライブラリの個別ボタン)
// =======================================================
function PresetChip({ preset, onAdd, used }) {
  return (
    <button
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("preset-id", preset.id);
        e.dataTransfer.effectAllowed = "copy";
      }}
      onClick={() => onAdd(preset)}
      className="preset-card"
      style={{
        display: "flex", flexDirection: "column", alignItems: "flex-start",
        gap: 8, padding: "12px 12px", background: "#fff",
        border: `1px solid var(--line)`, borderRadius: 6,
        textAlign: "left", cursor: "grab", position: "relative",
        opacity: used ? 0.55 : 1,
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 6, display: "flex",
        alignItems: "center", justifyContent: "center",
        background: preset.color + "18", color: preset.color,
      }}>
        <Icon path={preset.icon} size={18} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.04em" }}>
          {preset.label}
        </div>
        <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2, letterSpacing: "0.02em" }}>
          {preset.hint}
        </div>
      </div>
      {used && (
        <div style={{
          position: "absolute", top: 8, right: 8, fontSize: 9,
          padding: "2px 6px", background: "var(--ink)", color: "#f3ede1",
          borderRadius: 2, letterSpacing: "0.1em",
        }}>使用中</div>
      )}
    </button>
  );
}

// =======================================================
// グリッドのスロット (配置済みボタン or 空)
// =======================================================
function GridSlot({ slot, index, onDrop, onClear, onClick, focused, layoutCols }) {
  const [over, setOver] = React.useState(false);
  const preset = slot ? window.PRESETS.find(p => p.id === slot.presetId) : null;
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData("preset-id");
        if (id) onDrop(index, id);
      }}
      onClick={() => onClick(index)}
      className={!slot ? "pulse" : ""}
      style={{
        background: slot ? (preset?.color + "10") : (over ? "var(--gold-soft)" : "#fff"),
        border: `1.5px ${slot ? "solid" : "dashed"} ${focused ? "var(--ink)" : (over ? "var(--gold)" : "var(--line-2)")}`,
        borderRadius: 6,
        minHeight: 90,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 10, gap: 6, cursor: "pointer", position: "relative",
        transition: "all .15s ease",
      }}
    >
      {slot && preset ? (
        <>
          <div style={{ color: preset.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon path={preset.icon} size={22} />
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink)", letterSpacing: "0.04em", textAlign: "center" }}>
            {slot.label || preset.label}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClear(index); }}
            style={{
              position: "absolute", top: 6, right: 6, width: 18, height: 18,
              border: 0, background: "transparent", color: "var(--muted)",
              opacity: 0.5, fontSize: 14, padding: 0, lineHeight: 1,
            }}
            title="削除"
          >×</button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 18, color: "var(--gold)", fontWeight: 300 }}>＋</div>
          <div style={{ fontSize: 10.5, color: "var(--muted)", letterSpacing: "0.08em" }}>
            {over ? "ここに配置" : "プリセットを選択"}
          </div>
        </>
      )}
    </div>
  );
}

// =======================================================
// レイアウト切替
// =======================================================
function LayoutSwitch({ value, onChange }) {
  const opts = [
    { v: "hero-6", label: "メイン+6", icon: "1+6" },
    { v: "3x2", label: "大 (6マス)", icon: "3×2" },
    { v: "2x2", label: "中 (4マス)", icon: "2×2" },
    { v: "2x1", label: "小 (2マス)", icon: "2×1" },
    { v: "1x1", label: "1ボタン", icon: "1×1" },
  ];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {opts.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)}
          style={{
            border: `1px solid ${value === o.v ? "var(--ink)" : "var(--line-2)"}`,
            background: value === o.v ? "var(--ink)" : "#fff",
            color: value === o.v ? "#f3ede1" : "var(--ink)",
            padding: "8px 14px", borderRadius: 4, fontSize: 12, letterSpacing: "0.08em",
            display: "flex", alignItems: "center", gap: 8,
          }}>
          <span className="mono" style={{ opacity: 0.7, fontSize: 11 }}>{o.icon}</span>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// =======================================================
// プレビュー (LINEトーク + リッチメニュー)
// =======================================================
function AvatarCircle({ avatar, size = 32, fontSize = 14 }) {
  if (!avatar) return null;
  if (avatar.type === "letter") {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: avatar.bg, color: avatar.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Noto Serif JP", fontSize, fontWeight: 500,
        flexShrink: 0,
      }}>{avatar.value}</div>
    );
  }
  const path = window.AVATAR_ICON_PATHS[avatar.value];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: avatar.bg, color: avatar.color,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon path={path} size={size * 0.55} stroke={1.4} />
    </div>
  );
}

function Preview({ layout, slots, title, greeting, avatar, style }) {
  const lay = window.LAYOUTS[layout];
  const st = style || window.RICHMENU_STYLES[0];
  const isHero = !!lay.hero;
  // For hero layout: slot 0 = hero, slots 1-6 = grid
  const heroSlot = isHero ? slots[0] : null;
  const gridSlots = isHero ? slots.slice(1) : slots;
  const gridCount = isHero ? 6 : lay.slots;
  const gridCols = isHero ? 3 : lay.cols;
  const gridRows = isHero ? 2 : lay.rows;

  // text color for "本日 9:41" — adapt to chat bg
  const isDarkChat = ["luxury", "night"].includes(st.id);

  const renderBtn = (slot, opts = {}) => {
    const preset = slot ? window.PRESETS.find(p => p.id === slot.presetId) : null;
    const isHeroBtn = opts.hero;
    const bgConf = isHeroBtn ? st.hero : { bg: st.btnBg, border: st.btnBorder, text: st.btnText, iconColor: st.iconColor };
    return (
      <div style={{
        background: bgConf.bg,
        border: `1px solid ${bgConf.border}`,
        color: bgConf.text,
        borderRadius: st.radius,
        display: "flex",
        flexDirection: isHeroBtn ? "row" : "column",
        alignItems: "center",
        justifyContent: "center",
        gap: isHeroBtn ? 10 : 4,
        padding: isHeroBtn ? "12px 14px" : 4,
        fontSize: isHeroBtn ? 12 : 10,
        fontWeight: 500,
        letterSpacing: "0.04em",
        position: "relative",
        boxShadow: st.id === "soft-round" ? "0 2px 4px rgba(200,140,110,0.15)"
                 : st.id === "ai-future" ? "0 2px 8px rgba(120,90,180,0.12), inset 0 0 0 1px rgba(255,255,255,0.4)"
                 : st.id === "glass" ? "0 4px 12px rgba(100,120,180,0.15), inset 0 0 0 1px rgba(255,255,255,0.5)"
                 : st.id === "feminine-pink" ? "0 2px 6px rgba(208,122,138,0.12)"
                 : st.id === "gold-marble" && !isHeroBtn ? "inset 0 0 0 0.5px rgba(212,184,120,0.5)"
                 : st.id === "night" ? `0 0 0 1px ${bgConf.border}, 0 4px 12px rgba(168,143,232,${isHeroBtn ? 0.25 : 0.1})`
                 : "none",
        backdropFilter: ["ai-future", "glass"].includes(st.id) ? "blur(6px)" : "none",
        minHeight: isHeroBtn ? 52 : "auto",
      }}>
        {preset ? (
          <>
            <div style={{ color: bgConf.iconColor, display: "flex" }}>
              <Icon path={preset.icon} size={isHeroBtn ? 22 : 16} stroke={1.6} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: isHeroBtn ? "flex-start" : "center", flex: isHeroBtn ? 1 : "none" }}>
              <div>{slot.label || preset.label}</div>
              {isHeroBtn && (
                <div style={{ fontSize: 9, opacity: 0.7, marginTop: 2, letterSpacing: "0.02em", fontWeight: 400 }}>
                  24時間いつでも簡単予約
                </div>
              )}
            </div>
            {isHeroBtn && (
              <div style={{ color: bgConf.iconColor, opacity: 0.6, fontSize: 14 }}>›</div>
            )}
          </>
        ) : (
          <span style={{ opacity: 0.5, fontSize: 9, color: bgConf.text }}>未設定</span>
        )}
      </div>
    );
  };

  return (
    <div style={{
      background: "linear-gradient(180deg, #8ba5b8 0%, #6e8a9e 100%)",
      border: "1px solid var(--line-2)", borderRadius: 28, padding: 16,
      boxShadow: "0 18px 40px -20px rgba(0,0,0,0.25)",
    }}>
      <div style={{ background: "#000", borderRadius: 22, padding: 6 }}>
        <div style={{ background: st.chatBg, borderRadius: 18, overflow: "hidden", position: "relative" }}>
          {/* status bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 22px 6px", fontSize: 11,
            color: isDarkChat ? "#fff" : "#1a1418", fontWeight: 600,
          }}>
            <span>9:41</span>
            <span style={{ width: 16, height: 8, border: `1px solid ${isDarkChat ? "#fff" : "#1a1418"}`, borderRadius: 2, position: "relative" }}>
              <span style={{ position: "absolute", inset: 1, background: isDarkChat ? "#fff" : "#1a1418", width: "70%" }}></span>
            </span>
          </div>
          {/* header */}
          <div style={{
            background: "rgba(255,255,255,0.92)", padding: "10px 14px",
            display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #d3dde4",
          }}>
            <div style={{ fontSize: 16 }}>‹</div>
            <AvatarCircle avatar={avatar} size={32} fontSize={14} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{title || "キレイ鶴見店"}</div>
            </div>
            <div style={{ fontSize: 14, color: "var(--muted)" }}>≡</div>
          </div>

          {/* talk area */}
          <div style={{ padding: "18px 14px 12px", minHeight: 150, background: st.chatBg, position: "relative" }}>
            {/* decoration overlay */}
            {st.decoration === "botanical" && (
              <svg viewBox="0 0 100 100" style={{ position: "absolute", right: -10, top: 0, width: 120, height: 120, opacity: 0.35, pointerEvents: "none" }}>
                <path d="M50 90 Q60 60 80 50 M50 90 Q40 60 20 50 M50 90 Q50 50 50 20" stroke="#7a8a6a" strokeWidth="1" fill="none" />
                <ellipse cx="80" cy="50" rx="8" ry="3" fill="#9aae8e" transform="rotate(30 80 50)" />
                <ellipse cx="20" cy="50" rx="8" ry="3" fill="#9aae8e" transform="rotate(-30 20 50)" />
                <ellipse cx="50" cy="20" rx="4" ry="8" fill="#9aae8e" />
                <ellipse cx="70" cy="70" rx="6" ry="3" fill="#bcc8a8" transform="rotate(20 70 70)" />
                <ellipse cx="30" cy="70" rx="6" ry="3" fill="#bcc8a8" transform="rotate(-20 30 70)" />
              </svg>
            )}
            {st.decoration === "marble" && (
              <div style={{
                position: "absolute", inset: 0, opacity: 0.25, pointerEvents: "none",
                background: "radial-gradient(ellipse at 20% 30%, rgba(200,168,122,0.4), transparent 40%), radial-gradient(ellipse at 80% 70%, rgba(200,168,122,0.3), transparent 50%)",
              }}></div>
            )}
            {st.decoration === "wave" && (
              <svg viewBox="0 0 200 80" style={{ position: "absolute", right: 0, bottom: 0, width: "100%", height: 60, opacity: 0.4, pointerEvents: "none" }}>
                <path d="M0 60 Q50 30 100 50 T200 40" stroke="#a98fe0" strokeWidth="0.8" fill="none" />
                <path d="M0 70 Q50 45 100 60 T200 55" stroke="#7a5fc8" strokeWidth="0.6" fill="none" opacity="0.6" />
                <path d="M0 50 Q50 25 100 40 T200 30" stroke="#c8a8e8" strokeWidth="0.6" fill="none" opacity="0.5" />
              </svg>
            )}
            {st.decoration === "pinkbotanical" && (
              <svg viewBox="0 0 100 100" style={{ position: "absolute", right: -5, top: 5, width: 110, height: 110, opacity: 0.5, pointerEvents: "none" }}>
                <path d="M50 95 Q60 65 80 55 M50 95 Q40 65 25 60 M50 95 Q52 55 55 25" stroke="#d07a8a" strokeWidth="0.8" fill="none" />
                <ellipse cx="80" cy="55" rx="7" ry="2.5" fill="#e8a8b4" transform="rotate(30 80 55)" />
                <ellipse cx="25" cy="60" rx="7" ry="2.5" fill="#e8a8b4" transform="rotate(-20 25 60)" />
                <ellipse cx="55" cy="25" rx="3" ry="7" fill="#e8a8b4" />
                <circle cx="68" cy="68" r="2" fill="#f0c4cc" />
                <circle cx="35" cy="75" r="2" fill="#f0c4cc" />
              </svg>
            )}
            {st.decoration === "goldmarble" && (
              <div style={{
                position: "absolute", inset: 0, opacity: 0.6, pointerEvents: "none",
                background: "radial-gradient(ellipse at 30% 40%, rgba(180,144,74,0.25), transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(180,144,74,0.2), transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(255,255,255,0.4), transparent 40%)",
              }}></div>
            )}
            {st.decoration === "glassblur" && (
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "radial-gradient(circle at 70% 30%, rgba(168,184,232,0.25), transparent 50%), radial-gradient(circle at 20% 80%, rgba(200,168,232,0.2), transparent 50%)",
              }}></div>
            )}
            {st.decoration === "neon" && (
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.5,
                background: "radial-gradient(circle at 80% 20%, rgba(168,143,232,0.15), transparent 40%), radial-gradient(circle at 20% 80%, rgba(95,200,232,0.12), transparent 40%)",
              }}></div>
            )}
            <div style={{ textAlign: "center", fontSize: 10, color: isDarkChat ? "#fff" : "#3a3038", opacity: 0.75, marginBottom: 12, position: "relative" }}>
              本日 9:41
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", position: "relative" }}>
              <AvatarCircle avatar={avatar} size={28} fontSize={12} />
              <div style={{
                background: "#fff", borderRadius: "2px 14px 14px 14px",
                padding: "9px 12px", fontSize: 11.5, maxWidth: 200, color: "var(--ink)",
                whiteSpace: "pre-line", lineHeight: 1.55,
              }}>
                {greeting || "いつもありがとうございます。\n下のメニューからお選びください。"}
              </div>
            </div>
          </div>

          {/* rich menu */}
          <div style={{
            background: st.menuBg, padding: st.gap + 2,
            borderTop: isDarkChat ? "1px solid #1a1418" : "1px solid #d3dde4",
            position: "relative",
          }}>
            {isHero ? (
              <div style={{ display: "flex", flexDirection: "column", gap: st.gap }}>
                {/* hero */}
                <div style={{ aspectRatio: "3 / 0.7" }}>
                  {renderBtn(heroSlot, { hero: true })}
                </div>
                {/* grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                  gridTemplateRows: `repeat(${gridRows}, 1fr)`,
                  gap: st.gap,
                  aspectRatio: `${gridCols} / ${gridRows * 0.7}`,
                }}>
                  {Array.from({ length: gridCount }).map((_, i) => (
                    <div key={i}>{renderBtn(gridSlots[i])}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                gridTemplateRows: `repeat(${gridRows}, 1fr)`,
                gap: st.gap,
                aspectRatio: `${gridCols} / ${gridRows * 0.62}`,
              }}>
                {Array.from({ length: gridCount }).map((_, i) => (
                  <div key={i}>{renderBtn(gridSlots[i])}</div>
                ))}
              </div>
            )}
          </div>

          {/* input bar */}
          <div style={{
            background: "#fff", padding: "8px 12px", display: "flex",
            alignItems: "center", gap: 8, borderTop: "1px solid #e6e6e6",
          }}>
            <div style={{ fontSize: 16, color: "var(--muted)" }}>＋</div>
            <div style={{
              flex: 1, height: 24, background: "#f0f0f0", borderRadius: 12,
              fontSize: 10.5, color: "var(--muted)", padding: "5px 10px",
            }}>メッセージを入力</div>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", background: "#00b900",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 12,
            }}>↑</div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Icon, Sidebar, TemplateCard, PresetChip, GridSlot, LayoutSwitch, Preview, AvatarCircle });

// =======================================================
// ビジュアルスタイル ピッカー カード（ミニ プレビュー）
// =======================================================
function StyleCard({ style, active, onSelect }) {
  return (
    <button onClick={() => onSelect(style)}
      className="preset-card"
      style={{
        textAlign: "left", padding: 0, background: "transparent",
        border: `2px solid ${active ? "var(--ink)" : "transparent"}`,
        borderRadius: 12, cursor: "pointer",
        display: "flex", flexDirection: "column", gap: 0,
      }}>
      {/* mini phone */}
      <div style={{
        background: "linear-gradient(180deg, #f3ede1 0%, #ebe3d3 100%)",
        padding: 10, borderRadius: 10,
      }}>
        <div style={{
          background: "#000", borderRadius: 14, padding: 3,
          aspectRatio: "9 / 17",
          maxWidth: 140, margin: "0 auto",
        }}>
          <div style={{ background: style.chatBg, borderRadius: 12, height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {/* mini header */}
            <div style={{
              background: "rgba(255,255,255,0.92)", padding: "3px 6px",
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 6,
            }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--gold-soft)" }}></div>
              <span style={{ fontWeight: 600 }}>キレイ鶴見店</span>
            </div>
            {/* mini chat */}
            <div style={{ flex: 1, padding: 4, position: "relative" }}>
              <div style={{
                background: "#fff", borderRadius: 4,
                padding: "2px 4px", fontSize: 4, color: "#1a1418",
                maxWidth: "70%", lineHeight: 1.3,
              }}>
                いつもありがとう
              </div>
            </div>
            {/* mini rich menu */}
            <div style={{ background: style.menuBg, padding: 3 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{
                  background: style.hero.bg, border: `0.5px solid ${style.hero.border}`,
                  borderRadius: Math.max(2, style.radius / 3), height: 10,
                }}></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{
                      background: style.btnBg, border: `0.5px solid ${style.btnBorder}`,
                      borderRadius: Math.max(2, style.radius / 3),
                      aspectRatio: "1",
                    }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* label */}
      <div style={{
        padding: "10px 12px 12px", textAlign: "left",
        background: active ? "var(--ink)" : "transparent",
        color: active ? "#f3ede1" : "var(--ink)",
        borderRadius: active ? "0 0 8px 8px" : "0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}>パターン{style.code}</span>
        </div>
        <div className="serif" style={{ fontSize: 13.5, letterSpacing: "0.06em" }}>
          {style.name}
        </div>
        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2, letterSpacing: "0.02em" }}>
          {style.description}
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
          {style.swatches.map((c, i) => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: 3, background: c,
              border: `1px solid ${active ? "rgba(243,237,225,0.3)" : "var(--line)"}`,
            }}></div>
          ))}
        </div>
      </div>
    </button>
  );
}

window.StyleCard = StyleCard;

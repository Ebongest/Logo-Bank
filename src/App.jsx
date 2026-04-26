import { useState, useEffect, useRef } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta?.env?.VITE_SUPABASE_URL || "https://yexqtnhorxqsvfwllyrz.supabase.co";
const SUPABASE_KEY = import.meta?.env?.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlleHF0bmhvcnhxc3Zmd2xseXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzQ2MjAsImV4cCI6MjA5MjcxMDYyMH0.ifr2HBzBm9KNSmOnCRpOYtwYmAOPHgsJ4YI-B4GM6tM";
const ANTHROPIC_KEY = import.meta?.env?.VITE_ANTHROPIC_KEY || "";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const STYLES = [
  { id: "luxury-monogram",   label: "Monogram",    icon: "LM" },
  { id: "elegant-wordmark",  label: "Wordmark",    icon: "Wm" },
  { id: "geometric-mark",    label: "Geometric",   icon: "◆" },
  { id: "script-calligraphy",label: "Signature",   icon: "ℛ" },
  { id: "minimal-symbol",    label: "Minimal",     icon: "○" },
  { id: "bold-modern",       label: "Bold",        icon: "B" },
];

const PALETTES = [
  { id: "emerald-gold",  name: "Emerald & Gold",   bg: "#051a0e", accent: "#f0c040", mid: "#2ecc71" },
  { id: "navy-platinum", name: "Navy & Platinum",  bg: "#040d1a", accent: "#e8eef5", mid: "#4a90d9" },
  { id: "obsidian-fire", name: "Obsidian & Fire",  bg: "#0d0808", accent: "#ff6b35", mid: "#c94040" },
  { id: "plum-rose",     name: "Plum & Rose",      bg: "#120a14", accent: "#f0a8c8", mid: "#9b4dca" },
  { id: "slate-cyan",    name: "Slate & Cyan",     bg: "#080f14", accent: "#00d4ff", mid: "#0088aa" },
  { id: "charcoal-lime", name: "Charcoal & Lime",  bg: "#0c0f08", accent: "#aaff44", mid: "#5a8a1a" },
];

const LOADING_PHRASES = [
  "Sketching your mark…",
  "Balancing the forms…",
  "Crafting your identity…",
  "Refining the curves…",
  "Almost there…",
  "Finishing touches…",
];

// ─── LOGO BANK SIGNATURE LOGO ────────────────────────────────────────────────
function LogoBankWordmark() {
  return (
    <svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg"
      style={{ width: 220, height: 73, display: "block" }}>
      <defs>
        <linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5e070" />
          <stop offset="50%" stopColor="#f0c040" />
          <stop offset="100%" stopColor="#c8960a" />
        </linearGradient>
        <linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <filter id="wglow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Mark: stacked L + B forming a minimal icon */}
      <rect x="8" y="18" width="4" height="52" rx="2" fill="url(#wg2)" />
      <rect x="8" y="66" width="28" height="4" rx="2" fill="url(#wg2)" />
      <rect x="38" y="18" width="4" height="52" rx="2" fill="url(#wg)" />
      <path d="M42 18 Q62 18 62 32 Q62 44 42 44" fill="none" stroke="url(#wg)" strokeWidth="4" strokeLinecap="round"/>
      <path d="M42 44 Q66 44 66 58 Q66 70 42 70" fill="none" stroke="url(#wg)" strokeWidth="4" strokeLinecap="round"/>

      {/* Separator dot */}
      <circle cx="80" cy="44" r="3" fill="rgba(240,192,64,0.4)" />

      {/* LOGO text */}
      <text x="92" y="38" fontFamily="'Syne', sans-serif" fontSize="28" fontWeight="800"
        fill="url(#wg2)" letterSpacing="6" filter="url(#wglow)">LOGO</text>

      {/* BANK text */}
      <text x="92" y="65" fontFamily="'Syne', sans-serif" fontSize="28" fontWeight="400"
        fill="url(#wg)" letterSpacing="6.5">BANK</text>

      {/* Underline accent */}
      <rect x="92" y="72" width="230" height="1.5" rx="1" fill="url(#wg)" opacity="0.35" />

      {/* Tagline */}
      <text x="92" y="90" fontFamily="'DM Sans', sans-serif" fontSize="8.5"
        fill="rgba(240,192,64,0.45)" letterSpacing="3.5">AI — POWERED LOGO GENERATION</text>
    </svg>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function LogoBank() {
  const [step, setStep]       = useState("home");
  const [name, setName]       = useState("");
  const [tagline, setTagline] = useState("");
  const [industry, setIndustry] = useState("");
  const [style, setStyle]     = useState("luxury-monogram");
  const [paletteId, setPaletteId] = useState("emerald-gold");
  const [logos, setLogos]     = useState([]);
  const [selected, setSelected] = useState(0);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [error, setError]     = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [navTab, setNavTab]   = useState("home");
  const inputRef = useRef(null);

  useEffect(() => {
    if (step !== "generating") return;
    const t = setInterval(() => setPhraseIdx(i => (i + 1) % LOADING_PHRASES.length), 2000);
    return () => clearInterval(t);
  }, [step]);

  const palette = PALETTES.find(p => p.id === paletteId);

  // ── Generate ──────────────────────────────────────────────────────────────
  const generate = async () => {
    if (!name.trim()) { inputRef.current?.focus(); return; }
    setStep("generating"); setError(""); setPhraseIdx(0);

    const prompt = `You are a world-class logo designer. Create 3 visually distinct professional SVG logos.

Brand: "${name}"${tagline ? `\nTagline: "${tagline}"` : ""}${industry ? `\nIndustry: ${industry}` : ""}
Style direction: ${style}
Colour palette — BG: ${palette.bg} | Primary: ${palette.accent} | Secondary: ${palette.mid}

OUTPUT: Raw JSON only. No markdown. No fences. No commentary whatsoever.
Format: {"logos":[{"name":"...","concept":"...","svg":"..."},{"name":"...","concept":"...","svg":"..."},{"name":"...","concept":"...","svg":"..."}]}

SVG REQUIREMENTS (non-negotiable):
- Every logo: <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
- First element always: <rect width="500" height="500" fill="${palette.bg}"/>
- Colors: ONLY ${palette.bg} (bg), ${palette.accent} (primary), ${palette.mid} (secondary) + white rgba allowed
- 3 logos must be COMPLETELY different compositions, layouts, visual languages
- Each must have minimum 12 SVG elements
- Each must have <defs> with: 1+ gradient (linear or radial), 1+ filter (glow/shadow/blur)
- Style-specific craft:
  luxury-monogram → intertwined initials as hand-drawn bezier <path> curves. Thin decorative rule lines. Diamond/rhombus accent shapes. Feels like a luxury fashion house.
  elegant-wordmark → ALL letters as custom <path> elements (draw each letter manually, NO <text>). Add baseline swash flourish. Geometric frame.
  geometric-mark → Bold abstract geometric icon (nested/overlapping shapes) centered above the brand name. Radial symmetry or golden ratio proportions.
  script-calligraphy → Flowing connected script as continuous bezier <path>. Ink-pen quality swashes and loops. Feels handcrafted but refined.
  minimal-symbol → Single abstract icon (max 4 paths). Ultra-clean. Generous breathing room. Brand name in clean proportional letters below.
  bold-modern → Thick slab or geometric letterforms. High contrast. Strong presence. Think agency branding.
- Include brand name "${name}" in every logo
${tagline ? `- Include "${tagline}" as a small secondary label` : ""}
- Every logo must look COMPLETE, POLISHED, PROFESSIONAL — not a draft`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "";
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error();
      const parsed = JSON.parse(m[0]);
      if (!parsed.logos?.length) throw new Error();
      setLogos(parsed.logos);
      setSelected(0);
      setStep("results");
    } catch {
      setError("Something went wrong. Please try again.");
      setStep("generate");
    }
  };

  // ── Save to Supabase ───────────────────────────────────────────────────────
  const saveLogo = async () => {
    const key = SUPABASE_KEY;
    if (!key) { setSavedMsg("Add VITE_SUPABASE_ANON_KEY to .env"); return; }
    setSavedMsg("Saving…");
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/logos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=minimal",
        },
        body: JSON.stringify({
          business_name: name, tagline, industry, style, palette: paletteId,
          svg_code: logos[selected].svg, variant_name: logos[selected].name,
        }),
      });
      setSavedMsg(r.ok ? "✓ Saved to your library" : "Save failed — check Supabase table");
    } catch { setSavedMsg("Network error"); }
  };

  const downloadSVG = () => {
    const blob = new Blob([logos[selected].svg], { type: "image/svg+xml" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `${name.replace(/\s+/g, "-").toLowerCase()}-logo.svg`,
    });
    a.click();
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

        :root {
          --green-deep:   #052010;
          --green-mid:    #0a3520;
          --green-bright: #1a6b3a;
          --green-glow:   #22c55e;
          --gold:         #f0c040;
          --gold-dim:     rgba(240,192,64,.45);
          --gold-line:    rgba(240,192,64,.18);
          --white:        #f0f8f0;
          --text-dim:     rgba(200,240,210,.45);
          --card-bg:      rgba(10,48,26,.72);
          --card-border:  rgba(240,192,64,.14);
          --radius:       18px;
          --radius-sm:    12px;
        }

        html, body, #root { height:100%; background: var(--green-deep); }

        .app {
          min-height: 100dvh;
          background: var(--green-deep);
          background-image:
            radial-gradient(ellipse 80% 50% at 50% -5%, rgba(34,197,94,.28) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 80% 110%, rgba(20,120,60,.2) 0%, transparent 60%),
            radial-gradient(ellipse 50% 30% at 10% 70%, rgba(15,90,40,.15) 0%, transparent 55%);
          font-family: 'DM Sans', sans-serif;
          color: var(--white);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
        }

        /* ── noise grain overlay ── */
        .app::after {
          content: '';
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: .6;
        }

        /* ── orbs ── */
        .orb {
          position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
          animation: orb-drift ease-in-out infinite alternate;
        }
        .orb-1 { width:500px;height:500px;top:-150px;left:-100px;
          background:radial-gradient(circle,rgba(34,197,94,.12) 0%,transparent 70%);
          animation-duration:14s; }
        .orb-2 { width:400px;height:400px;bottom:-100px;right:-80px;
          background:radial-gradient(circle,rgba(240,192,64,.08) 0%,transparent 70%);
          animation-duration:18s;animation-delay:-7s; }
        .orb-3 { width:300px;height:300px;top:40%;left:50%;transform:translateX(-50%);
          background:radial-gradient(circle,rgba(34,197,94,.06) 0%,transparent 70%);
          animation-duration:22s;animation-delay:-4s; }
        @keyframes orb-drift { from{transform:translate(0,0)} to{transform:translate(30px,25px)} }

        /* ── scroll area ── */
        .scroll { flex:1; overflow-y:auto; position:relative; z-index:1;
          padding-bottom: 90px; }
        .scroll::-webkit-scrollbar { width:0; }

        /* ── container ── */
        .wrap { max-width:520px; margin:0 auto; padding:0 18px 24px; }

        /* ── HEADER ── */
        .header {
          display: flex; flex-direction: column; align-items: center;
          padding: 48px 0 32px; gap: 4px;
        }
        .header-sub {
          font-size: 9px; letter-spacing: 5px; text-transform: uppercase;
          color: var(--text-dim); margin-top: 2px;
        }

        /* ── SECTION HEADING ── */
        .sec-head { font-family:'Syne',sans-serif; font-size:10px; font-weight:600;
          letter-spacing:3.5px; text-transform:uppercase; color:var(--gold-dim);
          margin-bottom:12px; }

        /* ── CARD ── */
        .card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: var(--radius);
          padding: 20px;
          margin-bottom: 14px;
          backdrop-filter: blur(12px);
          box-shadow: 0 2px 20px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.04);
          transition: border-color .2s;
        }
        .card:focus-within { border-color: rgba(240,192,64,.3); }

        /* ── INPUTS ── */
        .inp {
          width: 100%;
          background: rgba(5,20,10,.5);
          border: 1px solid rgba(240,192,64,.14);
          border-radius: var(--radius-sm);
          color: var(--white);
          padding: 15px 18px;
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 600;
          outline: none;
          transition: border-color .2s, background .2s;
          letter-spacing: .3px;
        }
        .inp::placeholder { color: rgba(200,240,210,.2); font-weight:400; font-size:18px; }
        .inp:focus { border-color: rgba(240,192,64,.4); background: rgba(8,30,16,.6); }

        .inp-sm { font-size:14px; font-weight:400; padding:12px 16px; font-family:'DM Sans',sans-serif; }

        .inp-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px; }
        .inp-label { font-size:9px; letter-spacing:3px; text-transform:uppercase;
          color:var(--text-dim); margin-bottom:7px; display:block; }

        /* ── STYLE PILLS ── */
        .style-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
        .style-btn {
          background: rgba(5,32,15,.6);
          border: 1px solid rgba(240,192,64,.1);
          border-radius: var(--radius-sm);
          color: rgba(200,240,210,.4);
          padding: 14px 8px;
          cursor: pointer;
          text-align: center;
          transition: all .18s;
          font-family: 'DM Sans', sans-serif;
        }
        .style-btn:hover { border-color:rgba(240,192,64,.3); color:rgba(240,192,64,.7); background:rgba(10,50,25,.7); }
        .style-btn.active {
          background: linear-gradient(135deg,rgba(34,197,94,.15),rgba(240,192,64,.08));
          border-color: rgba(240,192,64,.45);
          color: var(--gold);
          box-shadow: 0 0 16px rgba(240,192,64,.1), inset 0 1px 0 rgba(240,192,64,.1);
        }
        .style-icon { display:block; font-family:'Syne',sans-serif; font-size:20px; font-weight:700; margin-bottom:5px; line-height:1; }
        .style-label { font-size:9px; letter-spacing:1.5px; text-transform:uppercase; }

        /* ── PALETTE SWATCHES ── */
        .pal-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:8px; }
        .pal-btn {
          cursor:pointer; border:2px solid transparent; border-radius:10px;
          padding:2px; background:none; transition:all .18s;
        }
        .pal-btn.active { border-color:var(--gold); box-shadow:0 0 10px rgba(240,192,64,.3); }
        .pal-swatch { height:38px; border-radius:8px; display:flex; overflow:hidden; }

        /* ── CTA BUTTON ── */
        .cta {
          width:100%; padding:18px; margin-top:10px;
          background: linear-gradient(135deg, rgba(34,197,94,.25) 0%, rgba(22,163,74,.15) 100%);
          border: 1px solid rgba(240,192,64,.4);
          border-radius: var(--radius);
          color: var(--gold);
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 4px; text-transform: uppercase;
          transition: all .25s;
          position: relative; overflow: hidden;
        }
        .cta::before {
          content:''; position:absolute; inset:0;
          background: linear-gradient(135deg, rgba(34,197,94,.15), rgba(240,192,64,.12));
          opacity:0; transition:opacity .25s;
        }
        .cta:hover::before { opacity:1; }
        .cta:hover { border-color:rgba(240,192,64,.7); transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,0,0,.4), 0 0 24px rgba(34,197,94,.15); }
        .cta:disabled { opacity:.3; cursor:not-allowed; transform:none; }
        .cta span { position:relative; z-index:1; }

        /* ── DIVIDER ── */
        .divider { display:flex; align-items:center; gap:12px; margin:20px 0; }
        .divider-line { flex:1; height:1px; background:linear-gradient(90deg,transparent,var(--gold-line),transparent); }
        .divider-dot { width:5px; height:5px; background:var(--gold-dim); border-radius:1px; transform:rotate(45deg); flex-shrink:0; }

        /* ── LOADING ── */
        .loading { min-height:60vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:40px; }
        .spinner { width:88px; height:88px; position:relative; }
        .spinner::before, .spinner::after { content:''; position:absolute; border-radius:50%; }
        .spinner::before { inset:0; border:1.5px solid rgba(240,192,64,.12); }
        .spinner::after { inset:12px; border:2px solid transparent; border-top-color:var(--gold); border-right-color:rgba(34,197,94,.6); animation:spin 1.4s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .spinner-ring { position:absolute; inset:-16px; border:1px dashed rgba(34,197,94,.12); border-radius:50%; animation:spin 8s linear infinite reverse; }
        .spinner-dot { position:absolute; top:50%; left:50%; width:8px; height:8px; margin:-4px; background:var(--gold); border-radius:2px; transform:rotate(45deg); box-shadow:0 0 12px rgba(240,192,64,.6); }
        .loading-text { font-family:'Syne',sans-serif; font-size:16px; font-weight:500; color:rgba(200,240,210,.5); letter-spacing:1px; animation:fade-pulse 2s ease-in-out infinite; text-align:center; }
        @keyframes fade-pulse { 0%,100%{opacity:.3} 50%{opacity:1} }

        /* ── ERROR ── */
        .error { background:rgba(180,40,20,.12); border:1px solid rgba(240,100,80,.2); border-radius:var(--radius-sm); padding:14px 18px; text-align:center; color:#f09080; font-size:13px; margin-top:12px; letter-spacing:.3px; }

        /* ── RESULTS ── */
        .back-btn {
          display:inline-flex; align-items:center; gap:8px;
          background:none; border:1px solid rgba(240,192,64,.18); border-radius:999px;
          color:var(--gold-dim); padding:9px 18px; cursor:pointer;
          font-family:'Syne',sans-serif; font-size:10px; letter-spacing:3px; text-transform:uppercase;
          margin-bottom:24px; transition:all .2s;
        }
        .back-btn:hover { border-color:rgba(240,192,64,.45); color:var(--gold); }

        .preview-wrap {
          background: rgba(6,24,12,.8);
          border: 1px solid var(--gold-line);
          border-radius: var(--radius);
          padding: 24px;
          aspect-ratio: 1;
          display: flex; align-items:center; justify-content:center;
          overflow:hidden; position:relative; margin-bottom:14px;
          box-shadow: 0 8px 40px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.04);
        }
        .preview-wrap::before {
          content:''; position:absolute; inset:0; border-radius:var(--radius);
          background:radial-gradient(ellipse at 30% 20%,rgba(34,197,94,.06),transparent 60%);
        }
        .preview-wrap svg { width:100%; height:100%; display:block; position:relative; z-index:1; }

        .variant-list { display:flex; flex-direction:column; gap:10px; }
        .variant-card {
          display:flex; gap:14px; align-items:center;
          background:rgba(8,32,16,.6);
          border:1px solid rgba(240,192,64,.1);
          border-radius: var(--radius-sm);
          padding:12px; cursor:pointer; transition:all .2s;
        }
        .variant-card:hover, .variant-card.active {
          border-color:rgba(240,192,64,.38);
          background:rgba(14,50,26,.7);
          box-shadow:0 4px 16px rgba(0,0,0,.3);
        }
        .variant-thumb { width:66px; height:66px; flex-shrink:0; border-radius:8px; overflow:hidden; border:1px solid rgba(240,192,64,.12); }
        .variant-thumb svg { width:100%; height:100%; display:block; }
        .variant-num { font-family:'Syne',sans-serif; font-size:9px; font-weight:700; letter-spacing:2px; color:var(--gold-dim); margin-bottom:3px; }
        .variant-name { font-family:'Syne',sans-serif; font-size:14px; font-weight:600; color:var(--white); margin-bottom:3px; }
        .variant-concept { font-size:11px; color:var(--text-dim); line-height:1.5; }

        .action-row { display:flex; gap:8px; }
        .act-btn {
          flex:1; padding:14px 8px;
          background:rgba(8,32,16,.7);
          border:1px solid rgba(240,192,64,.2);
          border-radius:var(--radius-sm);
          color:rgba(240,192,64,.75);
          cursor:pointer;
          font-family:'Syne',sans-serif; font-size:9px; font-weight:600;
          letter-spacing:2.5px; text-transform:uppercase;
          transition:all .2s;
        }
        .act-btn:hover { border-color:rgba(240,192,64,.5); color:var(--gold); background:rgba(14,50,26,.7); transform:translateY(-1px); }

        .regen-btn {
          width:100%; padding:13px; margin-top:8px;
          background:transparent; border:1px solid rgba(34,197,94,.15); border-radius:var(--radius-sm);
          color:rgba(34,197,94,.4); cursor:pointer;
          font-family:'Syne',sans-serif; font-size:9px; font-weight:600; letter-spacing:3px; text-transform:uppercase;
          transition:all .2s;
        }
        .regen-btn:hover { border-color:rgba(34,197,94,.35); color:rgba(34,197,94,.75); }

        .save-row { display:flex; gap:8px; margin-top:8px; }
        .save-status { font-size:11px; color:rgba(34,197,94,.6); letter-spacing:.5px; margin-top:6px; padding:0 2px; }

        /* ── BOTTOM NAV ── */
        .nav {
          position:fixed; bottom:0; left:0; right:0; z-index:100;
          background:linear-gradient(to top, rgba(3,14,8,.97), rgba(5,22,12,.94));
          border-top:1px solid rgba(240,192,64,.12);
          backdrop-filter:blur(20px);
          display:flex; justify-content:space-around;
          padding:12px 0 calc(12px + env(safe-area-inset-bottom));
        }
        .nav-btn {
          display:flex; flex-direction:column; align-items:center; gap:4px;
          background:none; border:none; cursor:pointer;
          color:rgba(200,240,210,.25);
          font-family:'Syne',sans-serif; font-size:8px; font-weight:600;
          letter-spacing:1.5px; text-transform:uppercase;
          padding:0 20px; transition:color .2s;
        }
        .nav-btn.active { color:var(--gold); }
        .nav-icon { font-size:20px; line-height:1; margin-bottom:1px; }
        .nav-dot { width:4px; height:4px; border-radius:50%; background:var(--gold); margin-top:2px; animation:nav-pop .2s ease; }
        @keyframes nav-pop { from{transform:scale(0)} to{transform:scale(1)} }

        @media(max-width:480px) {
          .style-grid { grid-template-columns:repeat(2,1fr); }
          .pal-grid { grid-template-columns:repeat(3,1fr); }
          .inp-row { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="app">
        <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>

        <div className="scroll">
          <div className="wrap">

            {/* ── HEADER ── */}
            <div className="header">
              <LogoBankWordmark />
            </div>

            {/* ══ HOME / GENERATE VIEW ══════════════════════════════════════ */}
            {(step === "home" || step === "generate") && (
              <div>
                {/* Name input card */}
                <div className="card">
                  <label className="inp-label">Name or Brand</label>
                  <input
                    ref={inputRef}
                    className="inp"
                    placeholder="Your name or brand…"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && generate()}
                    autoComplete="off"
                  />
                  <div className="inp-row">
                    <div>
                      <label className="inp-label" style={{marginTop:12}}>Tagline / Role</label>
                      <input className="inp inp-sm" placeholder="e.g. Project Manager" value={tagline} onChange={e => setTagline(e.target.value)} />
                    </div>
                    <div>
                      <label className="inp-label" style={{marginTop:12}}>Industry</label>
                      <input className="inp inp-sm" placeholder="e.g. Finance, Tech" value={industry} onChange={e => setIndustry(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Style selector */}
                <div className="card">
                  <div className="sec-head">Design Style</div>
                  <div className="style-grid">
                    {STYLES.map(s => (
                      <button key={s.id} className={`style-btn${style===s.id?" active":""}`} onClick={() => setStyle(s.id)}>
                        <span className="style-icon">{s.icon}</span>
                        <span className="style-label">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Palette selector */}
                <div className="card">
                  <div className="sec-head">Colour Palette</div>
                  <div className="pal-grid">
                    {PALETTES.map(p => (
                      <button key={p.id} className={`pal-btn${paletteId===p.id?" active":""}`} onClick={() => setPaletteId(p.id)} title={p.name}>
                        <div className="pal-swatch">
                          <div style={{flex:1,background:p.bg}}/>
                          <div style={{flex:.6,background:p.mid}}/>
                          <div style={{flex:.4,background:p.accent}}/>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && <div className="error">{error}</div>}

                <button className="cta" onClick={generate} disabled={!name.trim()}>
                  <span>✦ &nbsp;Generate Logo&nbsp; ✦</span>
                </button>
              </div>
            )}

            {/* ══ GENERATING ══════════════════════════════════════════════════ */}
            {step === "generating" && (
              <div className="loading">
                <div className="spinner">
                  <div className="spinner-ring"/>
                  <div className="spinner-dot"/>
                </div>
                <div className="loading-text">{LOADING_PHRASES[phraseIdx]}</div>
              </div>
            )}

            {/* ══ RESULTS ════════════════════════════════════════════════════ */}
            {step === "results" && logos.length > 0 && (
              <div>
                <button className="back-btn" onClick={() => setStep("home")}>← New Logo</button>

                {/* Main preview */}
                <div className="preview-wrap" dangerouslySetInnerHTML={{__html: logos[selected]?.svg}} />

                {/* Actions */}
                <div className="action-row" style={{marginBottom:8}}>
                  <button className="act-btn" onClick={downloadSVG}>↓ &nbsp;SVG</button>
                  <button className="act-btn" onClick={saveLogo}>⊕ &nbsp;Save</button>
                </div>
                {savedMsg && <div className="save-status">{savedMsg}</div>}
                <button className="regen-btn" onClick={generate}>↺ &nbsp;Regenerate All 3</button>

                <div className="divider" style={{margin:"20px 0 16px"}}>
                  <div className="divider-line"/><div className="divider-dot"/><div className="divider-line"/>
                </div>

                {/* Variant cards */}
                <div className="sec-head">3 Concepts</div>
                <div className="variant-list">
                  {logos.map((logo, i) => (
                    <div key={i} className={`variant-card${selected===i?" active":""}`} onClick={() => setSelected(i)}>
                      <div className="variant-thumb" dangerouslySetInnerHTML={{__html:logo.svg}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div className="variant-num">CONCEPT {i+1}</div>
                        <div className="variant-name">{logo.name}</div>
                        <div className="variant-concept">{logo.concept}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── BOTTOM NAV ── */}
        <nav className="nav">
          {[
            {id:"home",  icon:"⌂", label:"Home"},
            {id:"generate", icon:"◈", label:"Create"},
            {id:"library",  icon:"⊞", label:"Library"},
            {id:"settings", icon:"⚙", label:"Settings"},
          ].map(n => (
            <button key={n.id} className={`nav-btn${navTab===n.id?" active":""}`}
              onClick={() => { setNavTab(n.id); if(n.id==="home"||n.id==="generate") setStep(n.id==="generate"?"generate":"home"); }}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
              {navTab===n.id && <span className="nav-dot"/>}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

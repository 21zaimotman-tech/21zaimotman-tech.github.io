import { useState, useEffect } from "react"
import { PHOTO_B64 } from "./assets/photo.js"
import archImg from "./assets/architecture.png"
import dspArch from "./assets/dsp-architecture.png"

const TICKER_ITEMS = [
  "Python","FAISS","BM25","RAG","XGBoost","PyTorch","TensorFlow",
  "Transformers","FastMCP","Airflow","Docker","PySpark","React",
  "OpenCV","GenAI","HuggingFace","Scikit-Learn","Gradio","ViT",
]

const SKILLS = {
  "AI / LLMs":    ["RAG","Prompt Engineering","FAISS","BM25","Transformers","XGBoost","CNN/RNN/LSTM","Computer Vision"],
  "Frameworks":   ["PyTorch","TensorFlow/Keras","Scikit-Learn","OpenAI API","Gradio","FastMCP","Flask","OpenCV"],
  "Data & Infra": ["Apache Airflow","PySpark","Docker","PostgreSQL","MongoDB","Neo4j"],
  "Programming":  ["Python","C++","JavaScript","PHP","Git"],
}

const NAV = ["PROJECTS","SKILLS","EXPERIENCE","CONTACT"]

const STYLES = `
  @keyframes ticker { from { transform:translateX(0) } to { transform:translateX(-50%) } }
  @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes spin   { to { transform:rotate(360deg) } }
  @keyframes bob    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
  @keyframes fadeup { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  * { box-sizing:border-box; margin:0; padding:0 }
  html { scroll-behavior:smooth }
  section { scroll-margin-top:56px }
  body { overflow-x:hidden }
  a { text-decoration:none; color:inherit }
  ::selection { background:var(--fg); color:var(--bg) }
  :focus-visible { outline:2px solid var(--fg); outline-offset:2px }
  ::-webkit-scrollbar { width:10px; height:10px }
  ::-webkit-scrollbar-track { background:var(--bg) }
  ::-webkit-scrollbar-thumb { background:var(--border); border:2px solid var(--bg) }
  .reveal-hidden { opacity:0; transform:translateY(24px); transition:opacity 0.6s ease,transform 0.6s ease }
  .reveal-visible { opacity:1; transform:translateY(0) }
  .hi { transition:background 0.08s,color 0.08s; cursor:pointer }
  .hi:hover { background:var(--fg)!important; color:var(--bg)!important }
  .lift { transition:transform 0.25s ease, box-shadow 0.25s ease }
  .lift:hover { transform:translateY(-4px); box-shadow:8px 8px 0 var(--border) }
  .navlink { position:relative; transition:color 0.15s }
  .navlink::after { content:""; position:absolute; left:0; bottom:-5px; height:1.5px; width:0; background:var(--fg); transition:width 0.22s ease }
  .navlink:hover::after, .navlink.active::after { width:100% }
  .navlink.active { color:var(--fg)!important }
  .ticker-track { animation:ticker 32s linear infinite }
  .ticker-wrap:hover .ticker-track { animation-play-state:paused }
  .chip { transition:background 0.12s,color 0.12s,border-color 0.12s }
  .chip:hover { background:var(--fg); color:var(--bg); border-color:var(--fg) }
  @media(max-width:768px){
    .hero-inner{flex-direction:column-reverse!important}
    .hero-photo{width:100%!important;max-width:300px!important;align-self:center}
    .skills-grid{grid-template-columns:1fr 1fr!important}
    .exp-grid{grid-template-columns:1fr!important}
    .proj-inner{grid-template-columns:1fr!important}
    .arch{flex-wrap:wrap!important}
    nav .nl{display:none!important}
    .scroll-cue{display:none!important}
  }
  @media(prefers-reduced-motion:reduce){
    *{animation-duration:0.001ms!important;animation-iteration-count:1!important;transition-duration:0.001ms!important}
    html{scroll-behavior:auto}
  }
`

/* ---- Reusable section header ---- */
function SectionHead({ idx, title, note, border, muted }) {
  return (
    <div className="reveal-hidden" style={{ borderBottom:`1.5px solid ${border}`,paddingBottom:12,marginBottom:44,display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:16 }}>
      <div style={{ display:"flex",alignItems:"baseline",gap:14 }}>
        <span style={{ fontSize:10,fontWeight:900,color:muted,letterSpacing:1 }}>{idx}</span>
        <span style={{ fontSize:10,letterSpacing:5,textTransform:"uppercase",fontWeight:700 }}>{title}</span>
      </div>
      {note && <span style={{ fontSize:8,color:muted,letterSpacing:2,textTransform:"uppercase",whiteSpace:"nowrap" }}>{note}</span>}
    </div>
  )
}

/* ---- Demo modal: facade -> health-check -> iframe OR graceful offline panel ---- */
const SPACE_URL = "https://microbe34-juribot.hf.space"
const SPACE_API = "https://huggingface.co/api/spaces/Microbe34/juribot"
const SPACE_PAGE = "https://huggingface.co/spaces/Microbe34/juribot"
const CODE_URL = "https://github.com/tahaouy/legal-rag"
const ERROR_STAGES = ["RUNTIME_ERROR","BUILD_ERROR","CONFIG_ERROR","NO_APP_FILE","PAUSED","STOPPED","DELETING"]

function DemoModal({ onClose, fg, bg, border, muted }) {
  const [phase, setPhase] = useState("facade") // facade | checking | live | error
  const [loaded, setLoaded] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = "" }
  }, [onClose])

  useEffect(() => {
    if (phase !== "live") return
    const t = setTimeout(() => { if (!loaded) setTimedOut(true) }, 12000)
    return () => clearTimeout(t)
  }, [phase, loaded])

  const launch = async () => {
    setPhase("checking")
    try {
      const r = await fetch(SPACE_API, { cache:"no-store" })
      const j = await r.json()
      const stage = j?.runtime?.stage || ""
      setPhase(ERROR_STAGES.includes(stage) ? "error" : "live")
    } catch {
      setPhase("live") // health-check blocked? optimistically try the iframe
    }
  }

  const linkBtn = { fontSize:8,letterSpacing:2,color:muted,border:`1px solid ${border}`,padding:"5px 11px",textTransform:"uppercase" }
  const inlineLink = { textDecoration:"underline",color:fg }

  return (
    <div onClick={onClose}
      style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",animation:"fadeup 0.2s ease" }}>
      <div onClick={e=>e.stopPropagation()}
        style={{ background:bg,border:`2px solid ${border}`,width:"min(940px,96vw)",height:"86vh",fontFamily:"'Courier New',monospace",color:fg,display:"flex",flexDirection:"column",boxShadow:"12px 12px 0 rgba(0,0,0,0.4)" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 18px",borderBottom:`1.5px solid ${border}`,flexShrink:0,gap:10 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,minWidth:0 }}>
            <span style={{ width:7,height:7,borderRadius:"50%",background:phase==="error"?"#f59e0b":"#22c55e",display:"inline-block",animation:"blink 1.5s infinite",flexShrink:0 }} />
            <span style={{ fontSize:9,letterSpacing:3,color:muted,textTransform:"uppercase",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>JuriBot · Legal RAG · Hugging Face Space</span>
          </div>
          <div style={{ display:"flex",gap:7,alignItems:"center",flexShrink:0 }}>
            <a href={CODE_URL} target="_blank" rel="noopener noreferrer" style={linkBtn}>Code ↗</a>
            <a href={SPACE_PAGE} target="_blank" rel="noopener noreferrer" style={linkBtn}>HF ↗</a>
            <button onClick={onClose} aria-label="Close demo" style={{ background:"none",border:`1.5px solid ${border}`,color:fg,padding:"4px 11px",fontSize:14,cursor:"pointer",fontFamily:"inherit" }}>✕</button>
          </div>
        </div>

        <div style={{ flex:1,position:"relative",overflow:"hidden" }}>
          {phase === "facade" && (
            <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"32px" }}>
              <div style={{ fontSize:42,marginBottom:18 }}>⚖️</div>
              <div style={{ fontSize:22,fontWeight:900,letterSpacing:"-0.5px",textTransform:"uppercase",marginBottom:12 }}>JuriBot Legal RAG</div>
              <p style={{ fontSize:12,lineHeight:1.8,color:muted,maxWidth:440,marginBottom:24 }}>
                Ask a question about French labour, civil, or civil-procedure law. The demo runs on a free Hugging Face Space, it may take 20-40s to wake from sleep on first launch.
              </p>
              <button onClick={launch} className="hi"
                style={{ background:fg,color:bg,border:"none",padding:"13px 28px",fontSize:10,letterSpacing:3,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase" }}>
                ▶ Launch live demo
              </button>
            </div>
          )}

          {phase === "checking" && (
            <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px" }}>
              <div style={{ width:34,height:34,border:`3px solid ${border}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",marginBottom:18 }} />
              <div style={{ fontSize:10,letterSpacing:3,color:muted,textTransform:"uppercase" }}>Checking demo status…</div>
            </div>
          )}

          {phase === "error" && (
            <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"32px" }}>
              <div style={{ fontSize:34,marginBottom:14 }}>🛠️</div>
              <div style={{ fontSize:16,fontWeight:900,letterSpacing:"-0.3px",textTransform:"uppercase",marginBottom:12 }}>Demo temporarily offline</div>
              <p style={{ fontSize:12,lineHeight:1.85,color:muted,maxWidth:460,marginBottom:22 }}>
                The hosted Space is currently rebuilding. In the meantime you can explore the full source on GitHub: hybrid retrieval, the 3-agent pipeline, and the evaluation harness.
              </p>
              <div style={{ display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center" }}>
                <a href={CODE_URL} target="_blank" rel="noopener noreferrer" className="hi"
                  style={{ background:fg,color:bg,padding:"11px 20px",fontSize:9,letterSpacing:2.5,textTransform:"uppercase",fontWeight:700 }}>View source ↗</a>
                <a href={SPACE_PAGE} target="_blank" rel="noopener noreferrer" className="hi"
                  style={{ border:`1.5px solid ${border}`,color:fg,padding:"11px 20px",fontSize:9,letterSpacing:2.5,textTransform:"uppercase" }}>Open Space ↗</a>
              </div>
            </div>
          )}

          {phase === "live" && !loaded && (
            <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"32px",zIndex:1 }}>
              <div style={{ width:34,height:34,border:`3px solid ${border}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",marginBottom:18 }} />
              <div style={{ fontSize:10,letterSpacing:3,color:muted,textTransform:"uppercase" }}>
                {timedOut ? "Still waking up…" : "Loading the Space…"}
              </div>
              {timedOut && (
                <p style={{ fontSize:11,lineHeight:1.8,color:muted,maxWidth:420,marginTop:14 }}>
                  Free Spaces can be slow to cold-start. You can{" "}
                  <a href={SPACE_URL} target="_blank" rel="noopener noreferrer" style={inlineLink}>open it in a new tab ↗</a>{" "}
                  or view the{" "}
                  <a href={CODE_URL} target="_blank" rel="noopener noreferrer" style={inlineLink}>source ↗</a>.
                </p>
              )}
            </div>
          )}

          {phase === "live" && (
            <iframe
              src={SPACE_URL}
              onLoad={()=>setLoaded(true)}
              style={{ width:"100%",height:"100%",border:"none",opacity:loaded?1:0,transition:"opacity 0.3s" }}
              allow="microphone"
              title="JuriBot Legal RAG Demo"
            />
          )}
        </div>
      </div>
    </div>
  )
}

/* ---- Image lightbox: click a figure to view it full-size ---- */
function ImageModal({ src, caption, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = "" }
  }, [onClose])
  return (
    <div onClick={onClose}
      style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",zIndex:2000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",gap:14,animation:"fadeup 0.2s ease",fontFamily:"'Courier New',monospace" }}>
      <div onClick={e=>e.stopPropagation()} style={{ position:"relative",maxWidth:"96vw",maxHeight:"86vh" }}>
        <button onClick={onClose} aria-label="Close"
          style={{ position:"absolute",top:-16,right:-16,width:32,height:32,borderRadius:"50%",background:"#fff",color:"#1a1a1a",border:"none",fontSize:15,cursor:"pointer",fontFamily:"inherit",lineHeight:1 }}>✕</button>
        <img src={src} alt={caption||"figure"} style={{ maxWidth:"96vw",maxHeight:"86vh",display:"block",background:"#fff",border:"3px solid #fff" }} />
      </div>
      {caption && <div style={{ color:"#bbb",fontSize:9,letterSpacing:2,textTransform:"uppercase",textAlign:"center",maxWidth:680,lineHeight:1.7 }}>{caption}</div>}
    </div>
  )
}

export default function Portfolio() {
  const [inv, setInv] = useState(false)
  const [stats, setStats] = useState({ agents:0, pages:0, retrievers:0 })
  const [statsOn, setStatsOn] = useState(false)
  const [prog, setProg] = useState(0)
  const [demo, setDemo] = useState(false)
  const [copied, setCopied] = useState(false)
  const [active, setActive] = useState("")
  const [lightbox, setLightbox] = useState(null)

  const bg     = inv ? "#1a1a1a" : "#F5F0E8"
  const fg     = inv ? "#F5F0E8" : "#1a1a1a"
  const muted  = inv ? "#888"    : "#999"
  const border = inv ? "#555"    : "#1a1a1a"
  const mid    = inv ? "#222"    : "#e8e3db"
  const ghost  = inv ? "#2a2a2a" : "#ddd"
  const gridc  = inv ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.04)"

  useEffect(() => {
    const h = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProg(max > 0 ? (window.scrollY / max) * 100 : 0)
    }
    window.addEventListener("scroll", h, { passive:true })
    return () => window.removeEventListener("scroll", h)
  }, [])

  useEffect(() => {
    if (!statsOn) return
    const steps = 45; let s = 0
    const t = setInterval(() => {
      s++
      const e = 1 - Math.pow(1 - s/steps, 3)
      setStats({ agents:Math.round(3*e), pages:Math.round(3900*e), retrievers:Math.round(2*e) })
      if (s >= steps) clearInterval(t)
    }, 1200/steps)
    return () => clearInterval(t)
  }, [statsOn])

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add("reveal-visible")
          if (en.target.dataset.st) setStatsOn(true)
          obs.unobserve(en.target)
        }
      })
    }, { threshold: 0.12 })
    document.querySelectorAll(".reveal-hidden").forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // scroll-spy for nav highlight
  useEffect(() => {
    const ids = NAV.map(s => s.toLowerCase())
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) setActive(en.target.id) })
    }, { rootMargin: "-45% 0px -50% 0px" })
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  const fmtPg = stats.pages >= 1000 ? (stats.pages/1000).toFixed(1)+"K" : stats.pages
  const copy = () => { navigator.clipboard?.writeText("21zaimotman@gmail.com"); setCopied(true); setTimeout(()=>setCopied(false),2000) }

  const archNodes = [
    { label:"INPUT",   text:"USER\nQUERY",              strong:false },
    { arrow:true },
    { label:"AGENT 1", text:"RESEARCHER\nFAISS+BM25+RRF", strong:true },
    { arrow:true },
    { label:"AGENT 2", text:"FACT-CHECK\nDDG+MCP",       strong:true },
    { arrow:true },
    { label:"AGENT 3", text:"SYNTHESIZER\nGPT-4o-mini",  strong:true },
    { arrow:true },
    { label:"OUTPUT",  text:"CITED\nANSWER",             strong:false },
  ]

  const vqaNodes = [
    { label:"VISION",  text:"ViT\nENCODER"          },
    { sym:"×" },
    { label:"FUSION",  text:"CROSS-MODAL\nATTENTION" },
    { sym:"→" },
    { label:"LANGUAGE",text:"GPT-STYLE\nDECODER"    },
  ]

  const gridBg = {
    backgroundImage:`linear-gradient(${gridc} 1px,transparent 1px),linear-gradient(90deg,${gridc} 1px,transparent 1px)`,
    backgroundSize:"44px 44px",
  }

  return (
    <div style={{ background:bg, color:fg, fontFamily:"'Courier New',monospace", minHeight:"100vh", transition:"background 0.3s,color 0.3s" }}>
      <style>{STYLES}</style>
      <style>{`:root{--fg:${fg};--bg:${bg};--border:${border}}`}</style>

      <div style={{ position:"fixed",top:0,left:0,height:3,width:`${prog}%`,background:fg,zIndex:1002,transition:"width 0.1s" }} />

      <nav style={{ position:"fixed",top:3,left:0,right:0,zIndex:1001,background:bg,borderBottom:`1px solid ${border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 32px",height:50,transition:"background 0.3s,border-color 0.3s" }}>
        <a href="#hero" style={{ fontSize:13,fontWeight:900,letterSpacing:2,border:`1.5px solid ${border}`,padding:"3px 8px" }}>OZ</a>
        <div style={{ display:"flex",gap:30,alignItems:"center" }}>
          <div className="nl" style={{ display:"flex",gap:30,alignItems:"center" }}>
            {NAV.map(s => (
              <a key={s} href={`#${s.toLowerCase()}`}
                className={`navlink${active===s.toLowerCase()?" active":""}`}
                style={{ fontSize:9,letterSpacing:2,color:muted }}>{s}</a>
            ))}
          </div>
          <button onClick={()=>setInv(v=>!v)} aria-label="Toggle dark mode"
            style={{ background:"none",border:`1px solid ${border}`,color:fg,padding:"5px 11px",fontSize:9,letterSpacing:2,cursor:"pointer",fontFamily:"inherit" }}>
            {inv ? "◐ LIGHT" : "◑ DARK"}
          </button>
        </div>
      </nav>

      <section id="hero" style={{ paddingTop:90, position:"relative", ...gridBg }}>
        <div style={{ maxWidth:1100,margin:"0 auto",padding:"0 32px" }}>
          <div className="hero-inner" style={{ display:"flex",gap:44,alignItems:"flex-start" }}>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontSize:9,letterSpacing:5,color:muted,marginBottom:16,textTransform:"uppercase",display:"flex",alignItems:"center",gap:10 }}>
                <span style={{ width:18,height:1,background:border,display:"inline-block" }} />
                Master's in AI Systems · EPITA Paris
              </div>
              <h1 style={{ fontSize:"clamp(54px,7.5vw,102px)",fontWeight:900,lineHeight:0.86,letterSpacing:"-2.5px",marginBottom:26,textTransform:"uppercase" }}>
                ZAIM<br/>OTMANE<span style={{ color:fg }}>.</span>
              </h1>
              <div style={{ borderTop:`1.5px solid ${border}`,paddingTop:20,marginBottom:26 }}>
                <p style={{ fontSize:13.5,lineHeight:1.9,maxWidth:520 }}>
                  Builds ML systems end-to-end, from data ingestion to deployed inference.
                  <span style={{ background:mid,padding:"0 4px" }}>GenAI</span> ·
                  <span style={{ background:mid,padding:"0 4px" }}> retrieval systems</span> ·
                  <span style={{ background:mid,padding:"0 4px" }}> MLOps</span>.
                  Seeking a 6-month <em>stage de fin d'études</em>, available immediately.
                </p>
              </div>
              <div style={{ display:"flex",gap:10,flexWrap:"wrap",marginBottom:22 }}>
                <a href="#projects" className="hi" style={{ background:fg,color:bg,padding:"12px 26px",fontSize:9,letterSpacing:3,display:"inline-block",textTransform:"uppercase",fontWeight:700 }}>
                  VIEW PROJECTS →
                </a>
                <a href="https://linkedin.com/in/otmane-zaim-048b3a2b0" target="_blank" rel="noopener noreferrer" className="hi"
                  style={{ border:`1.5px solid ${border}`,color:fg,padding:"12px 18px",fontSize:9,letterSpacing:3,display:"inline-block" }}>LINKEDIN ↗</a>
                <a href="https://github.com/21zaimotman-tech" target="_blank" rel="noopener noreferrer" className="hi"
                  style={{ border:`1.5px solid ${border}`,color:fg,padding:"12px 18px",fontSize:9,letterSpacing:3,display:"inline-block" }}>GITHUB ↗</a>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ width:7,height:7,borderRadius:"50%",background:"#22c55e",display:"inline-block",animation:"blink 1.5s infinite" }} />
                <span style={{ fontSize:8,letterSpacing:3,color:muted,textTransform:"uppercase" }}>Available for internship · immediately</span>
              </div>
            </div>
            <div className="hero-photo" style={{ width:330,flexShrink:0 }}>
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute",inset:0,transform:"translate(10px,10px)",border:`1.5px solid ${border}`,pointerEvents:"none" }} />
                <img src={`data:image/jpeg;base64,${PHOTO_B64}`} alt="Otmane Zaim"
                  style={{ width:"100%",display:"block",border:`2px solid ${border}`,position:"relative",filter:inv?"grayscale(15%)":"none",transition:"filter 0.3s" }} />
                <div style={{ position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,0.74))",padding:"22px 14px 14px",pointerEvents:"none" }}>
                  <div style={{ color:"#fff",fontSize:8,letterSpacing:3,textTransform:"uppercase" }}>AI/ML Engineer · Paris, France</div>
                </div>
              </div>
            </div>
          </div>
          <a href="#projects" className="scroll-cue" aria-label="Scroll to projects"
            style={{ display:"flex",alignItems:"center",gap:8,marginTop:40,paddingBottom:8,color:muted,fontSize:8,letterSpacing:3,textTransform:"uppercase",width:"fit-content" }}>
            <span style={{ animation:"bob 1.6s ease-in-out infinite",display:"inline-block" }}>↓</span> Scroll
          </a>
        </div>
      </section>

      <div className="ticker-wrap" style={{ borderTop:`1.5px solid ${border}`,borderBottom:`1.5px solid ${border}`,overflow:"hidden",padding:"11px 0",marginTop:34,background:mid }}>
        <div className="ticker-track" style={{ display:"flex",width:"max-content" }}>
          {[...TICKER_ITEMS,...TICKER_ITEMS].map((t,i) => (
            <span key={i} style={{ fontSize:9,letterSpacing:3,textTransform:"uppercase",color:muted,padding:"0 18px",whiteSpace:"nowrap" }}>
              {t} <span style={{ color:border }}>·</span>
            </span>
          ))}
        </div>
      </div>

      <section id="projects" style={{ padding:"76px 0" }}>
        <div style={{ maxWidth:1100,margin:"0 auto",padding:"0 32px" }}>
          <SectionHead idx="01" title="Selected Projects" note="04 Works" border={border} muted={muted} />

          {/* ---- 01 JuriBot ---- */}
          <div className="reveal-hidden" style={{ marginBottom:72 }} data-st="1">
            <div style={{ display:"flex",alignItems:"baseline",gap:14,marginBottom:22 }}>
              <span style={{ fontSize:64,fontWeight:900,color:ghost,lineHeight:1,letterSpacing:"-2px",userSelect:"none" }}>01</span>
              <div>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontSize:27,fontWeight:900,letterSpacing:"-0.5px",textTransform:"uppercase" }}>JURIBOT</span>
                  <span style={{ fontSize:7,letterSpacing:2,border:`1px solid #22c55e`,color:"#22c55e",padding:"2px 6px",textTransform:"uppercase" }}>● Live</span>
                </div>
                <div style={{ fontSize:10,color:muted,letterSpacing:2,marginTop:3 }}>Legal RAG Chatbot · GenAI Hackathon EPITA · Apr 2026</div>
              </div>
            </div>
            <div className="proj-inner" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:30 }}>
              <div>
                <p style={{ fontSize:13,lineHeight:1.9,marginBottom:18 }}>
                  Hybrid FAISS + BM25 retrieval with Reciprocal Rank Fusion over 3,900 pages of French legal codes feeds a 3-agent pipeline: Internal Researcher → External Fact-Checker → Synthesizer. A cross-encoder reranks candidates before generation. Evaluated on a 20-question benchmark covering factual, cross-reference, out-of-scope and ambiguous cases.
                </p>
                <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:20 }}>
                  {["Python 3.12","FAISS","BM25","RRF","Cross-Encoder","FastMCP","GPT-4o-mini","Gradio"].map(t=>(
                    <span key={t} className="chip" style={{ border:`1px solid ${border}`,padding:"3px 8px",fontSize:8,letterSpacing:1.5,textTransform:"uppercase",color:muted }}>{t}</span>
                  ))}
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  <a href="https://github.com/tahaouy/legal-rag" target="_blank" rel="noopener noreferrer" className="hi"
                    style={{ border:`1.5px solid ${border}`,padding:"10px 16px",fontSize:8,letterSpacing:2.5,color:fg,display:"inline-block" }}>GITHUB ↗</a>
                  <button onClick={()=>setDemo(true)} className="hi"
                    style={{ background:fg,color:bg,border:"none",padding:"10px 16px",fontSize:8,letterSpacing:2.5,cursor:"pointer",fontFamily:"inherit",fontWeight:700 }}>LIVE DEMO →</button>
                </div>
                <div style={{ marginTop:12,fontSize:8,color:muted,letterSpacing:1 }}>Corpus: Code du travail + Code civil + Code de procédure civile</div>
              </div>
              <div className="lift" style={{ border:`1.5px solid ${border}`,padding:18,background:mid,display:"flex",flexDirection:"column" }}>
                <div style={{ fontSize:7,letterSpacing:3,color:muted,marginBottom:14,textTransform:"uppercase" }}>3-Agent Pipeline</div>
                <div style={{ flex:1,display:"flex",alignItems:"center" }}>
                  <div className="arch" style={{ display:"flex",alignItems:"center",gap:0,flexWrap:"nowrap",fontSize:8,overflowX:"auto",paddingBottom:4,width:"100%" }}>
                    {archNodes.map((n,i) => n.arrow ? (
                      <div key={i} style={{ padding:"0 3px",color:muted,fontSize:12,flexShrink:0 }}>→</div>
                    ) : (
                      <div key={i} style={{ border:`${n.strong?"1.5px":"1px"} solid ${n.strong?fg:border}`,padding:"9px 9px",textAlign:"center",minWidth:66,flexShrink:0,background:n.strong?bg:"transparent" }}>
                        <div style={{ fontSize:6,letterSpacing:1,color:muted }}>{n.label}</div>
                        <div style={{ fontWeight:700,fontSize:7,marginTop:2,lineHeight:1.4,whiteSpace:"pre-line" }}>{n.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex",gap:16,marginTop:14,paddingTop:12,borderTop:`1px solid ${inv?"#333":"#d0cbc0"}` }}>
                  {[[stats.agents,"AGENTS"],[fmtPg,"PAGES"],["20","EVAL Q'S"]].map(([n,l])=>(
                    <div key={l}>
                      <div style={{ fontSize:22,fontWeight:900,letterSpacing:"-1px" }}>{n}</div>
                      <div style={{ fontSize:6,color:muted,letterSpacing:2,marginTop:2,textTransform:"uppercase" }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ---- 02 DSP ---- */}
          <div className="reveal-hidden">
            <div style={{ display:"flex",alignItems:"baseline",gap:14,marginBottom:22 }}>
              <span style={{ fontSize:64,fontWeight:900,color:ghost,lineHeight:1,letterSpacing:"-2px",userSelect:"none" }}>02</span>
              <div>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontSize:27,fontWeight:900,letterSpacing:"-0.5px",textTransform:"uppercase" }}>DSP PIPELINE</span>
                  <span style={{ fontSize:7,letterSpacing:2,border:`1px solid ${fg}`,color:fg,padding:"2px 6px",textTransform:"uppercase" }}>◆ MLOps · CI/CD</span>
                </div>
                <div style={{ fontSize:10,color:muted,letterSpacing:2,marginTop:3 }}>End-to-End MLOps · Soccer Prediction · EPITA · 2026</div>
              </div>
            </div>
            <div className="proj-inner" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:30 }}>
              <div>
                <p style={{ fontSize:13,lineHeight:1.9,marginBottom:18 }}>
                  An end-to-end MLOps system orchestrated by Airflow 3 in Docker. CSV batches are validated with Great Expectations across five error categories, split into good/bad rows, and logged to Postgres. A FastAPI service serves the production model loaded from the MLflow registry via a @champion alias; a scheduled training DAG retrains, evaluates candidate against the current champion on a shared held-out test set, and promotes only when it wins, then hot-reloads the API with no downtime. Two Grafana dashboards track data quality and drift, with alerts routed to Teams by channel.
                </p>
                <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:20 }}>
                  {["Airflow 3","Docker","MLflow","Great Expectations","FastAPI","PostgreSQL","Grafana","scikit-learn","GitHub Actions"].map(t=>(
                    <span key={t} className="chip" style={{ border:`1px solid ${border}`,padding:"3px 8px",fontSize:8,letterSpacing:1.5,textTransform:"uppercase",color:muted }}>{t}</span>
                  ))}
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  <a href="https://github.com/21zaimotman-tech/dsp_soccer_prediction" target="_blank" rel="noopener noreferrer" className="hi"
                    style={{ background:fg,color:bg,border:"none",padding:"10px 16px",fontSize:8,letterSpacing:2.5,display:"inline-block",fontWeight:700 }}>GITHUB ↗</a>
                </div>
                <div style={{ marginTop:12,fontSize:8,color:muted,letterSpacing:1 }}>Runs locally via docker compose · 7 orchestrated services.</div>
              </div>
              <div className="lift" style={{ border:`1.5px solid ${border}`,padding:14,background:mid,display:"flex",flexDirection:"column" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                  <span style={{ fontSize:7,letterSpacing:3,color:muted,textTransform:"uppercase" }}>Architecture</span>
                  <span style={{ fontSize:7,letterSpacing:2,color:muted,textTransform:"uppercase" }}>Click to expand ⤢</span>
                </div>
                <div style={{ flex:1,display:"flex",alignItems:"center" }}>
                  <button onClick={()=>setLightbox({ src:dspArch, caption:"DSP soccer-prediction pipeline · Airflow ingestion (Great Expectations validation, good/bad split, Postgres, Teams alerts) and scheduled prediction · FastAPI serving the model · Streamlit web app" })} aria-label="Expand architecture diagram"
                    style={{ display:"block",width:"100%",padding:0,border:`1px solid ${border}`,background:"#fff",cursor:"zoom-in" }}>
                    <img src={dspArch} alt="DSP soccer-prediction pipeline architecture" style={{ width:"100%",display:"block" }} />
                  </button>
                </div>
                <div style={{ marginTop:10,fontSize:7,color:muted,letterSpacing:0.5,lineHeight:1.7 }}>
                  Airflow-orchestrated ingestion + prediction · Great Expectations validation · FastAPI + MLflow serving · PostgreSQL · Grafana + Teams alerts.
                </div>
                <div style={{ display:"flex",gap:16,marginTop:12,paddingTop:12,borderTop:`1px solid ${inv?"#333":"#d0cbc0"}` }}>
                  {[["3","AIRFLOW DAGS"],["5","GX CATEGORIES"],["2","DASHBOARDS"]].map(([n,l])=>(
                    <div key={l}>
                      <div style={{ fontSize:22,fontWeight:900,letterSpacing:"-1px" }}>{n}</div>
                      <div style={{ fontSize:6,color:muted,letterSpacing:2,marginTop:2,textTransform:"uppercase" }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ---- 03 Smart-Hospital ---- */}
          <div className="reveal-hidden" style={{ marginTop:72 }}>
            <div style={{ display:"flex",alignItems:"baseline",gap:14,marginBottom:22 }}>
              <span style={{ fontSize:64,fontWeight:900,color:ghost,lineHeight:1,letterSpacing:"-2px",userSelect:"none" }}>03</span>
              <div>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontSize:27,fontWeight:900,letterSpacing:"-0.5px",textTransform:"uppercase" }}>SMART-HOSPITAL</span>
                  <span style={{ fontSize:7,letterSpacing:2,border:`1px solid ${fg}`,color:fg,padding:"2px 6px",textTransform:"uppercase" }}>◆ AWS · ML</span>
                </div>
                <div style={{ fontSize:10,color:muted,letterSpacing:2,marginTop:3 }}>Serverless Data Lake & AI Pipeline on AWS · EPITA · 2026</div>
              </div>
            </div>
            <div className="proj-inner" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:30 }}>
              <div>
                <p style={{ fontSize:13,lineHeight:1.9,marginBottom:18 }}>
                  An end-to-end serverless data + AI pipeline on AWS: an S3 medallion lake (Bronze/Silver/Gold) cataloged by Glue and queried with Athena (SQL plus a CTAS ETL to partitioned Parquet), all provisioned by one CloudFormation template. Two ML models on synthetic hospital data predict 30-day readmission and flag abnormal IoT vital signs.
                </p>
                <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:20 }}>
                  {["AWS","S3 Data Lake","Glue","Athena","CloudFormation","Parquet","scikit-learn","Python"].map(t=>(
                    <span key={t} className="chip" style={{ border:`1px solid ${border}`,padding:"3px 8px",fontSize:8,letterSpacing:1.5,textTransform:"uppercase",color:muted }}>{t}</span>
                  ))}
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  <a href="https://github.com/21zaimotman-tech/smart-hospital-pipeline" target="_blank" rel="noopener noreferrer" className="hi"
                    style={{ background:fg,color:bg,border:"none",padding:"10px 16px",fontSize:8,letterSpacing:2.5,display:"inline-block",fontWeight:700 }}>GITHUB ↗</a>
                </div>
                <div style={{ marginTop:12,fontSize:8,color:muted,letterSpacing:1 }}>Deployed & demonstrated on AWS, now decommissioned to avoid cost.</div>
              </div>
              <div className="lift" style={{ border:`1.5px solid ${border}`,padding:14,background:mid }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                  <span style={{ fontSize:7,letterSpacing:3,color:muted,textTransform:"uppercase" }}>Architecture</span>
                  <span style={{ fontSize:7,letterSpacing:2,color:muted,textTransform:"uppercase" }}>Click to expand ⤢</span>
                </div>
                <button onClick={()=>setLightbox({ src:archImg, caption:"Smart-Hospital architecture · solid arrows: the live serverless data flow · dashed: parallel production paths (streaming, monitoring, orchestration) designed, not deployed" })} aria-label="Expand architecture diagram"
                  style={{ display:"block",width:"100%",padding:0,border:`1px solid ${border}`,background:"#fff",cursor:"zoom-in" }}>
                  <img src={archImg} alt="Smart-Hospital serverless AWS architecture" style={{ width:"100%",display:"block" }} />
                </button>
                <div style={{ marginTop:10,fontSize:7,color:muted,letterSpacing:0.5,lineHeight:1.7 }}>
                  Solid: live serverless data flow. Dashed: parallel production paths (streaming ingest, monitoring, orchestration) designed, not deployed.
                </div>
                <div style={{ display:"flex",gap:16,marginTop:12,paddingTop:12,borderTop:`1px solid ${inv?"#333":"#d0cbc0"}` }}>
                  {[["0.62","ROC-AUC"],["0.75","ANOMALY F1"],["27K","RECORDS"]].map(([n,l])=>(
                    <div key={l}>
                      <div style={{ fontSize:22,fontWeight:900,letterSpacing:"-1px" }}>{n}</div>
                      <div style={{ fontSize:6,color:muted,letterSpacing:2,marginTop:2,textTransform:"uppercase" }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ---- 04 VQA ---- */}
          <div className="reveal-hidden" style={{ marginTop:72 }}>
            <div style={{ display:"flex",alignItems:"baseline",gap:14,marginBottom:22 }}>
              <span style={{ fontSize:64,fontWeight:900,color:ghost,lineHeight:1,letterSpacing:"-2px",userSelect:"none" }}>04</span>
              <div>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontSize:27,fontWeight:900,letterSpacing:"-0.5px",textTransform:"uppercase" }}>VQA SYSTEM</span>
                  <span style={{ fontSize:7,letterSpacing:2,border:`1px solid ${muted}`,color:muted,padding:"2px 6px",textTransform:"uppercase" }}>◍ In Progress</span>
                </div>
                <div style={{ fontSize:10,color:muted,letterSpacing:2,marginTop:3 }}>Vision-Language Model from Scratch · 2026</div>
              </div>
            </div>
            <div className="proj-inner" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:30 }}>
              <div>
                <p style={{ fontSize:13,lineHeight:1.9,marginBottom:18 }}>
                  A Multimodal Visual Question Answering model built end-to-end in PyTorch: a Vision Transformer (ViT) image encoder fused with a GPT-style autoregressive text decoder via cross-modal attention, trained on VQAv2.
                </p>
                <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:20 }}>
                  {["PyTorch","Vision Transformer","GPT-style Decoder","Cross-Modal Attention","VQAv2"].map(t=>(
                    <span key={t} className="chip" style={{ border:`1px solid ${border}`,padding:"3px 8px",fontSize:8,letterSpacing:1.5,textTransform:"uppercase",color:muted }}>{t}</span>
                  ))}
                </div>
                <div style={{ border:`1.5px dashed ${border}`,padding:"10px 14px",fontSize:8,letterSpacing:2,color:muted,textTransform:"uppercase",display:"inline-block" }}>
                  ⚙ In active development · results coming soon
                </div>
              </div>
              <div className="lift" style={{ border:`1.5px solid ${border}`,padding:18,background:mid,display:"flex",flexDirection:"column" }}>
                <div style={{ fontSize:7,letterSpacing:3,color:muted,marginBottom:14,textTransform:"uppercase" }}>Architecture</div>
                <div style={{ flex:1,display:"flex",alignItems:"center" }}>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr auto 1fr auto 1fr",gap:4,alignItems:"center",width:"100%" }}>
                    {vqaNodes.map((n,i) => n.sym ? (
                      <div key={i} style={{ textAlign:"center",color:muted,fontSize:14,fontWeight:700 }}>{n.sym}</div>
                    ) : (
                      <div key={i} style={{ border:`1.5px solid ${fg}`,padding:"12px 8px",textAlign:"center",background:bg }}>
                        <div style={{ fontSize:6,color:muted }}>{n.label}</div>
                        <div style={{ fontWeight:700,fontSize:7,marginTop:2,lineHeight:1.4,whiteSpace:"pre-line" }}>{n.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop:12,fontSize:7,color:muted,textAlign:"center",letterSpacing:1 }}>VQAv2 · 265K images · 4.4M QA pairs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="skills" style={{ padding:"68px 0",borderTop:`1.5px solid ${border}`,background:mid }}>
        <div style={{ maxWidth:1100,margin:"0 auto",padding:"0 32px" }}>
          <SectionHead idx="02" title="Technical Skills" note="Toolbox" border={border} muted={muted} />
          <div className="skills-grid reveal-hidden" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0 }}>
            {Object.entries(SKILLS).map(([cat,items],ci)=>(
              <div key={cat} style={{ borderRight:ci<3?`1px solid ${border}`:"none",paddingRight:ci<3?20:0,paddingLeft:ci>0?20:0 }}>
                <div style={{ fontSize:7,letterSpacing:3,color:muted,textTransform:"uppercase",marginBottom:12,paddingBottom:8,borderBottom:`1px solid ${border}` }}>{cat}</div>
                {items.map(sk=>(
                  <div key={sk} className="hi" style={{ fontSize:11,padding:"4px 6px",letterSpacing:0.5 }}>{sk}</div>
                ))}
              </div>
            ))}
          </div>
          <div className="reveal-hidden" style={{ marginTop:32,paddingTop:18,borderTop:`1px solid ${border}` }}>
            <div style={{ fontSize:7,letterSpacing:3,color:muted,marginBottom:10,textTransform:"uppercase" }}>Languages</div>
            {[["French","Fluent"],["English","Fluent"],["Arabic","Native"],["Spanish","Intermediate"]].map(([l,p])=>(
              <span key={l} className="chip" style={{ display:"inline-block",border:`1px solid ${border}`,padding:"4px 10px",fontSize:9,marginRight:6,marginBottom:6,letterSpacing:1 }}>{l} · {p}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="experience" style={{ padding:"68px 0",borderTop:`1.5px solid ${border}` }}>
        <div style={{ maxWidth:1100,margin:"0 auto",padding:"0 32px" }}>
          <SectionHead idx="03" title="Experience & Education" note="Background" border={border} muted={muted} />
          <div className="exp-grid reveal-hidden" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0 }}>
            <div style={{ borderRight:`1px solid ${border}`,paddingRight:28 }}>
              <div style={{ fontSize:7,letterSpacing:3,color:muted,marginBottom:10,textTransform:"uppercase" }}>Experience</div>
              <div style={{ fontWeight:700,fontSize:14,marginBottom:4 }}>Software Engineering Intern</div>
              <div style={{ fontSize:11,color:muted,marginBottom:14 }}>KeshWeb, Morocco · Jun-Sep 2024</div>
              <p style={{ fontSize:12,lineHeight:1.75 }}>Automated audit platform (PHP Laravel + MySQL) replacing manual workflows for a ~35-40% efficiency gain. RESTful API connecting dual frontends.</p>
              <div style={{ marginTop:10,fontSize:8,color:muted,letterSpacing:1 }}>PHP Laravel · MySQL · REST</div>
            </div>
            <div style={{ borderRight:`1px solid ${border}`,padding:"0 28px" }}>
              <div style={{ fontSize:7,letterSpacing:3,color:muted,marginBottom:10,textTransform:"uppercase" }}>Master's</div>
              <div style={{ fontWeight:700,fontSize:14,marginBottom:4 }}>MSc AI Systems</div>
              <div style={{ fontSize:11,color:muted,marginBottom:14 }}>EPITA Paris · 2025-Present</div>
              <p style={{ fontSize:12,lineHeight:1.75 }}>ML, Deep Learning, NLP, Computer Vision, Distributed Systems.</p>
            </div>
            <div style={{ paddingLeft:28 }}>
              <div style={{ fontSize:7,letterSpacing:3,color:muted,marginBottom:10,textTransform:"uppercase" }}>Bachelor's</div>
              <div style={{ fontWeight:700,fontSize:14,marginBottom:4 }}>BSc Computer Science</div>
              <div style={{ fontSize:11,color:muted,marginBottom:12 }}>Al Akhawayn University · 2020-2024</div>
              <p style={{ fontSize:12,lineHeight:1.75,marginBottom:12 }}>Minor in Business Administration.</p>
              <div style={{ borderTop:`1px dashed ${border}`,paddingTop:12 }}>
                <div style={{ fontWeight:700,fontSize:12,marginBottom:4 }}>Exchange Semester</div>
                <div style={{ fontSize:11,color:muted }}>VŠB Technical University of Ostrava, Czech Republic · Spring 2024</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" style={{ padding:"80px 0",borderTop:`1.5px solid ${border}`,background:mid,position:"relative",...gridBg }}>
        <div style={{ maxWidth:1100,margin:"0 auto",padding:"0 32px" }}>
          <div className="reveal-hidden">
            <div style={{ fontSize:9,letterSpacing:5,color:muted,marginBottom:16,textTransform:"uppercase" }}>04 · Get in Touch</div>
            <div style={{ fontSize:"clamp(32px,5.5vw,66px)",fontWeight:900,letterSpacing:"-1.5px",textTransform:"uppercase",marginBottom:38,lineHeight:0.95 }}>
              LET'S BUILD<br/>SOMETHING<span style={{ color:fg }}>.</span>
            </div>
            <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
              <button onClick={copy} className="hi"
                style={{ border:`1.5px solid ${border}`,padding:"13px 22px",fontSize:10,letterSpacing:2,color:fg,cursor:"pointer",fontFamily:"inherit",background:"transparent",textAlign:"left" }}>
                <span style={{ fontSize:7,color:muted,letterSpacing:3,display:"block",marginBottom:4 }}>EMAIL</span>
                {copied ? "COPIED ✓" : "21zaimotman@gmail.com"}
              </button>
              {[
                ["LINKEDIN","https://linkedin.com/in/otmane-zaim-048b3a2b0"],
                ["GITHUB","https://github.com/21zaimotman-tech"],
              ].map(([l,href])=>(
                <a key={l} href={href} target="_blank" rel="noopener noreferrer" className="hi"
                  style={{ border:`1.5px solid ${border}`,padding:"13px 22px",fontSize:10,letterSpacing:2,color:fg,display:"inline-block" }}>
                  <span style={{ fontSize:7,color:muted,letterSpacing:3,display:"block",marginBottom:4 }}>{l}</span>↗
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer style={{ borderTop:`1.5px solid ${border}`,padding:"18px 32px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8 }}>
        <span style={{ fontSize:8,color:muted,letterSpacing:2 }}>ZAIM OTMANE · {new Date().getFullYear()}</span>
        <span style={{ fontSize:8,color:muted,letterSpacing:1 }}>Built with React + Vite · Set in Courier · Paris, France</span>
        <span style={{ fontSize:8,color:muted,letterSpacing:2 }}>AI/ML ENGINEER</span>
      </footer>

      {demo && <DemoModal onClose={()=>setDemo(false)} fg={fg} bg={bg} border={border} muted={muted} />}
      {lightbox && <ImageModal src={lightbox.src} caption={lightbox.caption} onClose={()=>setLightbox(null)} />}
    </div>
  )
}

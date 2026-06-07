'use client'
import { useState, useEffect, useRef, useCallback } from "react";

const FREE_LIMIT = 3;
const KIWIFY_MONTHLY = "https://pay.kiwify.com.br/IGdJV4B";
const KIWIFY_LIFETIME = "https://pay.kiwify.com.br/TKa1kIO";
const MODEL = "claude-sonnet-4-20250514";

const SYSTEM = `Você é Neura, tutora de IA do NeuroFocus — especialista em aprendizagem acelerada para estudantes brasileiros.

Personalidade e tom:
- Fale como uma professora particular experiente e empática — nunca como um robô
- Use linguagem direta, clara e elegante
- Demonstre que leu e analisou o que o aluno disse antes de responder
- Faça uma pergunta de cada vez, de forma natural e contextual
- Sem asteriscos, sem numeração de perguntas, sem linguagem de formulário
- Emojis apenas quando genuinamente útil — com moderação
- Termine com uma direção natural quando fizer sentido

Suas especialidades: ENEM, vestibular, concursos públicos, faculdade, ensino médio, revisão espaçada, active recall, planos de estudo personalizados.

Quando receber PDF ou imagem: analise completamente e explique como uma professora faria.

Regra absoluta: cada resposta deve ter valor real. Nunca seja genérica.`;

async function callClaude(messages: {role: string, content: any}[], maxTokens = 1000) {
  const res = await fetch("/api/claude", { method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system: SYSTEM, messages }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "Algo deu errado. Tente novamente.";
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res((r.result as string).split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function useVoice(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [supported] = useState(() => typeof window !== 'undefined' && !!(('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window)));
  const recRef = useRef<any>(null);

  useEffect(() => {
    if (!supported || typeof window === 'undefined') return;
    const SR = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    recRef.current = new SR();
    recRef.current.lang = "pt-BR";
    recRef.current.continuous = false;
    recRef.current.interimResults = false;
    recRef.current.onresult = (e: any) => { onResult(e.results[0][0].transcript); setListening(false); };
    recRef.current.onerror = () => setListening(false);
    recRef.current.onend = () => setListening(false);
  }, [supported, onResult]);

  const toggleListen = () => {
    if (!supported) return;
    if (listening) { recRef.current?.stop(); setListening(false); }
    else { recRef.current?.start(); setListening(true); }
  };

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.slice(0, 500));
    u.lang = "pt-BR"; u.rate = 0.95; u.pitch = 1.05;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);

  const stopSpeaking = () => { window.speechSynthesis?.cancel(); setSpeaking(false); };
  return { listening, speaking, supported, toggleListen, speak, stopSpeaking };
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#07070f;--s1:#0d0d1e;--s2:#121228;--s3:#1a1a38;
  --red:#e8294a;--orange:#f05a2a;--gold:#d4a017;--green:#00c87a;--blue:#00b4ff;
  --white:#ede9e4;--dim:#7070a0;--border:rgba(255,255,255,0.07);--glow:rgba(232,41,74,0.09);
}
html,body{height:100%;overflow:hidden;background:#07070f;}
.app{font-family:'DM Sans',sans-serif;background:var(--bg);height:100vh;color:var(--white);display:flex;flex-direction:column;overflow:hidden;}
.pw-wrap{position:fixed;inset:0;background:rgba(7,7,15,0.97);backdrop-filter:blur(28px);z-index:999;display:flex;align-items:center;justify-content:center;padding:1.5rem;overflow-y:auto;}
.pw-box{background:var(--s1);border:1px solid rgba(232,41,74,0.2);border-radius:24px;padding:2.25rem 2rem;max-width:440px;width:100%;position:relative;}
.pw-tag{font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:.15em;text-transform:uppercase;color:var(--red);margin-bottom:.75rem;}
.pw-title{font-family:'Instrument Serif',serif;font-size:1.85rem;line-height:1.2;margin-bottom:.5rem;}
.pw-sub{font-size:13px;color:var(--dim);line-height:1.6;margin-bottom:1.5rem;}
.pw-list{display:flex;flex-direction:column;gap:8px;margin-bottom:1.5rem;}
.pw-item{display:flex;align-items:center;gap:10px;font-size:13px;}
.pw-dot{width:16px;height:16px;border-radius:4px;background:rgba(0,200,122,0.12);display:flex;align-items:center;justify-content:center;font-size:9px;color:var(--green);flex-shrink:0;}
.pw-reviews{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:1.5rem;}
.pw-rv{background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:12px;padding:.75rem;font-size:12px;color:var(--dim);line-height:1.5;}
.pw-stars{color:var(--gold);font-size:10px;margin-bottom:4px;}
.pw-plans{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:1.25rem;}
.pw-plan{border:1.5px solid var(--border);border-radius:16px;padding:1.125rem 1rem;cursor:pointer;transition:.2s;text-align:left;}
.pw-plan:hover{border-color:rgba(232,41,74,0.4);background:var(--glow);}
.pw-plan.vip{border-color:rgba(212,160,23,0.35);background:rgba(212,160,23,0.03);}
.pw-plan.vip:hover{border-color:var(--gold);}
.pw-plabel{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:5px;}
.pw-plan.vip .pw-plabel{color:var(--gold);}
.pw-pprice{font-family:'Instrument Serif',serif;font-size:1.85rem;}
.pw-pper{font-size:11px;color:var(--dim);margin-top:1px;}
.pw-pnote{font-size:11px;color:var(--green);margin-top:7px;font-weight:500;}
.pw-cta{background:linear-gradient(135deg,var(--red),var(--orange));color:#fff;border:none;border-radius:13px;padding:15px;width:100%;font-family:'DM Sans',sans-serif;font-size:14.5px;font-weight:600;cursor:pointer;transition:.2s;margin-bottom:6px;}
.pw-cta:hover{opacity:.9;transform:translateY(-1px);box-shadow:0 8px 28px rgba(232,41,74,0.25);}
.pw-skip{background:none;border:none;width:100%;color:var(--dim);font-size:12px;cursor:pointer;padding:8px;font-family:'DM Sans',sans-serif;transition:.2s;}
.pw-skip:hover{color:var(--white);}
.pw-guarantee{text-align:center;font-size:11px;color:var(--dim);margin-top:8px;}
.hdr{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1.5rem;border-bottom:1px solid var(--border);background:rgba(7,7,15,0.95);backdrop-filter:blur(20px);position:sticky;top:0;z-index:100;flex-shrink:0;}
.logo{font-family:'Instrument Serif',serif;font-size:1.3rem;letter-spacing:-.01em;}
.logo-hi{background:linear-gradient(135deg,var(--red),var(--orange));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.badge{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.1em;padding:4px 10px;border-radius:100px;border:1px solid var(--red);color:var(--red);}
.badge.pro{border-color:var(--gold);color:var(--gold);}
.hdr-right{display:flex;gap:7px;align-items:center;}
.up-btn{background:linear-gradient(135deg,var(--red),var(--orange));color:#fff;border:none;border-radius:9px;padding:7px 13px;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:.2s;}
.up-btn:hover{opacity:.88;transform:translateY(-1px);}
.ghost{background:rgba(255,255,255,0.04);border:1px solid var(--border);color:var(--dim);border-radius:9px;padding:7px 11px;font-size:11px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:.2s;}
.ghost:hover{color:var(--white);}
.nav{display:flex;gap:2px;padding:.5rem 1.25rem;border-bottom:1px solid var(--border);overflow-x:auto;scrollbar-width:none;flex-shrink:0;}
.nav::-webkit-scrollbar{display:none;}
.nb{background:none;border:none;padding:7px 13px;border-radius:8px;font-size:12.5px;font-weight:500;color:var(--dim);cursor:pointer;transition:.2s;white-space:nowrap;font-family:'DM Sans',sans-serif;}
.nb:hover{color:var(--white);background:var(--s2);}
.nb.on{color:var(--white);background:var(--s2);border:1px solid var(--border);}
.main{flex:1;overflow:hidden;display:flex;flex-direction:column;}
.tab{flex:1;overflow:hidden;display:flex;flex-direction:column;padding:1.25rem 1.5rem;}
.uses-bar{display:flex;align-items:center;gap:8px;padding:7px 12px;margin-bottom:.75rem;background:rgba(232,41,74,0.05);border:1px solid rgba(232,41,74,0.12);border-radius:10px;font-size:12px;color:var(--dim);flex-shrink:0;}
.pips{display:flex;gap:4px;}
.pip{width:8px;height:8px;border-radius:50%;background:var(--s3);border:1px solid var(--border);transition:.3s;}
.pip.used{background:var(--red);border-color:var(--red);box-shadow:0 0 5px rgba(232,41,74,0.4);}
.uses-link{margin-left:auto;background:none;border:none;color:var(--red);font-size:11px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;}
.chat-wrap{display:flex;flex-direction:column;flex:1;overflow:hidden;gap:.75rem;}
.chat-log{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding-right:4px;}
.chat-log::-webkit-scrollbar{width:3px;}
.chat-log::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}
.msg{display:flex;gap:9px;align-items:flex-end;}
.msg.user{flex-direction:row-reverse;}
.av{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;background:linear-gradient(135deg,var(--red),var(--orange));}
.msg.user .av{background:var(--s3);font-size:11px;}
.bbl{background:var(--s1);border:1px solid var(--border);border-radius:18px 18px 18px 4px;padding:12px 16px;font-size:13.5px;line-height:1.7;max-width:78%;white-space:pre-wrap;}
.msg.user .bbl{background:var(--s2);border-color:rgba(232,41,74,0.12);border-radius:18px 18px 4px 18px;}
.voice-bar{display:flex;align-items:center;gap:8px;padding:8px 14px;background:rgba(0,180,255,0.06);border:1px solid rgba(0,180,255,0.15);border-radius:10px;font-size:12px;color:var(--blue);flex-shrink:0;}
.vdot{width:7px;height:7px;border-radius:50%;background:var(--blue);animation:vblink 1s infinite;}
@keyframes vblink{0%,100%{opacity:1;}50%{opacity:.15;}}
.speak-bar{background:rgba(0,200,122,0.06);border-color:rgba(0,200,122,0.15);color:var(--green);}
.speak-bar .vdot{background:var(--green);}
.sugs{display:flex;flex-wrap:wrap;gap:6px;flex-shrink:0;}
.sug{background:var(--s2);border:1px solid var(--border);border-radius:100px;padding:6px 14px;font-size:12px;color:var(--dim);cursor:pointer;transition:.2s;font-family:'DM Sans',sans-serif;}
.sug:hover{color:var(--white);border-color:rgba(232,41,74,0.3);}
.inp-row{display:flex;gap:7px;align-items:flex-end;flex-shrink:0;}
.chat-field{flex:1;background:var(--s1);border:1.5px solid var(--border);border-radius:14px;padding:11px 14px;font-size:13.5px;color:var(--white);font-family:'DM Sans',sans-serif;outline:none;resize:none;min-height:46px;max-height:110px;line-height:1.5;transition:.2s;}
.chat-field:focus{border-color:rgba(232,41,74,0.35);}
.chat-field::placeholder{color:var(--dim);}
.ico-btn{width:46px;height:46px;border-radius:12px;border:1px solid var(--border);background:var(--s2);color:var(--dim);font-size:17px;cursor:pointer;transition:.2s;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ico-btn:hover{color:var(--white);}
.ico-btn.rec{background:rgba(232,41,74,0.12);border-color:var(--red);color:var(--red);animation:rpulse 1.2s infinite;}
@keyframes rpulse{0%,100%{box-shadow:0 0 0 0 rgba(232,41,74,.3);}50%{box-shadow:0 0 0 5px rgba(232,41,74,0);}}
.ico-btn.vo{background:rgba(0,180,255,0.1);border-color:rgba(0,180,255,0.3);color:var(--blue);}
.send-btn{width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,var(--red),var(--orange));border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;transition:.2s;}
.send-btn:hover{transform:scale(1.05);}
.send-btn:disabled{opacity:.25;cursor:not-allowed;transform:none;}
.typing-b{display:flex;gap:4px;align-items:center;padding:2px 4px;}
.dot{width:5px;height:5px;border-radius:50%;background:var(--dim);animation:bop 1.3s infinite;}
.dot:nth-child(2){animation-delay:.2s;}.dot:nth-child(3){animation-delay:.4s;}
@keyframes bop{0%,60%,100%{transform:translateY(0);opacity:.3;}30%{transform:translateY(-5px);opacity:1;}}
.scr{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:.875rem;}
.scr::-webkit-scrollbar{width:3px;}
.scr::-webkit-scrollbar-thumb{background:var(--border);}
.s-title{font-family:'Instrument Serif',serif;font-size:1.35rem;margin-bottom:2px;}
.s-sub{font-size:12.5px;color:var(--dim);margin-bottom:1rem;}
.pills{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:.75rem;}
.pill{background:var(--s2);border:1px solid var(--border);border-radius:100px;padding:6px 14px;font-size:12px;color:var(--dim);cursor:pointer;transition:.2s;font-family:'DM Sans',sans-serif;}
.pill:hover,.pill.on{color:var(--white);border-color:rgba(232,41,74,0.4);background:var(--glow);}
.drop-z{border:1.5px dashed var(--border);border-radius:18px;padding:2.25rem 1.5rem;text-align:center;cursor:pointer;transition:.3s;}
.drop-z:hover,.drop-z.ov{border-color:var(--red);background:var(--glow);}
.drop-ico{font-size:2.25rem;margin-bottom:.5rem;}
.drop-t{font-family:'Instrument Serif',serif;font-size:1rem;margin-bottom:3px;}
.drop-s{font-size:12px;color:var(--dim);}
.file-info{background:var(--s1);border:1px solid var(--border);border-radius:14px;padding:1rem 1.25rem;display:flex;align-items:center;gap:12px;}
.file-ico{font-size:1.75rem;flex-shrink:0;}
.file-name{font-size:13.5px;font-weight:500;margin-bottom:2px;}
.file-meta{font-size:11px;color:var(--dim);}
.pdf-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.pdf-action-btn{background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:.875rem;font-size:13px;color:var(--white);cursor:pointer;transition:.2s;font-family:'DM Sans',sans-serif;text-align:left;display:flex;align-items:center;gap:8px;}
.pdf-action-btn:hover{border-color:rgba(232,41,74,0.35);background:var(--glow);}
.res-box{background:var(--s1);border:1px solid var(--border);border-radius:16px;padding:1.5rem;white-space:pre-wrap;font-size:13.5px;line-height:1.75;}
.res-tag{font-family:'DM Mono',monospace;font-size:9.5px;color:var(--red);text-transform:uppercase;letter-spacing:.12em;margin-bottom:12px;}
.lv-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:.875rem;}
.lv-btn{background:var(--s2);border:1px solid var(--border);border-radius:8px;padding:6px 12px;font-size:12px;color:var(--dim);cursor:pointer;transition:.2s;font-family:'DM Sans',sans-serif;}
.lv-btn:hover,.lv-btn.on{color:var(--white);border-color:rgba(0,180,255,0.4);background:rgba(0,180,255,0.06);}
.topic-row{display:flex;gap:7px;}
.topic-inp{flex:1;background:var(--s1);border:1.5px solid var(--border);border-radius:12px;padding:11px 14px;font-size:13.5px;color:var(--white);font-family:'DM Sans',sans-serif;outline:none;transition:.2s;}
.topic-inp:focus{border-color:rgba(232,41,74,0.35);}
.topic-inp::placeholder{color:var(--dim);}
.score-box{background:rgba(0,200,122,0.06);border:1px solid rgba(0,200,122,0.2);border-radius:14px;padding:1.25rem;text-align:center;}
.score-n{font-family:'Instrument Serif',serif;font-size:2.75rem;color:var(--green);}
.score-m{font-size:13px;color:var(--dim);margin-top:4px;}
.score-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px;}
.ss{background:var(--s2);border:1px solid var(--border);border-radius:10px;padding:.625rem;text-align:center;}
.ss-v{font-family:'DM Mono',monospace;font-size:1rem;color:var(--white);}
.ss-l{font-size:10px;color:var(--dim);margin-top:2px;}
.q-card{background:var(--s1);border:1px solid var(--border);border-radius:16px;padding:1.25rem;}
.q-num{font-family:'DM Mono',monospace;font-size:9.5px;color:var(--dim);text-transform:uppercase;letter-spacing:.1em;margin-bottom:7px;}
.q-txt{font-size:14px;font-weight:500;line-height:1.55;margin-bottom:.875rem;}
.opts{display:flex;flex-direction:column;gap:7px;}
.opt{background:var(--s2);border:1.5px solid var(--border);border-radius:10px;padding:10px 14px;font-size:13px;cursor:pointer;transition:.2s;text-align:left;color:var(--white);font-family:'DM Sans',sans-serif;}
.opt:hover{border-color:rgba(0,180,255,0.3);background:rgba(0,180,255,0.05);}
.opt.ok{border-color:var(--green);background:rgba(0,200,122,0.08);color:var(--green);}
.opt.no{border-color:var(--red);background:rgba(232,41,74,0.08);color:var(--red);}
.pomo{flex:1;overflow-y:auto;display:flex;flex-direction:column;align-items:center;gap:1.5rem;padding:.5rem 0;}
.pm-modes{display:flex;gap:7px;flex-wrap:wrap;justify-content:center;}
.pm-mode{background:var(--s2);border:1px solid var(--border);border-radius:8px;padding:6px 14px;font-size:12px;color:var(--dim);cursor:pointer;transition:.2s;font-family:'DM Sans',sans-serif;}
.pm-mode:hover,.pm-mode.on{color:var(--white);border-color:rgba(232,41,74,0.4);background:var(--glow);}
.ring-w{position:relative;width:200px;height:200px;}
.ring-svg{transform:rotate(-90deg);}
.r-bg{fill:none;stroke:var(--s3);stroke-width:8;}
.r-fg{fill:none;stroke:url(#rg);stroke-width:8;stroke-linecap:round;transition:stroke-dashoffset 1s linear;}
.ring-lbl{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.ring-time{font-family:'DM Mono',monospace;font-size:2.5rem;font-weight:500;}
.ring-phase{font-size:10px;color:var(--dim);text-transform:uppercase;letter-spacing:.14em;margin-top:4px;}
.ring-sess{font-size:11px;color:var(--dim);margin-top:3px;}
.pm-btns{display:flex;gap:10px;align-items:center;}
.pm-btn{width:48px;height:48px;border-radius:50%;border:1px solid var(--border);background:var(--s2);color:var(--white);font-size:17px;cursor:pointer;transition:.2s;display:flex;align-items:center;justify-content:center;}
.pm-btn.main{background:linear-gradient(135deg,var(--red),var(--orange));border:none;width:62px;height:62px;font-size:22px;box-shadow:0 4px 18px rgba(232,41,74,0.28);}
.pm-btn:hover{transform:scale(1.08);}
.snd-section{display:flex;flex-direction:column;align-items:center;gap:8px;width:100%;max-width:320px;}
.snd-label{font-family:'DM Mono',monospace;font-size:10px;color:var(--dim);text-transform:uppercase;letter-spacing:.1em;}
.snd-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;width:100%;}
.snd-btn{background:var(--s2);border:1px solid var(--border);border-radius:10px;padding:8px 5px;font-size:11px;color:var(--dim);cursor:pointer;transition:.2s;font-family:'DM Sans',sans-serif;text-align:center;display:flex;flex-direction:column;align-items:center;gap:3px;}
.snd-btn:hover,.snd-btn.on{color:var(--white);border-color:rgba(0,180,255,0.35);background:rgba(0,180,255,0.06);}
.snd-ico{font-size:16px;}
.vol-row{display:flex;align-items:center;gap:8px;width:100%;}
.vol-lbl{font-size:11px;color:var(--dim);}
.vol-sl{flex:1;-webkit-appearance:none;appearance:none;height:4px;border-radius:2px;background:var(--s3);outline:none;cursor:pointer;}
.vol-sl::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:var(--white);cursor:pointer;}
.pm-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%;max-width:280px;}
.pm-stat{background:var(--s1);border:1px solid var(--border);border-radius:14px;padding:.75rem;text-align:center;}
.pm-v{font-family:'Instrument Serif',serif;font-size:1.5rem;}
.pm-l{font-size:10.5px;color:var(--dim);margin-top:2px;}
.custom-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;}
.custom-inp{background:var(--s1);border:1px solid var(--border);border-radius:10px;padding:8px 12px;font-size:13px;color:var(--white);font-family:'DM Sans',sans-serif;outline:none;width:80px;text-align:center;}
.custom-lbl{font-size:12px;color:var(--dim);}
@media(max-width:600px){.tab{padding:1rem;}.hdr{padding:.75rem 1rem;}.pw-plans{grid-template-columns:1fr;}.pw-reviews{grid-template-columns:1fr;}.score-stats{grid-template-columns:repeat(2,1fr);}.pdf-actions{grid-template-columns:1fr;}}
`;

function Paywall({ onClose }: { onClose: () => void }) {
  return (
    <div className="pw-wrap">
      <div className="pw-box">
        <div className="pw-tag">NeuroFocus Premium</div>
        <div className="pw-title">Você atingiu o limite gratuito.</div>
        <div className="pw-sub">Continue estudando com recursos premium. Sem limites, sem interrupções.</div>
        <div className="pw-list">
          {["Conversas ilimitadas com a Neura","PDFs e imagens ilimitados","Quiz ilimitado com relatório","Focus Mode Premium com sons","Planos de estudo inteligentes"].map(f => (
            <div key={f} className="pw-item"><div className="pw-dot">✓</div><span>{f}</span></div>
          ))}
        </div>
        <div className="pw-reviews">
          {["Consigo resumir matérias em minutos.","Minhas notas melhoraram muito.","Estudo com muito mais foco agora.","Economizo horas por semana."].map((t, i) => (
            <div key={i} className="pw-rv"><div className="pw-stars">★★★★★</div>"{t}"</div>
          ))}
        </div>
        <div className="pw-plans">
          <div className="pw-plan" onClick={() => window.open(KIWIFY_MONTHLY, "_blank")}>
            <div className="pw-plabel">Mensal</div>
            <div className="pw-pprice">R$29,90</div>
            <div className="pw-pper">por mês</div>
            <div className="pw-pnote">1º mês por R$19,90</div>
          </div>
          <div className="pw-plan vip" onClick={() => window.open(KIWIFY_LIFETIME, "_blank")}>
            <div className="pw-plabel">Melhor opção</div>
            <div className="pw-pprice">R$197</div>
            <div className="pw-pper">pagamento único</div>
            <div className="pw-pnote">Acesso vitalício</div>
          </div>
        </div>
        <button className="pw-cta" onClick={() => window.open(KIWIFY_LIFETIME, "_blank")}>Quero acesso completo agora</button>
        <div className="pw-guarantee">🔒 Pagamento seguro via Kiwify · Garantia de 7 dias</div>
        <button className="pw-skip" onClick={onClose}>Continuar com o plano gratuito</button>
      </div>
    </div>
  );
}

function ChatTab({ uses, setUses, isPro, setShowPW }: any) {
  const INIT = [{ role: "assistant", content: `Olá, eu sou a Neura.\n\nSua tutora inteligente para aprender mais rápido e estudar com foco.\n\nPosso ajudar você a:\n— Explicar exercícios passo a passo\n— Resumir PDFs e apostilas\n— Criar quizzes personalizados\n— Montar planos de estudo\n— Corrigir dúvidas através de fotos\n— Organizar sua rotina de estudos\n\nO que você deseja fazer hoje?` }];
  const [msgs, setMsgs] = useState(INIT);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);
  const onTranscript = useCallback((text: string) => { setInput(text); }, []);
  const { listening, speaking, supported, toggleListen, speak, stopSpeaking } = useVoice(onTranscript);
  const SUGS = ["Quero criar um plano de estudos","Tenho uma prova em breve","Preciso entender um conteúdo","Quero praticar com questões","Quero resumir um PDF","Quero focar agora"];
  const send = async (text: string, file?: File) => {
    const content = text || input;
    if (!content.trim() && !file) return;
    if (!isPro && uses >= FREE_LIMIT) { setShowPW(true); return; }
    const userMsg = { role: "user", content: content || "Analise este material." };
    setMsgs(prev => [...prev, userMsg]);
    setInput(""); setLoading(true);
    if (!isPro) setUses((u: number) => u + 1);
    try {
      let apiMsgs: any[];
      if (file) {
        const b64 = await fileToBase64(file);
        const isPDF = file.type === "application/pdf";
        apiMsgs = [{ role: "user", content: [isPDF ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } } : { type: "image", source: { type: "base64", media_type: file.type, data: b64 } }, { type: "text", text: content || "Analise este material e me ajude a estudar." }] }];
      } else {
        apiMsgs = [...msgs, userMsg].map(m => ({ role: m.role, content: m.content }));
      }
      const reply = await callClaude(apiMsgs);
      setMsgs(prev => [...prev, { role: "assistant", content: reply }]);
      if (voiceOn) speak(reply);
    } catch { setMsgs(prev => [...prev, { role: "assistant", content: "Algo deu errado. Tente novamente." }]); }
    setLoading(false);
  };
  return (
    <div className="chat-wrap">
      {!isPro && (<div className="uses-bar"><div className="pips">{[...Array(FREE_LIMIT)].map((_, i) => <div key={i} className={`pip ${i < uses ? "used" : ""}`} />)}</div><span>{uses} de {FREE_LIMIT} conversas gratuitas</span><button className="uses-link" onClick={() => setShowPW(true)}>Acesso ilimitado →</button></div>)}
      <div className="chat-log">
        {msgs.map((m: any, i: number) => (<div key={i} className={`msg ${m.role}`}><div className="av">{m.role === "assistant" ? "✦" : "↑"}</div><div className="bbl">{m.content}</div></div>))}
        {loading && <div className="msg"><div className="av">✦</div><div className="bbl"><div className="typing-b"><div className="dot"/><div className="dot"/><div className="dot"/></div></div></div>}
        <div ref={bottomRef} />
      </div>
      {msgs.length === 1 && <div className="sugs">{SUGS.map(s => <button key={s} className="sug" onClick={() => send(s)}>{s}</button>)}</div>}
      {listening && <div className="voice-bar"><div className="vdot"/>Ouvindo... fale sua dúvida</div>}
      {speaking && <div className="voice-bar speak-bar"><div className="vdot"/>Neura está falando — <button style={{background:"none",border:"none",color:"var(--green)",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif"}} onClick={stopSpeaking}>parar</button></div>}
      <div className="inp-row">
        <input type="file" ref={fileRef} style={{display:"none"}} accept="image/*,.pdf" onChange={e => { const f = e.target.files?.[0]; if (f) send("Analise este material.", f); }} />
        <button className="ico-btn" onClick={() => fileRef.current?.click()}>📎</button>
        {supported && (<button className={`ico-btn ${listening ? "rec" : voiceOn ? "vo" : ""}`} onClick={() => { if (listening) { toggleListen(); } else { setVoiceOn((v: boolean) => !v); if (!voiceOn) toggleListen(); } }}>{listening ? "⏹" : "🎙"}</button>)}
        <textarea className="chat-field" placeholder="Escreva sua dúvida..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} rows={1} />
        <button className="send-btn" onClick={() => send(input)} disabled={loading || !input.trim()}>→</button>
      </div>
    </div>
  );
}

function PDFTab({ uses, setUses, isPro, setShowPW }: any) {
  const [result, setResult] = useState(""); const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false); const [fileInfo, setFileInfo] = useState<any>(null);
  const [currentFile, setCurrentFile] = useState<File|null>(null); const fileRef = useRef<HTMLInputElement>(null);
  const ACTIONS = [{ k:"resumo_rapido",l:"Resumo Rápido",ico:"⚡" },{ k:"resumo",l:"Resumo Completo",ico:"📋" },{ k:"questoes",l:"Criar Questões",ico:"❓" },{ k:"quiz",l:"Criar Quiz",ico:"🎯" }];
  const PROMPTS: any = { resumo_rapido:"Faça um resumo rápido e direto dos 5 pontos principais deste conteúdo.", resumo:"Faça um resumo completo, didático e estruturado.", questoes:"Crie 8 questões de múltipla escolha com gabarito comentado.", quiz:"Crie 5 questões objetivas do mais fácil ao mais difícil com gabarito." };
  const process = async (file: File, actionKey: string) => {
    if (!file) return;
    if (!isPro && uses >= FREE_LIMIT) { setShowPW(true); return; }
    setLoading(true); setResult(""); if (!isPro) setUses((u: number) => u + 1);
    try {
      const b64 = await fileToBase64(file); const isPDF = file.type === "application/pdf";
      const content = isPDF ? [{ type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}},{type:"text",text:PROMPTS[actionKey]}] : [{type:"image",source:{type:"base64",media_type:file.type,data:b64}},{type:"text",text:PROMPTS[actionKey]}];
      const res = await callClaude([{ role:"user",content }],1500); setResult(res);
    } catch { setResult("Erro ao processar. Tente novamente."); } setLoading(false);
  };
  const onFile = (file: File) => { setCurrentFile(file); setFileInfo({ name:file.name, size:(file.size/1024).toFixed(0)+" KB", type:file.type }); setResult(""); };
  return (
    <div className="scr">
      <div className="s-title">Analisar material</div>
      <div className="s-sub">Envie PDF ou imagem — a Neura analisa e entrega o que você precisa</div>
      {!fileInfo ? (
        <div className={`drop-z ${drag?"ov":""}`} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)onFile(f);}} onClick={()=>fileRef.current?.click()}>
          <input type="file" ref={fileRef} style={{display:"none"}} accept="image/*,.pdf" onChange={e=>{const f=e.target.files?.[0];if(f)onFile(f);}} />
          <div className="drop-ico">↑</div><div className="drop-t">Solte o arquivo ou clique para selecionar</div><div className="drop-s">PDF ou imagem — JPG, PNG</div>
        </div>
      ) : (
        <>
          <div className="file-info"><div className="file-ico">{fileInfo.type==="application/pdf"?"📄":"🖼️"}</div><div style={{flex:1}}><div className="file-name">{fileInfo.name}</div><div className="file-meta">{fileInfo.size}</div></div><button className="ico-btn" style={{width:32,height:32,fontSize:13,borderRadius:8}} onClick={()=>{setFileInfo(null);setCurrentFile(null);setResult("");}}>✕</button></div>
          <div className="pdf-actions">{ACTIONS.map(a=>(<button key={a.k} className="pdf-action-btn" onClick={()=>currentFile&&process(currentFile,a.k)} disabled={loading}><span>{a.ico}</span><span>{a.l}</span></button>))}</div>
        </>
      )}
      {loading && <div style={{textAlign:"center",padding:"2rem",color:"var(--dim)"}}><div className="typing-b" style={{justifyContent:"center"}}><div className="dot"/><div className="dot"/><div className="dot"/></div><div style={{marginTop:10,fontSize:13}}>Analisando seu material...</div></div>}
      {result && <div className="res-box"><div className="res-tag">Resultado</div>{result}</div>}
    </div>
  );
}

function QuizTab({ uses, setUses, isPro, setShowPW }: any) {
  const [topic, setTopic] = useState(""); const [level, setLevel] = useState("medio");
  const [qs, setQs] = useState<any[]>([]); const [ans, setAns] = useState<any>({});
  const [loading, setLoading] = useState(false); const [score, setScore] = useState<number|null>(null);
  const [startTime, setStartTime] = useState<number|null>(null); const [elapsed, setElapsed] = useState(0);
  const LEVELS = [{k:"facil",l:"Fácil"},{k:"medio",l:"Médio"},{k:"dificil",l:"Difícil"},{k:"enem",l:"ENEM"},{k:"vestibular",l:"Vestibular"},{k:"faculdade",l:"Faculdade"}];
  const generate = async () => {
    if (!topic.trim()) return;
    if (!isPro && uses >= FREE_LIMIT) { setShowPW(true); return; }
    setLoading(true); setQs([]); setAns({}); setScore(null); setElapsed(0); if (!isPro) setUses((u: number) => u + 1);
    try {
      const res = await callClaude([{role:"user",content:`Crie exatamente 5 questões de múltipla escolha de nível ${level} sobre: "${topic}". Retorne APENAS JSON sem texto extra:\n[{"q":"pergunta","options":["A) op1","B) op2","C) op3","D) op4"],"correct":0}]`}]);
      setQs(JSON.parse(res.replace(/\`\`\`json|\`\`\`/g,"").trim())); setStartTime(Date.now());
    } catch { setQs([{q:"Erro ao gerar. Tente um tema diferente.",options:[],correct:0}]); } setLoading(false);
  };
  const answer = (qi: number, oi: number) => {
    if (ans[qi]!==undefined) return;
    const next = {...ans,[qi]:oi}; setAns(next);
    if (Object.keys(next).length===qs.length) { setScore(qs.filter((q,i)=>next[i]===q.correct).length); setElapsed(Math.round((Date.now()-(startTime||0))/1000)); }
  };
  const pct = score!==null?Math.round((score/qs.length)*100):0;
  return (
    <div className="scr">
      <div className="s-title">Quiz por IA</div><div className="s-sub">Escolha o nível e o tema — a Neura cria questões na hora</div>
      <div className="lv-row">{LEVELS.map(l=><button key={l.k} className={`lv-btn ${level===l.k?"on":""}`} onClick={()=>setLevel(l.k)}>{l.l}</button>)}</div>
      <div className="topic-row"><input className="topic-inp" placeholder="Ex: Fotossíntese, Direito Penal, Cálculo..." value={topic} onChange={e=>setTopic(e.target.value)} onKeyDown={e=>e.key==="Enter"&&generate()} /><button className="send-btn" onClick={generate} disabled={loading||!topic.trim()} style={{width:46,height:46}}>{loading?"…":"→"}</button></div>
      {score!==null&&(<div className="score-box"><div className="score-n">{score}/{qs.length}</div><div className="score-m">{score===qs.length?"Perfeito. Você dominou o conteúdo.":score>=3?"Bom resultado. Revise os pontos errados.":"Revise o conteúdo com atenção antes de tentar novamente."}</div><div className="score-stats"><div className="ss"><div className="ss-v">{score}</div><div className="ss-l">Acertos</div></div><div className="ss"><div className="ss-v">{qs.length-score}</div><div className="ss-l">Erros</div></div><div className="ss"><div className="ss-v">{pct}%</div><div className="ss-l">Percentual</div></div><div className="ss"><div className="ss-v">{elapsed}s</div><div className="ss-l">Tempo</div></div></div></div>)}
      {qs.map((q,qi)=>(<div key={qi} className="q-card"><div className="q-num">Questão {qi+1} de {qs.length} · {LEVELS.find(l=>l.k===level)?.l}</div><div className="q-txt">{q.q}</div><div className="opts">{q.options.map((opt: string,oi: number)=><button key={oi} className={["opt",ans[qi]!==undefined?(oi===q.correct?"ok":ans[qi]===oi?"no":""):""].join(" ")} onClick={()=>answer(qi,oi)}>{opt}</button>)}</div></div>))}
    </div>
  );
}

function FocusTab() {
  const MODES = [{k:"pomo",l:"25/5 Pomodoro",w:25,r:5},{k:"deep",l:"50/10 Deep Focus",w:50,r:10},{k:"perf",l:"90/20 Alta Performance",w:90,r:20},{k:"custom",l:"Personalizado",w:0,r:0}];
  const SOUNDS = [{k:"chuva",l:"Chuva",ico:"🌧️",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"},{k:"biblioteca",l:"Biblioteca",ico:"📚",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"},{k:"lofi",l:"Lo-fi",ico:"🎵",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"},{k:"branco",l:"Ruído",ico:"〰️",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"},{k:"floresta",l:"Floresta",ico:"🌲",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"},{k:"mar",l:"Mar",ico:"🌊",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"},{k:"tempestade",l:"Tempestade",ico:"⛈️",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"},{k:"cafe",l:"Café",ico:"☕",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"}];
  const [modeKey,setModeKey]=useState("pomo"); const [cw,setCw]=useState(30); const [cr,setCr]=useState(5);
  const mode = modeKey==="custom"?{w:cw,r:cr}:MODES.find(m=>m.k===modeKey)!;
  const [time,setTime]=useState(mode.w*60); const [running,setRunning]=useState(false);
  const [phase,setPhase]=useState("work"); const [sessions,setSessions]=useState(0);
  const [totalMin,setTotalMin]=useState(0); const [soundKey,setSoundKey]=useState<string|null>(null);
  const [vol,setVol]=useState(0.5); const audioRef=useRef<HTMLAudioElement>(null); const iv=useRef<any>(null);
  const R=84,circ=2*Math.PI*R; const total=phase==="work"?mode.w*60:mode.r*60;
  const offset=circ-(time/Math.max(total,1))*circ; const fmt=(s: number)=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  useEffect(()=>{
    if(running){iv.current=setInterval(()=>{setTime(t=>{if(t<=1){clearInterval(iv.current);setRunning(false);if(phase==="work"){setSessions(s=>s+1);setTotalMin(m=>m+mode.w);setPhase("rest");setTime(mode.r*60);}else{setPhase("work");setTime(mode.w*60);}return 0;}return t-1;});},1000);}
    return()=>clearInterval(iv.current);
  },[running,phase,mode]);
  const changeMode=(k: string)=>{const m=k==="custom"?{w:cw,r:cr}:MODES.find(x=>x.k===k)!;setModeKey(k);setTime(m.w*60);setRunning(false);setPhase("work");clearInterval(iv.current);};
  const toggleSound=(k: string)=>{const s=SOUNDS.find(x=>x.k===k)!;if(soundKey===k){audioRef.current?.pause();setSoundKey(null);return;}setSoundKey(k);if(audioRef.current){audioRef.current.src=s.url;audioRef.current.volume=vol;audioRef.current.play().catch(()=>{});}};
  useEffect(()=>{if(audioRef.current)audioRef.current.volume=vol;},[vol]);
  return (
    <div className="pomo">
      <div style={{textAlign:"center"}}><div className="s-title">Focus Mode</div></div>
      <div className="pm-modes">{MODES.map(m=><button key={m.k} className={`pm-mode ${modeKey===m.k?"on":""}`} onClick={()=>changeMode(m.k)}>{m.l}</button>)}</div>
      {modeKey==="custom"&&(<div className="custom-row"><input className="custom-inp" type="number" min="1" max="120" value={cw} onChange={e=>{setCw(Number(e.target.value));setTime(Number(e.target.value)*60);setPhase("work");}}/><span className="custom-lbl">min foco /</span><input className="custom-inp" type="number" min="1" max="60" value={cr} onChange={e=>setCr(Number(e.target.value))}/><span className="custom-lbl">min pausa</span></div>)}
      <div className="ring-w">
        <svg className="ring-svg" width="210" height="210" viewBox="0 0 210 210"><defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#e8294a"/><stop offset="100%" stopColor="#f05a2a"/></linearGradient></defs><circle className="r-bg" cx="105" cy="105" r={R}/><circle className="r-fg" cx="105" cy="105" r={R} strokeDasharray={circ} strokeDashoffset={offset}/></svg>
        <div className="ring-lbl"><div className="ring-time">{fmt(time)}</div><div className="ring-phase">{phase==="work"?"Foco":"Pausa"}</div><div className="ring-sess">{sessions} sessão{sessions!==1?"ões":""}</div></div>
      </div>
      <div className="pm-btns"><button className="pm-btn" onClick={()=>{setTime(mode.w*60);setRunning(false);setPhase("work");clearInterval(iv.current);}}>↺</button><button className="pm-btn main" onClick={()=>setRunning(r=>!r)}>{running?"⏸":"▶"}</button><button className="pm-btn" onClick={()=>{if(audioRef.current){audioRef.current.paused?audioRef.current.play().catch(()=>{}):audioRef.current.pause();}}}>♪</button></div>
      <div className="snd-section"><div className="snd-label">Sons ambiente</div><div className="snd-grid">{SOUNDS.map(s=>(<button key={s.k} className={`snd-btn ${soundKey===s.k?"on":""}`} onClick={()=>toggleSound(s.k)}><span className="snd-ico">{s.ico}</span><span>{s.l}</span></button>))}</div><div className="vol-row"><span className="vol-lbl">🔈</span><input type="range" className="vol-sl" min="0" max="1" step="0.05" value={vol} onChange={e=>setVol(Number(e.target.value))}/><span className="vol-lbl">🔊</span></div></div>
      <div className="pm-stats"><div className="pm-stat"><div className="pm-v">{sessions}</div><div className="pm-l">Sessões</div></div><div className="pm-stat"><div className="pm-v">{totalMin}m</div><div className="pm-l">Focado</div></div><div className="pm-stat"><div className="pm-v">4</div><div className="pm-l">Meta</div></div></div>
      <audio ref={audioRef} loop />
    </div>
  );
}

export default function NeuroFocus() {
  const [tab,setTab]=useState("chat"); const [uses,setUses]=useState(0);
  const [isPro,setIsPro]=useState(false); const [showPW,setShowPW]=useState(false);
  useEffect(()=>{if(!isPro&&uses>=FREE_LIMIT)setShowPW(true);},[uses,isPro]);
  const TABS=[{k:"chat",l:"Neura IA"},{k:"pdf",l:"PDF & Imagem"},{k:"quiz",l:"Quiz"},{k:"focus",l:"Focus Mode"}];
  const shared={uses,setUses,isPro,setShowPW};
  return (
    <>
      <style>{css}</style>
      <div className="app">
        {showPW&&<Paywall onClose={()=>setShowPW(false)}/>}
        <header className="hdr">
          <div style={{display:"flex",alignItems:"center",gap:10}}><div className="logo">Neuro<span className="logo-hi">Focus</span></div><div className={`badge ${isPro?"pro":""}`}>{isPro?"PRO":"FREE"}</div></div>
          <div className="hdr-right">{!isPro&&<button className="up-btn" onClick={()=>setShowPW(true)}>Upgrade</button>}<button className="ghost" onClick={()=>{setIsPro(p=>!p);setShowPW(false);}}>{isPro?"Sair":"Já tenho Premium"}</button></div>
        </header>
        <nav className="nav">{TABS.map(t=><button key={t.k} className={`nb ${tab===t.k?"on":""}`} onClick={()=>setTab(t.k)}>{t.l}</button>)}</nav>
        <main className="main"><div className="tab">{tab==="chat"&&<ChatTab {...shared}/>}{tab==="pdf"&&<PDFTab {...shared}/>}{tab==="quiz"&&<QuizTab {...shared}/>}{tab==="focus"&&<FocusTab/>}</div></main>
      </div>
    </>
  );
}


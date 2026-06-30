// SANTI & IDIOTI CROSS QUIZ — Artifact interattivo completo
// Tutti i dati sono embeddati. Nessun backend richiesto.

import { useState, useEffect, useRef, useCallback } from "react";

// ─── GAME DATA (griglia 14×13) ──────────────────────────────────────────────
const GAME_DATA = {
  meta: { title: "Santi & Idioti Cross Quiz", gridRows: 14, gridCols: 13 },
  blackCells: [
    [0,11],
    [1,5],[1,13],
    [2,5],[2,8],[2,10],
    [3,2],[3,5],[3,9],
    [4,1],[4,7],[4,11],
    [5,4],[5,8],
    [6,0],[6,7],
    [7,1],[7,4],[7,7],[7,10],
    [8,6],[8,9],[8,12],
    [9,3],[9,5],[9,10],
    [10,5],[10,7],
    [11,4],[11,7],
    [12,1],[12,3],[12,5],
    [13,1],[13,3],[13,9],[13,12]
  ],
  words: [
    // ── ORIZZONTALI ──
    { id:1, number:1, direction:"across", row:0, col:0, length:11, answer:"ORIETTABERTI", clue:"In via dei Ciclamini, al 123, vendevano le bambole vestite come me", hint:false },
    { id:2, number:12, direction:"across", row:1, col:0, length:5, answer:"ROMBO", clue:"Pesce che è anche un parallelogrammo con i lati della stessa lunghezza", hint:true, image:"rombo.jpg" },
    { id:3, number:13, direction:"across", row:1, col:6, length:7, answer:"DELFINO", clue:"Il santo del 24 dicembre... che è anche un mammifero acquatico", hint:true, image:"delfino.jpg" },
    { id:4, number:15, direction:"across", row:2, col:0, length:5, answer:"SAURO", clue:"Pesce, rettile e manto equino", hint:true, image:"sauro.jpg" },
    { id:5, number:16, direction:"across", row:2, col:6, length:3, answer:"ELI", clue:"Sommo sacerdote di Silo, il penultimo dei giudici israeliti, predecessore di Samuele", hint:true, image:"eli.jpg" },
    { id:6, number:17, direction:"across", row:2, col:10, length:2, answer:"NM", clue:"Nome senza pari", hint:false },
    { id:7, number:18, direction:"across", row:3, col:0, length:2, answer:"OR", clue:"Un terzo di orbita", hint:false },
    { id:8, number:19, direction:"across", row:3, col:4, length:4, answer:"ELLG", clue:"Bellagio senza baio", hint:false },
    { id:9, number:20, direction:"across", row:3, col:9, length:3, answer:"ZOO", clue:"Esposizione al pubblico di animali esotici", hint:true, image:"zoo.jpg" },
    { id:10, number:21, direction:"across", row:4, col:2, length:5, answer:"CLARA", clue:"Compagna di avventure della piccola Heidi", hint:true, image:"clara.jpg" },
    { id:11, number:22, direction:"across", row:4, col:8, length:2, answer:"IN", clue:"Preposizione che vale «dentro»", hint:false },
    { id:12, number:23, direction:"across", row:4, col:12, length:2, answer:"CB", clue:"Campobasso sulle auto", hint:false },
    { id:13, number:24, direction:"across", row:5, col:0, length:4, answer:"ALEF", clue:"Prima lettera dell'alfabeto... ebraico", hint:true, image:"alef.jpg" },
    { id:14, number:26, direction:"across", row:5, col:5, length:4, answer:"PINO", clue:"Conifera che può essere mugo, marittimo, silvestre...", hint:true, image:"pino.jpg" },
    { id:15, number:28, direction:"across", row:5, col:10, length:3, answer:"REO", clue:"Colpevole di un reato", hint:false },
    { id:16, number:29, direction:"across", row:6, col:1, length:7, answer:"FLORIDO", clue:"Prospero, fiorente, vigoroso", hint:false },
    { id:17, number:31, direction:"across", row:6, col:8, length:4, answer:"BONN", clue:"Città tedesca sul Reno, natali di Beethoven", hint:true, image:"bonn.jpg" },
    { id:18, number:33, direction:"across", row:7, col:2, length:3, answer:"ECE", clue:"Disfece... alla fine", hint:false },
    { id:19, number:34, direction:"across", row:7, col:5, length:5, answer:"RENZO", clue:"Nome di un protagonista manzoniano", hint:true, image:"renzo.jpg" },
    { id:20, number:35, direction:"across", row:8, col:0, length:6, answer:"INSITE", clue:"Poste dentro, intimamente congiunte, radicate profondamente", hint:false },
    { id:21, number:37, direction:"across", row:8, col:7, length:3, answer:"BIA", clue:"La maghetta protagonista di un anime di Makiko Narita", hint:true, image:"bia.jpg" },
    { id:22, number:38, direction:"across", row:9, col:0, length:3, answer:"BOT", clue:"Buoni Ordinari del Tesoro", hint:false },
    { id:23, number:40, direction:"across", row:9, col:6, length:3, answer:"ATP", clue:"Adenosina trifosfato", hint:true, image:"atp.jpg" },
    { id:24, number:43, direction:"across", row:10, col:0, length:7, answer:"INISTER", clue:"Ministero senza capo né coda", hint:false },
    { id:25, number:46, direction:"across", row:10, col:8, length:5, answer:"TRONI", clue:"Sedie di regnanti", hint:false },
    { id:26, number:48, direction:"across", row:11, col:0, length:8, answer:"ANNUARIO", clue:"Pubblicazione o diario che raccoglie gli eventi di un intero anno", hint:false },
    { id:27, number:50, direction:"across", row:11, col:9, length:4, answer:"IRIS", clue:"Fiore noto anche come giaggiolo / Dea greca dell'arcobaleno", hint:true, image:"iris.jpg" },
    { id:28, number:51, direction:"across", row:12, col:0, length:4, answer:"NEON", clue:"Gas nobile utilizzato nelle insegne luminose", hint:true, image:"neon.jpg" },
    { id:29, number:52, direction:"across", row:12, col:6, length:6, answer:"LUCIDO", clue:"Il santo di Aquara, ricordato il 5 dicembre", hint:true, image:"lucido.jpg" },
    { id:30, number:54, direction:"across", row:13, col:4, length:6, answer:"EDVIGE", clue:"La Santa Duchessa di Slesia e Polonia, ricordata il 16 ottobre", hint:true, image:"edvige.jpg" },
    // ── VERTICALI ──
    { id:31, number:1, direction:"down", row:0, col:0, length:6, answer:"ORSOLA", clue:"Fanciulla di rara bellezza, figlia di un re di Britagna. Le sue compagne di martirio: Marta, Saula, Brittola, Gregoria...", hint:true, image:"orsola.jpg" },
    { id:32, number:2, direction:"down", row:0, col:1, length:4, answer:"ROAR", clue:"Ruggito di leone... nei fumetti", hint:false },
    { id:33, number:3, direction:"down", row:0, col:2, length:3, answer:"IMU", clue:"Ex tassa comunale sugli immobili", hint:false },
    { id:34, number:4, direction:"down", row:0, col:3, length:7, answer:"EBRULFO", clue:"Santo eremita vissuto in Normandia nel VI sec., ricordato il 29 dicembre", hint:true, image:"ebrulfo.jpg" },
    { id:35, number:5, direction:"down", row:0, col:4, length:3, answer:"TOO", clue:"In coda al tatoo", hint:false },
    { id:36, number:6, direction:"down", row:0, col:5, length:8, answer:"ADELAIDE", clue:"Santa Imperatrice, vedova di Lotario II e poi moglie di Ottone I, commemorata il 16 dicembre", hint:false },
    { id:37, number:7, direction:"down", row:0, col:6, length:4, answer:"BELL", clue:"Ingegnere e inventore di origine scozzese che per primo brevettò il telefono", hint:true, image:"bell.jpg" },
    { id:38, number:8, direction:"down", row:0, col:7, length:6, answer:"ELIGIO", clue:"Santo Vescovo di Francia ricordato il primo dicembre", hint:true, image:"eligio.jpg" },
    { id:39, number:9, direction:"down", row:0, col:8, length:2, answer:"RF", clue:"Riccardo Fogli", hint:true, image:"rf.jpg" },
    { id:40, number:10, direction:"down", row:0, col:9, length:2, answer:"TI", clue:"Nella stia", hint:false },
    { id:41, number:11, direction:"down", row:0, col:10, length:9, answer:"INNOCENZO", clue:"Nome di 13 papi", hint:true, image:"innocenzo.jpg" },
    { id:42, number:14, direction:"down", row:1, col:12, length:7, answer:"OMOBONO", clue:"Santo di Cremona, ricordato il 13 novembre", hint:true, image:"omobono.jpg" },
    { id:43, number:19, direction:"down", row:3, col:4, length:6, answer:"ERPICE", clue:"Macchina agricola detta anche frangizolle", hint:true, image:"erpice.jpg" },
    { id:44, number:21, direction:"down", row:4, col:2, length:10, answer:"CELESTINOV", clue:"Il papa del «gran rifiuto» dantesco", hint:true, image:"celestino.jpg" },
    { id:45, number:25, direction:"down", row:5, col:1, length:2, answer:"LF", clue:"Loft senza pari", hint:false },
    { id:46, number:27, direction:"down", row:5, col:7, length:2, answer:"NO", clue:"Monossido di Azoto", hint:false },
    { id:47, number:28, direction:"down", row:5, col:10, length:3, answer:"RON", clue:"Nome d'arte di Rosalino Cellamare", hint:false },
    { id:48, number:30, direction:"down", row:6, col:4, length:6, answer:"RETATA", clue:"Fermo o arresto di varie persone operato in uno stesso ambiente dalla polizia", hint:false },
    { id:49, number:31, direction:"down", row:6, col:8, length:8, answer:"BEATRICE", clue:"Amata da Dante", hint:false },
    { id:50, number:32, direction:"down", row:7, col:0, length:7, answer:"BIBIANA", clue:"Santa martire, celebrata il 2 dicembre", hint:true, image:"bibiana.jpg" },
    { id:51, number:34, direction:"down", row:7, col:5, length:4, answer:"RIAT", clue:"Royal International Air Tattoo", hint:false },
    { id:52, number:36, direction:"down", row:8, col:1, length:5, answer:"NONNE", clue:"Madri di madri", hint:false },
    { id:53, number:39, direction:"down", row:9, col:4, length:3, answer:"IRI", clue:"Istituto per la Ricostruzione Industriale", hint:false },
    { id:54, number:41, direction:"down", row:9, col:9, length:4, answer:"PORI", clue:"Nome generico di vari orifizi e fori sulla superficie di un organo", hint:false },
    { id:55, number:42, direction:"down", row:9, col:11, length:4, answer:"RISO", clue:"Cereale molto diffuso in India", hint:true, image:"riso.jpg" },
    { id:56, number:44, direction:"down", row:10, col:2, length:3, answer:"SUN", clue:"Il sole di Londra", hint:false },
    { id:57, number:45, direction:"down", row:10, col:3, length:4, answer:"ERED", clue:"I quattro settimi dell'eredità", hint:false },
    { id:58, number:47, direction:"down", row:10, col:12, length:4, answer:"NIDO", clue:"Casa per uccelli", hint:true, image:"nido.jpg" },
    { id:59, number:49, direction:"down", row:11, col:8, length:3, answer:"OLI", clue:"Quelli «essenziali» sono miscele di terpeni, le essenze odorose", hint:false },
    { id:60, number:53, direction:"down", row:12, col:7, length:2, answer:"UG", clue:"Umberto Giordano", hint:false },
  ]
};

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const JOKER_INVENTORY = { x2:2, x3:2, x4:1 };
const JOKER_VALUES = { x2:2, x3:3, x4:4 };
const TIMER_JOKER = 20;
const TIMER_ANSWER = 90;
const COLORS = ["#1D6FD3","#D85A30","#1D9E75","#884AB7","#BA7517","#A32D2D"];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const normalize = (s) => s.toUpperCase().replace(/\s/g,"")
  .replace(/[ÀÁÂÃ]/g,"A").replace(/[ÈÉÊË]/g,"E")
  .replace(/[ÌÍÎÏ]/g,"I").replace(/[ÒÓÔÕ]/g,"O").replace(/[ÙÚÛÜ]/g,"U");

function buildGrid() {
  const blackSet = new Set(GAME_DATA.blackCells.map(([r,c])=>`${r},${c}`));
  const numMap = {};
  GAME_DATA.words.forEach(w => {
    const k = `${w.row},${w.col}`;
    if (!numMap[k]) numMap[k] = [];
    if (!numMap[k].includes(w.number)) numMap[k].push(w.number);
  });
  const g = {};
  for (let r=0; r<GAME_DATA.meta.gridRows; r++)
    for (let c=0; c<GAME_DATA.meta.gridCols; c++) {
      const k=`${r},${c}`;
      g[k] = { black: blackSet.has(k), letter:"", revealed:false, numbers: numMap[k]||[] };
    }
  return g;
}

function getCells(word) {
  return Array.from({length: word.length}, (_,i) =>
    word.direction==="across" ? {r:word.row, c:word.col+i} : {r:word.row+i, c:word.col}
  );
}

function buildHazard(n) {
  const s = Math.ceil(n/2), id = n - s;
  return [...Array(s).fill("santo"), ...Array(id).fill("idiota")];
}

// ─── STYLES (injected) ───────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;900&family=Bebas+Neue&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Barlow',system-ui,sans-serif;background:#0d0d1a;color:#e8e8f0;overflow:hidden}
.app{height:100vh;width:100vw;display:flex;flex-direction:column}

/* HOME */
.home{width:100%;height:100vh;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);cursor:pointer;
  position:relative;overflow:hidden}
.home::before{content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse at center,rgba(53,118,210,.15),transparent 70%)}
.home-inner{text-align:center;position:relative;z-index:1}
.logo-s{font-family:'Bebas Neue','Impact',sans-serif;font-size:clamp(52px,10vw,110px);
  color:#f5c518;display:block;letter-spacing:.1em;line-height:1;
  text-shadow:0 0 60px rgba(245,197,24,.4)}
.logo-a{font-size:clamp(24px,4vw,48px);color:#555;line-height:.9;display:block}
.logo-i{font-family:'Bebas Neue','Impact',sans-serif;font-size:clamp(52px,10vw,110px);
  color:#e05252;display:block;letter-spacing:.1em;line-height:1;
  text-shadow:0 0 60px rgba(224,82,82,.4)}
.logo-sub{font-size:clamp(12px,1.8vw,18px);letter-spacing:.4em;color:#667;
  margin-top:10px;font-weight:300;text-transform:uppercase}
.home-hint{margin-top:36px;font-size:13px;color:rgba(255,255,255,.3);letter-spacing:.15em;
  animation:blink 2s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:.3}50%{opacity:.8}}

/* SETUP */
.setup{width:100%;min-height:100vh;display:flex;flex-direction:column;align-items:center;
  justify-content:center;padding:24px;background:#1a1a2e;overflow-y:auto}
.setup h1{font-size:28px;font-weight:800;color:#f5c518;margin-bottom:24px}
.setup-card{background:#16213e;border:1px solid rgba(255,255,255,.08);border-radius:16px;
  padding:32px;width:100%;max-width:460px;display:flex;flex-direction:column;gap:20px}
.s-label{font-size:12px;color:#8899bb;text-transform:uppercase;letter-spacing:.1em}
.num-row{display:flex;gap:8px}
.nbtn{width:48px;height:48px;border-radius:50%;border:2px solid rgba(255,255,255,.15);
  background:transparent;color:#e8e8f0;font-size:18px;font-weight:700;cursor:pointer;transition:.15s all}
.nbtn:hover{border-color:#f5c518;color:#f5c518}
.nbtn.on{background:#f5c518;color:#1a1a2e;border-color:#f5c518}
.names{display:flex;flex-direction:column;gap:10px}
.nrow{display:flex;align-items:center;gap:12px}
.avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;
  justify-content:center;font-weight:700;font-size:13px;color:#fff;flex-shrink:0}
.ninput{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);
  border-radius:8px;padding:10px 14px;color:#e8e8f0;font-size:15px;outline:none;transition:.15s}
.ninput:focus{border-color:#f5c518}
.ninput::placeholder{color:rgba(255,255,255,.25)}
.teams-row{display:flex;align-items:center;gap:10px;cursor:pointer;color:#8899bb;font-size:14px}
.teams-row input{accent-color:#f5c518;width:16px;height:16px;cursor:pointer}
.btn-go{padding:14px 24px;background:#f5c518;color:#1a1a2e;border:none;border-radius:10px;
  font-size:16px;font-weight:700;cursor:pointer;transition:.15s all;letter-spacing:.04em}
.btn-go:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(245,197,24,.4)}

/* GAME LAYOUT */
.game{display:grid;grid-template-columns:200px 1fr 270px;height:100vh;overflow:hidden;background:#0d0d1a}

/* SIDEBAR LEFT */
.sl{background:#13132a;border-right:1px solid rgba(255,255,255,.06);
  padding:14px 10px;overflow-y:auto;display:flex;flex-direction:column;gap:8px}
.sl-title{font-size:11px;text-transform:uppercase;letter-spacing:.15em;
  color:rgba(255,255,255,.3);padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,.06)}
.pcard{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);
  border-radius:10px;padding:10px;transition:.2s all}
.pcard.active{background:rgba(255,255,255,.07);border-color:rgba(245,197,24,.4);
  box-shadow:0 0 14px rgba(245,197,24,.1)}
.ph{display:flex;align-items:center;gap:8px}
.pav{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;
  justify-content:center;font-weight:700;font-size:12px;color:#fff;flex-shrink:0}
.pi{flex:1;min-width:0}
.pn{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ps{font-size:20px;font-weight:800;color:#f5c518;line-height:1}
.parr{color:#f5c518;font-size:12px}
.jrow{display:flex;gap:4px;margin-top:6px}
.jchip{flex:1;background:rgba(255,255,255,.08);border-radius:5px;padding:3px 2px;text-align:center}
.jchip.empty{opacity:.25}
.jl{font-size:9px;font-weight:700;display:block;color:#8899bb}
.jv{font-size:13px;font-weight:700}
.prog{margin-top:auto;padding-top:10px}
.prog-lbl{font-size:11px;color:rgba(255,255,255,.3);margin-bottom:5px}
.prog-bar{height:4px;background:rgba(255,255,255,.08);border-radius:2px}
.prog-fill{height:100%;background:#f5c518;border-radius:2px;transition:.4s width}

/* GRID AREA */
.ga{overflow:auto;display:flex;align-items:center;justify-content:center;padding:12px;background:#0d0d1a}
.cw-wrap{display:flex;align-items:center;justify-content:center;width:100%;height:100%}
.cw{display:grid;gap:1px;background:#444;border:2px solid #555;border-radius:3px;overflow:hidden;
  width:min(calc(100vh - 24px),calc(100% - 0px));aspect-ratio:13/14}
.cell{position:relative;display:flex;align-items:center;justify-content:center}
.cell.bk{background:#666}
.cell.wh{background:#f0f0e8}
.cell.hl{background:#fff7c0;box-shadow:inset 0 0 0 2px #f5c518}
.cell.rv{background:#e4f0e4}
.cnum{position:absolute;top:1px;left:1px;font-size:clamp(5px,.9vw,8px);font-weight:700;
  color:#222;background:#fff;border-radius:2px;padding:0 1px;line-height:1.2;z-index:1}
.clet{font-size:clamp(10px,1.8vw,20px);font-weight:900;color:#1a1a2e;line-height:1;z-index:1}

/* SIDEBAR RIGHT */
.sr{background:#13132a;border-left:1px solid rgba(255,255,255,.06);
  padding:14px;overflow-y:auto;display:flex;flex-direction:column;gap:12px}
.turn-banner{border-radius:10px;padding:10px 14px;font-weight:700;font-size:14px;color:#fff;line-height:1.3}
.fail-badge{font-size:11px;background:rgba(0,0,0,.3);padding:2px 8px;border-radius:20px;
  margin-top:4px;display:inline-block}
.btn-draw{width:100%;padding:14px;background:#f5c518;color:#1a1a2e;border:none;
  border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;transition:.15s all;letter-spacing:.02em}
.btn-draw:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(245,197,24,.3)}
.card-box{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);
  border-radius:10px;padding:12px}
.card-hdr{display:flex;gap:6px;align-items:center;margin-bottom:8px;flex-wrap:wrap}
.cn{font-weight:700;color:#f5c518;font-size:13px}
.cd{font-size:11px;color:#8899bb}
.cl{font-size:11px;background:rgba(255,255,255,.08);padding:2px 8px;border-radius:20px;margin-left:auto}
.clue{font-size:13px;line-height:1.6;color:#ccd0e0}
.hint-area{display:flex;flex-direction:column;gap:8px}
.hint-img{width:100%;aspect-ratio:1;background:rgba(255,255,255,.05);border-radius:8px;
  overflow:hidden;display:flex;align-items:center;justify-content:center}
.hint-img img{width:100%;height:100%;object-fit:cover}
.hint-fallback{width:100%;aspect-ratio:1;background:rgba(255,255,255,.05);border-radius:8px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
  color:#8899bb;font-size:12px;text-align:center;padding:12px}
.hint-fb-icon{font-size:32px}
.btn-reveal{width:100%;padding:9px;background:rgba(53,118,210,.15);
  border:1px solid rgba(53,118,210,.35);color:#6fa8f5;border-radius:8px;
  font-size:13px;font-weight:600;cursor:pointer;transition:.15s}
.btn-reveal:hover{background:rgba(53,118,210,.28)}

/* TIMER */
.timer-wrap{display:flex;flex-direction:column;align-items:center;gap:4px}
.timer-svg{width:72px;height:72px}
.timer-svg.urgent{animation:shake .35s ease-in-out infinite}
@keyframes shake{0%,100%{transform:translateX(0)}33%{transform:translateX(-2px)}66%{transform:translateX(2px)}}
.timer-lbl{font-size:11px;color:#8899bb;text-transform:uppercase;letter-spacing:.1em}

/* JOKERS */
.j-section{display:flex;flex-direction:column;gap:6px}
.j-section-lbl{font-size:11px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.1em}
.btn-j{width:100%;padding:10px 12px;background:rgba(245,197,24,.1);
  border:1px solid rgba(245,197,24,.25);color:#f5c518;border-radius:8px;
  font-size:14px;font-weight:700;cursor:pointer;transition:.15s;
  display:flex;justify-content:space-between;align-items:center}
.btn-j:hover:not(.jd){background:rgba(245,197,24,.2)}
.btn-j.ja{background:#f5c518;color:#1a1a2e}
.btn-j.jd{opacity:.3;cursor:not-allowed}
.jr{font-size:11px;font-weight:400;opacity:.7}
.btn-skip{width:100%;padding:8px;background:transparent;
  border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.35);
  border-radius:8px;font-size:12px;cursor:pointer;transition:.15s}
.btn-skip:hover{background:rgba(255,255,255,.05);color:rgba(255,255,255,.55)}

/* ANSWER */
.ans-area{display:flex;flex-direction:column;gap:8px}
.ans-input{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);
  border-radius:8px;padding:12px 14px;color:#e8e8f0;font-size:16px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;outline:none;transition:.15s}
.ans-input:focus{border-color:#f5c518}
.btn-ok{width:100%;padding:12px;background:#1D9E75;border:none;border-radius:8px;
  color:#fff;font-size:15px;font-weight:700;cursor:pointer;transition:.15s}
.btn-ok:hover{background:#1aad7f}
.joker-active-banner{background:rgba(245,197,24,.1);border:1px solid rgba(245,197,24,.3);
  border-radius:8px;padding:9px 12px;font-size:13px;font-weight:600;color:#f5c518;text-align:center}

/* TOAST */
.toast{position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:9999;
  padding:11px 18px;border-radius:10px;font-size:14px;font-weight:600;
  max-width:460px;text-align:center;pointer-events:none;
  animation:tin .25s ease,tout .25s ease 2.5s forwards}
.t-ok{background:#0f4a2e;border:1px solid #1D9E75;color:#7dffbd}
.t-ko{background:#4a1010;border:1px solid #E24B4A;color:#ff9999}
.t-info{background:#1a2a4a;border:1px solid #378ADD;color:#99ccff}
@keyframes tin{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes tout{from{opacity:1}to{opacity:0}}

/* ENDGAME */
.end{width:100%;min-height:100vh;display:flex;align-items:center;justify-content:center;
  background:#0d0d1a;padding:24px}
.end-card{background:#16213e;border:1px solid rgba(245,197,24,.2);border-radius:20px;
  padding:36px 28px;width:100%;max-width:460px;display:flex;flex-direction:column;
  align-items:center;gap:14px;text-align:center}
.trophy{font-size:54px;line-height:1}
.wname{font-size:30px;font-weight:800;color:#f5c518}
.wlbl{font-size:14px;color:#8899bb}
.ranking{width:100%;display:flex;flex-direction:column;gap:6px;margin:6px 0}
.rrow{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.03);
  border-radius:10px;padding:9px 12px;border:1px solid rgba(255,255,255,.06)}
.rrow.first{background:rgba(245,197,24,.07);border-color:rgba(245,197,24,.22)}
.rpos{width:22px;font-weight:700;font-size:13px;color:#8899bb}
.rbadge{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;
  justify-content:center;font-weight:700;font-size:12px;color:#fff}
.rpn{flex:1;text-align:left;font-weight:600;font-size:14px}
.rscore{font-weight:800;font-size:16px;color:#f5c518}

@media(max-width:820px){
  .game{grid-template-columns:1fr;grid-template-rows:auto 1fr auto}
  .sl{flex-direction:row;overflow-x:auto;border-right:none;
    border-bottom:1px solid rgba(255,255,255,.06);padding:8px;max-height:unset}
  .sl-title{display:none}
  .pcard{min-width:110px}
  .sr{border-left:none;border-top:1px solid rgba(255,255,255,.06);overflow-y:visible}
  .ga{padding:6px}
  .cw{width:min(calc(100vw - 12px),calc(100vh - 180px))}
}
`;

function injectStyles() {
  if (document.getElementById("si-styles")) return;
  const s = document.createElement("style");
  s.id = "si-styles";
  s.textContent = CSS;
  document.head.appendChild(s);
}

// ─── CROSSWORD GRID ───────────────────────────────────────────────────────────
function CWGrid({ grid, highlighted }) {
  const { gridRows, gridCols } = GAME_DATA.meta;
  const hlSet = new Set(highlighted);
  return (
    <div className="cw" style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
      {Array.from({length: gridRows}, (_,r) =>
        Array.from({length: gridCols}, (_,c) => {
          const k = `${r},${c}`;
          const cell = grid[k];
          if (!cell) return null;
          if (cell.black) return <div key={k} className="cell bk" />;
          const isHl = hlSet.has(k);
          return (
            <div key={k} className={`cell wh${isHl?" hl":""}${cell.revealed?" rv":""}`}>
              {cell.numbers.length > 0 && <span className="cnum">{cell.numbers[0]}</span>}
              {cell.revealed && <span className="clet">{cell.letter}</span>}
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── TIMER RING ───────────────────────────────────────────────────────────────
function TimerRing({ val, max, label }) {
  const R = 30, circ = 2 * Math.PI * R;
  const ratio = val / max;
  const color = val <= 5 ? "#E24B4A" : val <= 15 ? "#EF9F27" : "#1D9E75";
  return (
    <div className="timer-wrap">
      <svg className={`timer-svg${val<=5?" urgent":""}`} viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="6"/>
        <circle cx="36" cy="36" r={R} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={circ*(1-ratio)}
          strokeLinecap="round" transform="rotate(-90 36 36)" style={{transition:"stroke-dashoffset .8s linear,stroke .3s"}}/>
        <text x="36" y="42" textAnchor="middle" fontSize="18" fontWeight="bold" fill={color}>{val}</text>
      </svg>
      <div className="timer-lbl">{label}</div>
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  const cls = type==="ok"?"t-ok":type==="ko"?"t-ko":"t-info";
  return <div className={`toast ${cls}`}>{msg}</div>;
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeScreen({ onNext }) {
  return (
    <div className="home" onClick={onNext}>
      <div className="home-inner">
        <span className="logo-s">SANTI</span>
        <span className="logo-a">&amp;</span>
        <span className="logo-i">IDIOTI</span>
        <div className="logo-sub">Cross Quiz</div>
        <div className="home-hint">Clicca per iniziare</div>
      </div>
    </div>
  );
}

// ─── SETUP ────────────────────────────────────────────────────────────────────
function SetupScreen({ onStart }) {
  const [n, setN] = useState(2);
  const [names, setNames] = useState(Array(6).fill(""));
  const [teams, setTeams] = useState(false);
  const go = () => {
    const finalized = names.slice(0,n).map((nm,i) => nm.trim() || (teams?`Squadra ${i+1}`:`Giocatore ${i+1}`));
    onStart(finalized.map((name,i) => ({ id:i, name, color:COLORS[i], score:0, jokers:{...JOKER_INVENTORY} })));
  };
  return (
    <div className="setup">
      <h1>Configurazione Partita</h1>
      <div className="setup-card">
        <div className="s-label">Numero di {teams?"squadre":"giocatori"}</div>
        <div className="num-row">
          {[2,3,4,5,6].map(x => <button key={x} className={`nbtn${n===x?" on":""}`} onClick={()=>setN(x)}>{x}</button>)}
        </div>
        <div className="names">
          {Array.from({length:n},(_,i) => (
            <div key={i} className="nrow">
              <div className="avatar" style={{background:COLORS[i]}}>{(names[i]||"?")[0].toUpperCase()}</div>
              <input className="ninput" placeholder={teams?`Squadra ${i+1}`:`Giocatore ${i+1}`}
                value={names[i]} onChange={e=>{const a=[...names];a[i]=e.target.value;setNames(a);}} maxLength={20}/>
            </div>
          ))}
        </div>
        <label className="teams-row">
          <input type="checkbox" checked={teams} onChange={e=>setTeams(e.target.checked)}/>
          <span>Gioca a squadre</span>
        </label>
        <button className="btn-go" onClick={go}>🎲 Inizia Partita</button>
      </div>
    </div>
  );
}

// ─── ENDGAME ──────────────────────────────────────────────────────────────────
function EndGame({ players, onRestart }) {
  const sorted = [...players].sort((a,b)=>b.score-a.score);
  return (
    <div className="end">
      <div className="end-card">
        <div className="trophy">🏆</div>
        <div className="wname">{sorted[0].name}</div>
        <div className="wlbl">Vincitore con {sorted[0].score} punti!</div>
        <div className="ranking">
          {sorted.map((p,i) => (
            <div key={p.id} className={`rrow${i===0?" first":""}`}>
              <span className="rpos">{i+1}°</span>
              <div className="rbadge" style={{background:p.color}}>{p.name[0]}</div>
              <span className="rpn">{p.name}</span>
              <span className="rscore">{p.score} pt</span>
            </div>
          ))}
        </div>
        <button className="btn-go" onClick={onRestart}>🔄 Nuova Partita</button>
      </div>
    </div>
  );
}

// ─── MAIN GAME ────────────────────────────────────────────────────────────────
function GameBoard({ initPlayers, onEnd }) {
  const [players, setPlayers] = useState(initPlayers);
  const [cpIdx, setCpIdx] = useState(() => Math.floor(Math.random()*initPlayers.length));
  const [grid, setGrid] = useState(buildGrid);
  const [deckWords, setDeckWords] = useState(() => GAME_DATA.words.map(w=>({...w, inDeck:true})));
  const [hazards, setHazards] = useState(() => buildHazard(initPlayers.length));

  // phase: idle | joker | answer | done
  const [phase, setPhase] = useState("idle");
  const [card, setCard] = useState(null);
  const [joker, setJoker] = useState(null);
  const [hintShown, setHintShown] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerMax, setTimerMax] = useState(20);
  const [ansVal, setAnsVal] = useState("");
  const [highlighted, setHighlighted] = useState([]);
  const [chain, setChain] = useState(null); // {wordId, tried:[]}
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  injectStyles();

  const flash = (msg, type="info") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 2900);
  };

  const stopTimer = () => { clearInterval(timerRef.current); };

  const startTimer = (secs, onDone) => {
    stopTimer();
    setTimer(secs); setTimerMax(secs);
    timerRef.current = setInterval(() => {
      setTimer(v => { if(v<=1){clearInterval(timerRef.current);onDone();return 0;} return v-1; });
    }, 1000);
  };

  useEffect(() => () => stopTimer(), []);

  const nextPlayer = (idx) => (idx+1) % players.length;
  const advance = (idx) => { const ni = nextPlayer(idx); setCpIdx(ni); return ni; };

  const highlight = (word) => {
    if (!word) { setHighlighted([]); return; }
    setHighlighted(getCells(word).map(({r,c})=>`${r},${c}`));
  };

  // ── DRAW ──
  const draw = () => {
    if (phase !== "idle") return;
    const cp = players[cpIdx];
    const avail = deckWords.filter(w=>w.inDeck);
    const haz = hazards;

    if (avail.length === 0 && haz.length === 0) { onEnd(players); return; }

    // If in fail-chain, re-present same word
    if (chain) {
      const w = deckWords.find(x=>x.id===chain.wordId);
      if (!w) { setChain(null); return; }
      setCard({...w, isHazard:false});
      setJoker(null); setHintShown(false); setAnsVal("");
      highlight(w);
      setPhase("joker");
      startTimer(TIMER_JOKER, ()=>{ setPhase("answer"); startTimer(TIMER_ANSWER, timeUp); });
      setTimeout(()=>inputRef.current?.focus(), 80);
      return;
    }

    const total = avail.length + haz.length;
    if (Math.random() * total < haz.length) {
      // Hazard
      const idx = Math.floor(Math.random()*haz.length);
      const h = haz[idx];
      setHazards(haz.filter((_,i)=>i!==idx));
      setCard({type:h, isHazard:true});

      if (h === "santo") {
        setPlayers(prev=>prev.map((p,i)=>i===cpIdx?{...p,score:p.score+50}:p));
        flash(`⚡ SANTO! +50pt a ${cp.name}`, "ok");
      } else {
        setPlayers(prev=>prev.map((p,i)=>i!==cpIdx?{...p,score:p.score+50}:p));
        flash(`💀 IDIOTA! +50pt a tutti gli avversari!`, "ko");
      }
      setPhase("done");
      setTimeout(()=>{ setPhase("idle"); setCard(null); advance(cpIdx); }, 2800);
      return;
    }

    const w = avail[Math.floor(Math.random()*avail.length)];
    setCard({...w, isHazard:false});
    setJoker(null); setHintShown(false); setAnsVal("");
    highlight(w);
    setPhase("joker");
    startTimer(TIMER_JOKER, ()=>{ setPhase("answer"); startTimer(TIMER_ANSWER, timeUp); });
    setTimeout(()=>inputRef.current?.focus(), 80);
  };

  const skipJoker = () => {
    if (phase!=="joker") return;
    stopTimer();
    setPhase("answer");
    startTimer(TIMER_ANSWER, timeUp);
  };

  const activateJoker = (type) => {
    if (phase!=="joker") return;
    if (chain) { flash("Nessun Jolly nelle catene di errore!", "ko"); return; }
    if (joker) { flash("Jolly già attivato!", "ko"); return; }
    const cp = players[cpIdx];
    if (cp.jokers[type] <= 0) { flash("Jolly esaurito!", "ko"); return; }
    setJoker(type);
    setPlayers(prev=>prev.map((p,i)=>i===cpIdx?{...p,jokers:{...p.jokers,[type]:p.jokers[type]-1}}:p));
    flash(`🃏 Jolly ${type.toUpperCase()} attivato!`, "ok");
  };

  const timeUp = () => { wrong(); };

  const submit = () => {
    if (phase!=="answer") return;
    if (normalize(ansVal) === normalize(card.answer)) correct();
    else wrong();
  };

  const correct = () => {
    stopTimer();
    const base = card.answer.length;
    const jm = joker ? JOKER_VALUES[joker] : 1;
    const hm = (card.hint && !hintShown) ? 2 : 1;
    const pts = base * jm * hm;
    setPlayers(prev=>prev.map((p,i)=>i===cpIdx?{...p,score:p.score+pts}:p));

    // Fill grid
    const cells = getCells(card);
    setGrid(prev=>{
      const next={...prev};
      cells.forEach(({r,c},i)=>{
        const k=`${r},${c}`;
        next[k]={...next[k],letter:card.answer[i],revealed:true};
      });
      return next;
    });
    setDeckWords(prev=>prev.map(w=>w.id===card.id?{...w,inDeck:false}:w));
    setHighlighted([]);
    setChain(null);

    const parts = [`${base}pt base`];
    if(jm>1) parts.push(`×${jm} Jolly`);
    if(hm>1) parts.push("×2 Hint");
    flash(`✅ Corretto! +${pts}pt (${parts.join(" ")})`, "ok");
    setPhase("idle"); setCard(null);
    const ni = advance(cpIdx);

    // Check win
    setTimeout(()=>{
      const remaining = deckWords.filter(w=>w.id!==card.id).filter(w=>w.inDeck).length;
      if (remaining === 0) onEnd(players);
    }, 300);
  };

  const wrong = () => {
    stopTimer();
    setPlayers(prev=>prev.map((p,i)=>i!==cpIdx?{...p,score:p.score+5}:p));

    if (!chain) {
      if (players.length === 1) {
        flash("❌ Sbagliato! La carta torna nel sacchetto.", "ko");
        setPhase("idle"); setCard(null); setHighlighted([]);
        advance(cpIdx); return;
      }
      setChain({ wordId: card.id, tried: [cpIdx] });
      flash(`❌ Sbagliato! +5pt agli avversari. Prossimo giocatore.`, "ko");
    } else {
      const tried = [...chain.tried, cpIdx];
      if (tried.length >= players.length - 1) {
        flash("❌ Nessuno ha indovinato! La carta torna nel sacchetto.", "ko");
        setChain(null); setHighlighted([]);
      } else {
        setChain({...chain, tried});
        flash(`❌ Sbagliato! +5pt agli avversari.`, "ko");
      }
    }
    setPhase("idle"); setCard(null);
    advance(cpIdx);
  };

  const cp = players[cpIdx];
  const avail = deckWords.filter(w=>w.inDeck).length;
  const prog = ((deckWords.length - avail) / deckWords.length) * 100;

  return (
    <div className="game">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* LEFT – Players */}
      <div className="sl">
        <div className="sl-title">Giocatori</div>
        {players.map((p,i) => (
          <div key={p.id} className={`pcard${i===cpIdx?" active":""}`}>
            <div className="ph">
              <div className="pav" style={{background:p.color}}>{p.name[0]}</div>
              <div className="pi">
                <div className="pn">{p.name}</div>
                <div className="ps">{p.score}</div>
              </div>
              {i===cpIdx && <span className="parr">▶</span>}
            </div>
            <div className="jrow">
              {["x2","x3","x4"].map(j=>(
                <div key={j} className={`jchip${p.jokers[j]===0?" empty":""}`}>
                  <span className="jl">{j.toUpperCase()}</span>
                  <span className="jv">×{p.jokers[j]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="prog">
          <div className="prog-lbl">Parole: {deckWords.length-avail}/{deckWords.length}</div>
          <div className="prog-bar"><div className="prog-fill" style={{width:`${prog}%`}}/></div>
        </div>
      </div>

      {/* CENTER – Grid */}
      <div className="ga">
        <div className="cw-wrap">
          <CWGrid grid={grid} highlighted={highlighted}/>
        </div>
      </div>

      {/* RIGHT – Controls */}
      <div className="sr">
        <div className="turn-banner" style={{background:cp.color}}>
          Turno: {cp.name}
          {chain && <div className="fail-badge">🔗 Catena errori</div>}
        </div>

        {phase==="idle" && (
          <button className="btn-draw" onClick={draw}>🎴 Estrai Carta</button>
        )}

        {card && !card.isHazard && (
          <div className="card-box">
            <div className="card-hdr">
              <span className="cn">#{card.number}</span>
              <span className="cd">{card.direction==="across"?"→ Orizz.":"↓ Vert."}</span>
              <span className="cl">{card.length} lett.</span>
            </div>
            {card.hint && !hintShown ? (
              <div className="hint-area">
                <div className="hint-fallback">
                  <span className="hint-fb-icon">🖼️</span>
                  <span>Immagine hint:<br/><strong>{card.image}</strong></span>
                  <span style={{fontSize:"10px",opacity:.6,marginTop:"4px"}}>(Metti il file in /public/assets/)</span>
                </div>
                <button className="btn-reveal" onClick={()=>setHintShown(true)}>👁 Rivela Testo</button>
              </div>
            ) : (
              <div className="clue">{card.clue}</div>
            )}
          </div>
        )}

        {(phase==="joker"||phase==="answer") && (
          <TimerRing val={timer} max={timerMax} label={phase==="joker"?"Fase Jolly":"Risposta"}/>
        )}

        {phase==="joker" && (
          <div className="j-section">
            <div className="j-section-lbl">Attiva Jolly:</div>
            {["x2","x3","x4"].map(j=>{
              const rem = cp.jokers[j];
              return (
                <button key={j}
                  className={`btn-j${joker===j?" ja":""}${rem===0||!!joker?" jd":""}`}
                  onClick={()=>activateJoker(j)}
                  disabled={rem===0||!!joker||!!chain}>
                  {j.toUpperCase()} <span className="jr">({rem} rim.)</span>
                </button>
              );
            })}
            <button className="btn-skip" onClick={skipJoker}>⏭ Salta fase Jolly</button>
          </div>
        )}

        {phase==="answer" && (
          <div className="ans-area">
            <input ref={inputRef} className="ans-input"
              placeholder="Digita risposta…" value={ansVal}
              onChange={e=>setAnsVal(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&submit()}/>
            <button className="btn-ok" onClick={submit}>✓ Conferma risposta</button>
          </div>
        )}

        {joker && phase==="answer" && (
          <div className="joker-active-banner">
            🃏 Jolly {joker.toUpperCase()} attivo{card?.hint&&!hintShown?" + ×2 Hint":""}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [players, setPlayers] = useState(null);

  injectStyles();

  return (
    <div className="app">
      {screen==="home" && <HomeScreen onNext={()=>setScreen("setup")}/>}
      {screen==="setup" && <SetupScreen onStart={p=>{setPlayers(p);setScreen("game");}}/>}
      {screen==="game" && players &&
        <GameBoard initPlayers={players} onEnd={p=>{setPlayers(p);setScreen("end");}}/>}
      {screen==="end" && players &&
        <EndGame players={players} onRestart={()=>{setPlayers(null);setScreen("home");}}/>}
    </div>
  );
}

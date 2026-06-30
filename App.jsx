import { useState, useEffect, useRef, useCallback } from "react";
import elencoSchemi from "../data/indice.json";
import Editor from "./Editor";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const JOKER_INVENTORY = { x2: 2, x3: 2, x4: 1 };
const JOKER_VALUES = { x2: 2, x3: 3, x4: 4 };
const TIMER_JOKER = 20;
const TIMER_ANSWER = 90;
const HAZARD_SANTO_PTS = 50;
const HAZARD_IDIOTA_PTS = 50;
const WRONG_ANSWER_PTS = 5;
const COLORS = ["#1D6FD3","#D85A30","#1D9E75","#884AB7","#BA7517","#A32D2D"];

// ─── GRID UTILITIES ─────────────────────────────────────────────────────────
function buildGridMap(gameData) {
  const map = {};
  if (!gameData) return map;
  const blackSet = new Set(gameData.blackCells.map(([r,c]) => r + "," + c));
  const numberMap = {};
  gameData.words.forEach(w => {
    const key = w.row + "," + w.col;
    if (!numberMap[key]) numberMap[key] = [];
    numberMap[key].push(w.number);
  });
  for (let r = 0; r < gameData.meta.gridRows; r++) {
    for (let c = 0; c < gameData.meta.gridCols; c++) {
      const k = r + "," + c;
      map[k] = {
        black: blackSet.has(k),
        letter: "",
        revealed: false,
        numbers: numberMap[k] || [],
        highlighted: false,
      };
    }
  }
  return map;
}

function getCellsForWord(word) {
  const cells = [];
  for (let i = 0; i < word.length; i++) {
    if (word.direction === "across") cells.push({ r: word.row, c: word.col + i });
    else cells.push({ r: word.row + i, c: word.col });
  }
  return cells;
}

function normalizeAnswer(str) {
  return str.toUpperCase().replace(/\s/g, "").replace(/[ÀÁÂÃÄÅ]/g, "A").replace(/[ÈÉÊË]/g, "E")
    .replace(/[ÌÍÎÏ]/g, "I").replace(/[ÒÓÔÕÖ]/g, "O").replace(/[ÙÚÛÜ]/g, "U");
}

// ─── HAZARD DECK ─────────────────────────────────────────────────────────────
function buildHazardDeck(numPlayers) {
  const deck = [];
  const santos = Math.ceil(numPlayers / 2);
  const idiots = numPlayers - santos;
  for (let i = 0; i < santos; i++) deck.push({ type: "santo" });
  for (let i = 0; i < idiots; i++) deck.push({ type: "idiota" });
  return deck;
}

// ─── SCREENS ─────────────────────────────────────────────────────────────────

function HomeScreen({ onStart }) {
  return (
    <div className="home-screen" onClick={onStart}>
      <div className="home-bg-grid"></div>
      <div className="home-content">
        <div className="home-logo-container">
          <img src="/assets/idioti_logo.svg" alt="Logo Santi & Idioti" className="home-logo-img" />
        </div>
        <div className="home-hint">Clicca per iniziare</div>
      </div>
    </div>
  );
}

// SETUP SCREEN
function SetupScreen({ onGameStart, suApriEditor, schemi, schemaSelezionato, suCambiaSchema }) {
  const [numPlayers, setNumPlayers] = useState(2);
  const [names, setNames] = useState(["","","","","",""]);
  const [teamsMode, setTeamsMode] = useState(false);

  const handleStart = () => {
    const finalNames = names.slice(0, numPlayers).map((n, i) =>
      n.trim() || (teamsMode ? "Squadra " + (i + 1) : "Giocatore " + (i + 1))
    );
    onGameStart({ numPlayers, names: finalNames, teamsMode });
  };

  return (
    <div className="setup-screen">
      <h1 className="setup-title">Configurazione Partita</h1>
      <div className="setup-card">
        <label className="setup-label">Seleziona Tabellone</label>
        <select
          value={schemaSelezionato}
          onChange={e => suCambiaSchema(e.target.value)}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "8px",
            padding: "10px 14px",
            color: "#e8e8f0",
            fontSize: "15px",
            outline: "none",
            marginBottom: "10px",
            cursor: "pointer"
          }}
        >
          {schemi.map(s => (
            <option key={s.id} value={s.id} style={{ background: "#1a1a2e", color: "#e8e8f0" }}>
              {s.titolo}
            </option>
          ))}
        </select>

        <label className="setup-label">Numero di {teamsMode ? "squadre" : "giocatori"}</label>
        <div className="num-selector">
          {[2,3,4,5,6].map(n => (
            <button key={n} className={`num-btn ${numPlayers === n ? "active" : ""}`} onClick={() => setNumPlayers(n)}>{n}</button>
          ))}
        </div>
        <div className="names-grid">
          {Array.from({length: numPlayers}).map((_, i) => (
            <div key={i} className="name-row">
              <div className="player-badge" style={{ background: COLORS[i] }}>
                {teamsMode ? `S${i+1}` : `P${i+1}`}
              </div>
              <input
                className="name-input"
                placeholder={teamsMode ? `Squadra ${i+1}` : `Giocatore ${i+1}`}
                value={names[i]}
                onChange={e => { const n=[...names]; n[i]=e.target.value; setNames(n); }}
                maxLength={20}
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <label className="teams-check">
            <input type="checkbox" checked={teamsMode} onChange={e => setTeamsMode(e.target.checked)} />
            <span>Gioca a squadre</span>
          </label>
          <button type="button" className="btn-crea-tabellone-link" onClick={suApriEditor}>
            Crea nuovo tabellone
          </button>
        </div>
        <button className="btn-start" onClick={handleStart}>Inizia Partita →</button>
      </div>
    </div>
  );
}

// ENDGAME SCREEN
function EndGameScreen({ players, onRestart }) {
  const sorted = [...players].sort((a,b) => b.score - a.score);
  const winner = sorted[0];
  return (
    <div className="endgame-screen">
      <div className="endgame-card">
        <div className="trophy">🏆</div>
        <h2 className="winner-name">{winner.name}</h2>
        <p className="winner-label">Vincitore con {winner.score} punti!</p>
        <div className="ranking">
          {sorted.map((p, i) => (
            <div key={p.id} className={`rank-row ${i === 0 ? "rank-first" : ""}`}>
              <span className="rank-pos">{i+1}°</span>
              <span className="rank-badge" style={{ background: p.color }}>{p.name[0]}</span>
              <span className="rank-pname">{p.name}</span>
              <span className="rank-score">{p.score} pt</span>
            </div>
          ))}
        </div>
        <button className="btn-start" onClick={onRestart}>Nuova Partita</button>
      </div>
    </div>
  );
}

// ─── MAIN GAME BOARD ─────────────────────────────────────────────────────────
function GameBoard({ players: initialPlayers, onEndGame, gameData }) {
  const [players, setPlayers] = useState(() => initialPlayers.map((p, i) => ({
    ...p,
    score: 0,
    jokers: { ...JOKER_INVENTORY },
  })));
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(() => Math.floor(Math.random() * initialPlayers.length));
  const [gridMap, setGridMap] = useState(() => buildGridMap(gameData));
  const [deck, setDeck] = useState(() => {
    const words = gameData.words.map(w => ({ ...w, inDeck: true }));
    const hazards = buildHazardDeck(initialPlayers.length);
    return { words, hazards, pulled: [] };
  });

  // Phase: idle | joker_timer | answer_timer | showing_result
  const [phase, setPhase] = useState("idle");
  const [currentCard, setCurrentCard] = useState(null);
  const [activeJoker, setActiveJoker] = useState(null);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [timerVal, setTimerVal] = useState(0);
  const [inputVal, setInputVal] = useState("");
  const [lastResult, setLastResult] = useState(null);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [failChain, setFailChain] = useState(null); // { wordId, attemptedPlayers: [] }
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const showToast = (msg, type="info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const startTimer = useCallback((seconds, onEnd) => {
    clearTimer();
    setTimerVal(seconds);
    timerRef.current = setInterval(() => {
      setTimerVal(v => {
        if (v <= 1) { clearInterval(timerRef.current); onEnd(); return 0; }
        return v - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => clearTimer(), []);

  // Highlight cells for a word
  const highlightWord = useCallback((word) => {
    if (!word) { setHighlightedCells([]); return; }
    setHighlightedCells(getCellsForWord(word).map(({r,c}) => `${r},${c}`));
  }, []);

  // ── DRAW A CARD ──
  const drawCard = () => {
    if (phase !== "idle") return;
    const currentPlayer = players[currentPlayerIdx];

    // Check if we're in fail-chain continuation
    const activeChain = failChain;

    // Build available pool
    const availableWords = deck.words.filter(w => w.inDeck);
    const availableHazards = [...deck.hazards];

    if (availableWords.length === 0 && availableHazards.length === 0) {
      onEndGame(players);
      return;
    }

    // If in fail-chain, re-draw the same word (already tracked by failChain.wordId)
    if (activeChain) {
      const wordEntry = deck.words.find(w => w.id === activeChain.wordId);
      if (!wordEntry) { setFailChain(null); return; }
      setCurrentCard({ ...wordEntry, isHazard: false });
      setHintRevealed(false);
      setActiveJoker(null);
      setInputVal("");
      highlightWord(wordEntry);
      setPhase("joker_timer");
      startTimer(TIMER_JOKER, () => setPhase("answer_timer"));
      setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 100);
      return;
    }

    const totalPool = availableWords.length + availableHazards.length;
    const roll = Math.random() * totalPool;

    if (roll < availableHazards.length && availableHazards.length > 0) {
      // Draw hazard
      const hIdx = Math.floor(Math.random() * availableHazards.length);
      const hazard = availableHazards[hIdx];
      const newHazards = [...availableHazards];
      newHazards.splice(hIdx, 1);
      setDeck(d => ({ ...d, hazards: newHazards }));
      setCurrentCard({ ...hazard, isHazard: true });

      // Apply hazard points
      setPlayers(prev => prev.map((p, i) => {
        if (hazard.type === "santo") return i === currentPlayerIdx ? { ...p, score: p.score + HAZARD_SANTO_PTS } : p;
        else return i !== currentPlayerIdx ? { ...p, score: p.score + HAZARD_IDIOTA_PTS } : p;
      }));

      showToast(
        hazard.type === "santo"
          ? `⚡ SANTO! +${HAZARD_SANTO_PTS} pt a ${currentPlayer.name}`
          : `💀 IDIOTA! +${HAZARD_IDIOTA_PTS} pt a tutti gli avversari`,
        hazard.type === "santo" ? "success" : "danger"
      );
      setPhase("showing_result");
      setTimeout(() => { advanceTurn(); setPhase("idle"); setCurrentCard(null); }, 3000);
      return;
    }

    // Draw word
    const wIdx = Math.floor(Math.random() * availableWords.length);
    const word = availableWords[wIdx];
    setCurrentCard({ ...word, isHazard: false });
    setHintRevealed(false);
    setActiveJoker(null);
    setInputVal("");
    highlightWord(word);
    const hasJokers = currentPlayer.jokers.x2 > 0 || currentPlayer.jokers.x3 > 0 || currentPlayer.jokers.x4 > 0;
    if (hasJokers) {
      setPhase("joker_timer");
      startTimer(TIMER_JOKER, () => {
        setPhase("answer_timer");
        startTimer(TIMER_ANSWER, handleTimeUp);
      });
    } else {
      setPhase("answer_timer");
      startTimer(TIMER_ANSWER, handleTimeUp);
    }
    setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 100);
  };

  const handleTimeUp = () => {
    // Time up = wrong answer
    processWrongAnswer();
  };

  const skipToAnswer = () => {
    if (phase !== "joker_timer") return;
    clearTimer();
    setPhase("answer_timer");
    startTimer(TIMER_ANSWER, handleTimeUp);
  };

  const activateJoker = (type) => {
    if (phase !== "joker_timer") return;
    const cp = players[currentPlayerIdx];
    if (cp.jokers[type] <= 0) { showToast("Jolly esaurito!", "danger"); return; }
    if (activeJoker) { showToast("Hai già attivato un Jolly!", "danger"); return; }
    // If in fail-chain, no jokers
    if (failChain) { showToast("Nessun Jolly nelle catene di errore!", "danger"); return; }
    setActiveJoker(type);
    setPlayers(prev => prev.map((p, i) => {
      if (i !== currentPlayerIdx) return p;
      return { ...p, jokers: { ...p.jokers, [type]: p.jokers[type] - 1 } };
    }));
    showToast("Jolly " + type.toUpperCase() + " attivato!", "success");
    clearTimer();
    setPhase("answer_timer");
    startTimer(TIMER_ANSWER, handleTimeUp);
  };

  const submitAnswer = () => {
    if (phase !== "answer_timer") return;
    const answer = normalizeAnswer(inputVal);
    const correct = normalizeAnswer(currentCard.answer);

    if (answer === correct) {
      processCorrectAnswer();
    } else {
      processWrongAnswer();
    }
  };

  const processCorrectAnswer = () => {
    clearTimer();
    const word = currentCard;
    const basePoints = word.answer.length;
    const jokerMult = activeJoker ? JOKER_VALUES[activeJoker] : 1;
    const hintMult = (word.hint && !hintRevealed) ? 2 : 1;
    const total = basePoints * jokerMult * hintMult;

    setPlayers(prev => prev.map((p, i) =>
      i === currentPlayerIdx ? { ...p, score: p.score + total } : p
    ));

    // Reveal cells on grid
    const cells = getCellsForWord(word);
    const updatedGridMap = { ...gridMap };
    cells.forEach(({ r, c }, idx) => {
      const k = r + "," + c;
      updatedGridMap[k] = { ...updatedGridMap[k], letter: word.answer[idx], revealed: true };
    });
    setGridMap(updatedGridMap);

    // Remove from deck and check for any other words completed by intersections
    setDeck(d => {
      const updatedWords = d.words.map(w => {
        if (w.id === word.id) {
          return { ...w, inDeck: false };
        }
        if (w.inDeck) {
          const wCells = getCellsForWord(w);
          const isFullyRevealed = wCells.every(({ r, c }) => {
            const cell = updatedGridMap[r + "," + c];
            return cell && cell.revealed;
          });
          if (isFullyRevealed) {
            return { ...w, inDeck: false };
          }
        }
        return w;
      });
      return { ...d, words: updatedWords };
    });
    setHighlightedCells([]);
    setFailChain(null);

    const breakdown = basePoints + "pt base" + (jokerMult > 1 ? " x " + jokerMult + " Jolly" : "") + (hintMult > 1 ? " x 2 Hint" : "");
    showToast("Corretto! +" + total + "pt (" + breakdown + ")", "success");
    setPhase("idle");
    setCurrentCard(null);
    advanceTurn();

    // Check endgame
    setTimeout(() => {
      const allFilled = gameData.words.every(w => !deck.words.find(dw => dw.id === w.id)?.inDeck);
      if (allFilled) onEndGame(players);
    }, 500);
  };

  const processWrongAnswer = () => {
    clearTimer();
    const word = currentCard;

    // +5 to all opponents
    setPlayers(prev => prev.map((p, i) =>
      i !== currentPlayerIdx ? { ...p, score: p.score + WRONG_ANSWER_PTS } : p
    ));

    // Start or continue fail-chain
    if (!failChain) {
      const attemptedPlayers = [currentPlayerIdx];
      // Check if everyone has tried
      const totalPlayers = players.length;
      if (totalPlayers === 1) {
        // Solo: card returns to bag
        showToast("Sbagliato! La carta torna nel sacchetto.", "danger");
        setPhase("idle");
        setCurrentCard(null);
        setHighlightedCells([]);
        advanceTurn();
      } else {
        setFailChain({ wordId: word.id, attemptedPlayers });
        showToast("Sbagliato! +" + WRONG_ANSWER_PTS + "pt agli avversari.", "danger");
        
        // Passa direttamente al concorrente successivo, timer domanda, saltando l'hint ed il jolly
        const nextPlayerIdx = (currentPlayerIdx + 1) % players.length;
        setCurrentPlayerIdx(nextPlayerIdx);
        setHintRevealed(true);
        setActiveJoker(null);
        setInputVal("");
        setPhase("answer_timer");
        startTimer(TIMER_ANSWER, handleTimeUp);
        setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 100);
      }
    } else {
      const attempted = [...failChain.attemptedPlayers, currentPlayerIdx];
      if (attempted.length >= players.length - 1) {
        // Everyone tried, card back in bag
        showToast("Nessuno ha indovinato! La carta torna nel sacchetto.", "danger");
        setFailChain(null);
        setHighlightedCells([]);
        setPhase("idle");
        setCurrentCard(null);
        advanceTurn();
      } else {
        setFailChain({ ...failChain, attemptedPlayers: attempted });
        showToast("Sbagliato! +" + WRONG_ANSWER_PTS + "pt agli avversari.", "danger");
        
        // Passa direttamente al concorrente successivo, timer domanda, saltando l'hint ed il jolly
        const nextPlayerIdx = (currentPlayerIdx + 1) % players.length;
        setCurrentPlayerIdx(nextPlayerIdx);
        setHintRevealed(true);
        setActiveJoker(null);
        setInputVal("");
        setPhase("answer_timer");
        startTimer(TIMER_ANSWER, handleTimeUp);
        setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 100);
      }
    }
  };

  const advanceTurn = () => {
    setCurrentPlayerIdx(prev => (prev + 1) % players.length);
  };

  const remainingWords = deck.words.filter(w => w.inDeck).length;
  const totalWords = deck.words.length;
  const progress = ((totalWords - remainingWords) / totalWords) * 100;

  return (
    <div className="game-layout">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      {/* LEFT SIDEBAR - Players */}
      <aside className="sidebar-left">
        <div className="sidebar-title">Giocatori</div>
        {players.map((p, i) => (
          <div key={p.id} className={`player-card ${i === currentPlayerIdx ? "player-active" : ""}`}>
            <div className="player-header">
              <div className="player-avatar" style={{ background: p.color }}>{p.name[0]}</div>
              <div className="player-info">
                <div className="player-name">{p.name}</div>
                <div className="player-score">{p.score} pt</div>
              </div>
              {i === currentPlayerIdx && <div className="turn-arrow">▶</div>}
            </div>
            <div className="joker-row">
              {["x2","x3","x4"].map(j => (
                <div key={j} className={`joker-chip ${p.jokers[j] === 0 ? "joker-empty" : ""}`}>
                  <span className="joker-label">{j.toUpperCase()}</span>
                  <span className="joker-count">×{p.jokers[j]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="progress-section">
          <div className="progress-label">Parole rimanenti: {remainingWords}/{totalWords}</div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div>
        </div>
      </aside>

      {/* CENTER - Crossword Grid */}
      <main className="grid-area">
        <div className="crossword-wrapper" style={{ aspectRatio: gameData.meta.gridCols + "/" + gameData.meta.gridRows }}>
          <CrosswordGrid gridMap={gridMap} highlightedCells={highlightedCells} gameData={gameData} />
        </div>
      </main>

      {/* RIGHT SIDEBAR - Game Controls */}
      <aside className="sidebar-right">
        <div className="current-player-banner" style={{ background: players[currentPlayerIdx].color }}>
          Turno di {players[currentPlayerIdx].name}
          {failChain && <div className="fail-chain-badge">Catena errori</div>}
        </div>

        {phase === "idle" && (
          <button className="btn-draw" onClick={drawCard}>
            Estrai Definizione
          </button>
        )}

        {/* Card display */}
        {currentCard && !currentCard.isHazard && (
          <div className="card-display">
            <div className="card-header">
              <span className="card-num">#{currentCard.number}</span>
              <span className="card-dir">{currentCard.direction === "across" ? "→ Orizzontale" : "↓ Verticale"}</span>
              <span className="card-len">{currentCard.length} lettere</span>
            </div>
            {currentCard.hint && !hintRevealed ? (
              <div className="hint-area">
                <div className="hint-image-placeholder">
                  <img src={"/assets/" + currentCard.image.replace(/^\/public\/assets\//, "").replace(/^\/assets\//, "")} alt="Hint" onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }} />
                  <div className="hint-fallback" style={{ display:"none" }}>{"Hint: " + currentCard.image}</div>
                </div>
                <button className="btn-reveal" onClick={() => setHintRevealed(true)}>Rivela Testo</button>
              </div>
            ) : (
              <div className="card-clue">{currentCard.clue}</div>
            )}
          </div>
        )}

        {/* Timers */}
        {(phase === "joker_timer" || phase === "answer_timer") && (
          <div className="timer-area">
            <div className={`timer-ring ${timerVal <= 5 ? "timer-urgent" : ""}`}>
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6"/>
                <circle cx="40" cy="40" r="34" fill="none"
                  stroke={timerVal <= 5 ? "#E24B4A" : timerVal <= 15 ? "#EF9F27" : "#1D9E75"}
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - timerVal / (phase === "joker_timer" ? TIMER_JOKER : TIMER_ANSWER))}`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                />
                <text x="40" y="46" textAnchor="middle" fontSize="20" fontWeight="bold" fill="currentColor">{timerVal}</text>
              </svg>
            </div>
            <div className="timer-label">{phase === "joker_timer" ? "Fase Jolly" : "Tempo risposta"}</div>
          </div>
        )}

        {/* Joker buttons */}
        {phase === "joker_timer" && !failChain && (
          <div className="joker-buttons">
            <div className="joker-section-label">Attiva Jolly:</div>
            {["x2","x3","x4"].map(j => {
              const cp = players[currentPlayerIdx];
              return (
                <button
                  key={j}
                  className={`btn-joker ${activeJoker === j ? "joker-active" : ""} ${cp.jokers[j] === 0 ? "joker-disabled" : ""}`}
                  onClick={() => activateJoker(j)}
                  disabled={cp.jokers[j] === 0 || !!activeJoker}
                >
                  {j.toUpperCase()} <span className="joker-remain">({cp.jokers[j]} rim.)</span>
                </button>
              );
            })}
            <button className="btn-skip" onClick={skipToAnswer}>⏭ Salta fase Jolly</button>
          </div>
        )}

        {/* Answer input */}
        {phase === "answer_timer" && (
          <div className="answer-area">
            <input
              ref={inputRef}
              className="answer-input"
              placeholder="Digita la risposta..."
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitAnswer()}
            />
            <button className="btn-submit" onClick={submitAnswer}>✓ Conferma</button>
          </div>
        )}

        {/* Active joker indicator */}
        {activeJoker && phase === "answer_timer" && (
          <div className="active-joker-banner">
            🃏 Jolly {activeJoker.toUpperCase()} attivo!
            {currentCard?.hint && !hintRevealed && " + Bonus Hint ×2"}
          </div>
        )}
      </aside>

      {currentCard && currentCard.isHazard && (
        <div className="hazard-modal-overlay">
          <div className={"hazard-modal-content hazard-" + currentCard.type}>
            <img
              src={currentCard.type === "santo" ? "/assets/santo.svg" : "/assets/idiota.svg"}
              alt={currentCard.type}
              className="hazard-modal-img"
            />
            <div className="hazard-modal-text">
              {currentCard.type === "santo"
                ? "Santo! +" + HAZARD_SANTO_PTS + " pt a " + players[currentPlayerIdx].name
                : "Idiota! +" + HAZARD_IDIOTA_PTS + " pt a tutti gli avversari"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CROSSWORD GRID COMPONENT ─────────────────────────────────────────────────
function CrosswordGrid({ gridMap, highlightedCells, gameData }) {
  const { gridRows, gridCols } = gameData.meta;
  const highlightSet = new Set(highlightedCells);

  return (
    <div className="crossword-grid" style={{ gridTemplateColumns: "repeat(" + gridCols + ", 1fr)" }}>
      {Array.from({ length: gridRows }).map((_, r) =>
        Array.from({ length: gridCols }).map((_, c) => {
          const k = r + "," + c;
          const cell = gridMap[k];
          if (!cell) return null;
          const isHighlighted = highlightSet.has(k);

          if (cell.black) {
            return <div key={k} className="cell cell-black"></div>;
          }

          const classiCella = "cell cell-white" + (isHighlighted ? " cell-highlighted" : "") + (cell.revealed ? " cell-revealed" : "");

          return (
            <div key={k} className={classiCella}>
              {cell.numbers.length > 0 && (
                <span className="cell-number">{cell.numbers[0]}</span>
              )}
              <span className="cell-letter">{cell.revealed ? cell.letter : ""}</span>
            </div>
          );
        })
      )}
    </div>
  );
}

const schemiModuli = import.meta.glob(["../data/*.json", "!../data/indice.json"]);

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home"); // home | setup | game | end | editor
  const [schemaSelezionato, setSchemaSelezionato] = useState(elencoSchemi[0] ? elencoSchemi[0].id : "santi");
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameConfig, setGameConfig] = useState(null);
  const [finalPlayers, setFinalPlayers] = useState(null);

  useEffect(() => {
    setLoading(true);
    const schemaTrovato = elencoSchemi.find(function (s) { return s.id === schemaSelezionato; });
    const nomeFile = schemaTrovato ? schemaTrovato.file : "schema1";
    const percorso = "../data/" + nomeFile + ".json";
    const caricaSchema = schemiModuli[percorso];

    if (caricaSchema) {
      caricaSchema()
        .then(function (module) {
          setGameData(module.default);
          setLoading(false);
        })
        .catch(function (err) {
          console.error("Errore nel caricamento del tabellone:", err);
          setLoading(false);
        });
    } else {
      console.error("Tabellone non trovato:", percorso);
      setLoading(false);
    }
  }, [schemaSelezionato]);

  const handleGameStart = ({ numPlayers, names, teamsMode }) => {
    const players = names.map((name, i) => ({ id: i, name, color: COLORS[i], teamsMode }));
    setGameConfig({ players });
    setScreen("game");
  };

  const handleEndGame = (players) => {
    setFinalPlayers(players);
    setScreen("end");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#1a1a2e", color: "#f5c518" }}>
        <h3>Caricamento tabellone...</h3>
      </div>
    );
  }

  if (screen === "home") return <HomeScreen onStart={() => setScreen("setup")} />;
  if (screen === "setup") return (
    <SetupScreen
      onGameStart={handleGameStart}
      suApriEditor={() => setScreen("editor")}
      schemi={elencoSchemi}
      schemaSelezionato={schemaSelezionato}
      suCambiaSchema={setSchemaSelezionato}
    />
  );
  if (screen === "editor") return <Editor suChiudi={() => setScreen("setup")} />;
  if (screen === "game" && gameConfig && gameData) return <GameBoard players={gameConfig.players} onEndGame={handleEndGame} gameData={gameData} />;
  if (screen === "end" && finalPlayers) return <EndGameScreen players={finalPlayers} onRestart={() => setScreen("home")} />;
  return null;
}

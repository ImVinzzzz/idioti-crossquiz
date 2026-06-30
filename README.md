# Idioti Cross Quiz

Un gioco da tavolo digitale per 2–6 giocatori (o squadre) basato su un cruciverba a tema santi e cultura generale.

## Avvio rapido

```bash
npm install
npm run dev
```

Aprire `http://localhost:5173` nel browser. Condividere lo schermo via Zoom/Discord. Il Master gestisce tutto dall'interfaccia.

## Struttura del progetto

```
santi-idioti/
├── index.html                  # Entry point HTML (favicon, Google Fonts, FA6)
├── vite.config.js              # Configurazione Vite
├── package.json
├── public/
│   └── assets/                 # Immagini hint (rombo.jpg, delfino.jpg, ecc.) + favicon.png
└── src/
    ├── main.jsx                # Bootstrap React
    ├── App.jsx                 # App root + tutti i componenti e la logica
    ├── styles.css              # CSS globale
    └── data/
        └── gameData.json       # Dati della griglia, parole, definizioni
```

## Come aggiungere immagini hint

Inserire le immagini nella cartella `public/assets/`. Il nome del file corrisponde al campo `"image"` nel JSON (es. `rombo.jpg`). Se l'immagine non è presente, il gioco mostra un placeholder testuale con il nome del file.

## Come aggiungere una nuova griglia

1. Creare un nuovo oggetto JSON con la stessa struttura di `gameData.json`.
2. Modificare `App.jsx` riga 1: `import gameData from "./data/gameData.json"` → importare il nuovo file.
3. Oppure rendere il tutto dinamico: aggiungere un selettore di griglia nella schermata Setup.

### Struttura parola nel JSON

```json
{
  "id": 1,                         // ID univoco
  "number": 1,                     // Numero che appare nella casella
  "direction": "across",           // "across" = orizzontale, "down" = verticale
  "row": 0,                        // Riga iniziale (0-indexed)
  "col": 0,                        // Colonna iniziale (0-indexed)
  "length": 11,                    // Lunghezza in caratteri
  "answer": "ORIETTABERTI",        // Risposta (maiuscolo, no spazi)
  "clue": "Testo della definizione",
  "hint": false,                   // true = carta tipo F (immagine prima)
  "image": "orietta.jpg"           // Solo se hint: true. File in /public/assets/
}
```

### Celle nere

```json
"blackCells": [[riga, colonna], ...]
```

Le coordinate sono 0-indexed. La griglia si adatta automaticamente a qualsiasi dimensione specificata in `meta.gridRows` e `meta.gridCols`.

## Logica di punteggio

| Evento | Punti |
|--------|-------|
| Risposta esatta | Lunghezza parola × Jolly (×1/2/3/4) × Bonus Hint (×2 se immagine non rivelata) |
| Risposta sbagliata / Tempo scaduto | +5 pt a tutti gli avversari |
| Carta Santo (Hazard) | +50 pt al pescatore |
| Carta Idiota (Hazard) | +50 pt a tutti gli avversari |

## Personalizzazione palette

I colori dei giocatori sono definiti in `App.jsx`:
```js
const COLORS = ["#1D6FD3","#D85A30","#1D9E75","#884AB7","#BA7517","#A32D2D"];
```

## Aggiungere più griglie (futuro)

Per supportare più puzzle selezionabili, modificare `SetupScreen` aggiungendo un `<select>` con i nomi dei JSON disponibili, e importarli dinamicamente con `import()`.

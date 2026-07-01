import { useState, useEffect } from "react";

export default function Editor({ suChiudi }) {
  // Stati principali dell'editor
  const [nomeCruciverba, setNomeCruciverba] = useState("nuovo_schema");
  const [righe, setRighe] = useState(14);
  const [colonne, setColonne] = useState(13);
  const [definizioni, setDefinizioni] = useState([]);
  const [tabAttivo, setTabAttivo] = useState("across"); // across | down
  const [definizioneSelezionataId, setDefinizioneSelezionataId] = useState(null);
  const [hazardBonus, setHazardBonus] = useState("/public/assets/nuovo_schema/bonus.svg");
  const [hazardMalus, setHazardMalus] = useState("/public/assets/nuovo_schema/malus.svg");

  // Generatore di ID progressivi automatici
  const ottieniProssimoId = () => {
    if (definizioni.length === 0) {
      return 1;
    }
    const maxId = Math.max(...definizioni.map(function (d) { return d.id; }));
    return maxId + 1;
  };

  // Aggiungi una nuova definizione
  const aggiungiDefinizione = () => {
    const nuovoId = ottieniProssimoId();
    // Calcoliamo un numero predefinito per agevolare l'utente
    const definizioniStessaDirezione = definizioni.filter(function (d) {
      return d.direction === tabAttivo;
    });
    const prossimoNumero = definizioniStessaDirezione.length > 0 
      ? Math.max(...definizioniStessaDirezione.map(function (d) { return d.number; })) + 1
      : 1;

    const nuovaDef = {
      id: nuovoId,
      number: prossimoNumero,
      direction: tabAttivo,
      row: 0,
      col: 0,
      length: 5,
      answer: "",
      clue: "",
      hint: false,
      image: ""
    };

    const nuovaLista = [...definizioni, nuovaDef];
    setDefinizioni(nuovaLista);
    setDefinizioneSelezionataId(nuovoId);
  };

  // Rimuovi una definizione
  const rimuoviDefinizione = (idDaRimuovere) => {
    const nuovaLista = definizioni.filter(function (d) {
      return d.id !== idDaRimuovere;
    });
    setDefinizioni(nuovaLista);
    if (definizioneSelezionataId === idDaRimuovere) {
      setDefinizioneSelezionataId(null);
    }
  };

  // Modifica un campo di una definizione
  const modificaDefinizione = (idDef, campo, valore) => {
    const nuovaLista = definizioni.map(function (d) {
      if (d.id !== idDef) {
        return d;
      }
      
      const defModificata = { ...d };

      if (campo === "answer") {
        // La risposta deve essere in maiuscolo e senza spazi
        defModificata.answer = valore.toUpperCase().replace(/\s/g, "");
      } else if (campo === "number" || campo === "row" || campo === "col" || campo === "length") {
        const numValore = parseInt(valore, 10);
        defModificata[campo] = isNaN(numValore) ? 0 : numValore;
      } else {
        defModificata[campo] = valore;
      }

      // Ricalcolo dell'immagine se hint è true o se cambiano i campi correlati
      if (campo === "hint" || campo === "number" || campo === "direction") {
        const usaHint = campo === "hint" ? valore : defModificata.hint;
        const numDef = campo === "number" ? (parseInt(valore, 10) || 0) : defModificata.number;
        const dirDef = campo === "direction" ? valore : defModificata.direction;
        
        if (usaHint) {
          const cartella = nomeCruciverba ? nomeCruciverba : "default";
          const letteraDirezione = dirDef === "across" ? "o" : "v";
          defModificata.image = "/public/assets/" + cartella + "/" + letteraDirezione + "_" + numDef + ".jpg";
        } else {
          defModificata.image = "";
        }
      }

      return defModificata;
    });

    setDefinizioni(nuovaLista);
  };

  // Ricalcola i percorsi delle immagini per tutte le definizioni quando cambia il nome del cruciverba
  useEffect(() => {
    const cartella = nomeCruciverba ? nomeCruciverba : "default";
    setHazardBonus("/public/assets/" + cartella + "/bonus.svg");
    setHazardMalus("/public/assets/" + cartella + "/malus.svg");

    setDefinizioni(function (prev) {
      return prev.map(function (d) {
        if (d.hint) {
          const letteraDirezione = d.direction === "across" ? "o" : "v";
          return {
            ...d,
            image: "/public/assets/" + cartella + "/" + letteraDirezione + "_" + d.number + ".jpg"
          };
        }
        return d;
      });
    });
  }, [nomeCruciverba]);

  // Calcola le caselle bianche e nere per l'anteprima della griglia
  const ottieniMappaGriglia = () => {
    const mappa = {};
    
    // Inizializza tutte le celle come nere
    for (let r = 0; r < righe; r++) {
      for (let c = 0; c < colonne; c++) {
        mappa[r + "," + c] = {
          black: true,
          numbers: [],
          letter: "",
          highlighted: false
        };
      }
    }

    // Posiziona le parole
    definizioni.forEach(function (def) {
      const rigaInizio = def.row;
      const colInizio = def.col;
      const len = def.length;
      const dir = def.direction;
      const num = def.number;
      const risp = def.answer || "";
      const isSelected = def.id === definizioneSelezionataId;

      for (let i = 0; i < len; i++) {
        const r = dir === "across" ? rigaInizio : rigaInizio + i;
        const c = dir === "across" ? colInizio + i : colInizio;
        
        if (r >= 0 && r < righe && c >= 0 && c < colonne) {
          const chiave = r + "," + c;
          
          mappa[chiave].black = false;
          
          if (i === 0 && num) {
            if (!mappa[chiave].numbers.includes(num)) {
              mappa[chiave].numbers.push(num);
            }
          }

          if (risp && risp[i]) {
            mappa[chiave].letter = risp[i];
          }

          if (isSelected) {
            mappa[chiave].highlighted = true;
          }
        }
      }
    });

    return mappa;
  };

  const mappaGriglia = ottieniMappaGriglia();

  // Calcola il set finale delle caselle nere per il JSON
  const calcolaCaselleNereJSON = () => {
    const nere = [];
    for (let r = 0; r < righe; r++) {
      for (let c = 0; c < colonne; c++) {
        const cella = mappaGriglia[r + "," + c];
        if (cella && cella.black) {
          nere.push([r, c]);
        }
      }
    }
    return nere;
  };

  // Genera l'oggetto JSON finale del tabellone
  const generaJSON = () => {
    const schema = {
      meta: {
        title: "Cruciverba " + nomeCruciverba,
        gridRows: righe,
        gridCols: colonne,
        hazard_bonus: hazardBonus,
        hazard_malus: hazardMalus
      },
      blackCells: calcolaCaselleNereJSON(),
      words: definizioni.map(function (d) {
        const oggettoParola = {
          id: d.id,
          number: d.number,
          direction: d.direction,
          row: d.row,
          col: d.col,
          length: d.length,
          answer: d.answer,
          clue: d.clue,
          hint: d.hint
        };
        if (d.hint) {
          oggettoParola.image = d.image;
        }
        return oggettoParola;
      })
    };
    return schema;
  };

  const stringaJSON = JSON.stringify(generaJSON(), null, 2);

  // Copia negli appunti
  const copiaNegliAppunti = () => {
    navigator.clipboard.writeText(stringaJSON);
    alert("Codice JSON copiato negli appunti!");
  };

  // Scarica il file JSON
  const scaricaJSON = () => {
    const blob = new Blob([stringaJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "schema_" + nomeCruciverba + ".json";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Importa un file JSON esistente
  const gestisciImportazione = (evento) => {
    const file = evento.target.files[0];
    if (!file) {
      return;
    }
    
    const lettore = new FileReader();
    lettore.onload = function (e) {
      try {
        const schemaImportato = JSON.parse(e.target.result);
        
        if (schemaImportato.meta) {
          const titoloPuro = schemaImportato.meta.title ? schemaImportato.meta.title.replace("Cruciverba ", "") : "schema_importato";
          setNomeCruciverba(titoloPuro);
          setRighe(schemaImportato.meta.gridRows || 14);
          setColonne(schemaImportato.meta.gridCols || 13);
          setHazardBonus(schemaImportato.meta.hazard_bonus || "");
          setHazardMalus(schemaImportato.meta.hazard_malus || "");
        }
        
        if (Array.isArray(schemaImportato.words)) {
          const defs = schemaImportato.words.map(function (w) {
            return {
              id: w.id,
              number: w.number,
              direction: w.direction,
              row: w.row,
              col: w.col,
              length: w.length,
              answer: w.answer || "",
              clue: w.clue || "",
              hint: w.hint || false,
              image: w.image || ""
            };
          });
          setDefinizioni(defs);
        }
        
        alert("Schema importato con successo!");
      } catch (err) {
        alert("Errore durante la lettura del file JSON: " + err.message);
      }
    };
    lettore.readAsText(file);
  };

  // Filtra definizioni per tab attivo
  const definizioniFiltrate = definizioni.filter(function (d) {
    return d.direction === tabAttivo;
  });

  return (
    <div className="editor-schermata">
      <div className="editor-intestazione">
        <h2>🛠️ Generatore Tabelloni Cruciverba</h2>
        <button className="btn-chiudi-editor" onClick={suChiudi}>
          Torna alla Configurazione
        </button>
      </div>

      <div className="editor-layout">
        {/* COLONNA SINISTRA: Form di configurazione e Definizioni */}
        <div className="editor-colonna-form">
          <div className="editor-sezione-generale">
            <h3>Dati Generali</h3>
            <div className="editor-campi-generali">
              <div className="editor-campo">
                <label>Nome Cruciverba (Tema)</label>
                <input
                  type="text"
                  value={nomeCruciverba}
                  onChange={function (e) { setNomeCruciverba(e.target.value); }}
                  placeholder="Esempio: santi_idioti"
                />
              </div>
              <div className="editor-campo">
                <label>Righe Matrice</label>
                <input
                  type="number"
                  min="3"
                  max="30"
                  value={righe}
                  onChange={function (e) { setRighe(parseInt(e.target.value, 10) || 3); }}
                />
              </div>
              <div className="editor-campo">
                <label>Colonne Matrice</label>
                <input
                  type="number"
                  min="3"
                  max="30"
                  value={colonne}
                  onChange={function (e) { setColonne(parseInt(e.target.value, 10) || 3); }}
                />
              </div>
            </div>
            
            <div className="editor-campi-generali" style={{ marginTop: "12px", gridTemplateColumns: "1fr 1fr" }}>
              <div className="editor-campo">
                <label>Immagine Hazard Bonus</label>
                <input
                  type="text"
                  value={hazardBonus}
                  onChange={function (e) { setHazardBonus(e.target.value); }}
                  placeholder="/public/assets/default/bonus.svg"
                />
              </div>
              <div className="editor-campo">
                <label>Immagine Hazard Malus</label>
                <input
                  type="text"
                  value={hazardMalus}
                  onChange={function (e) { setHazardMalus(e.target.value); }}
                  placeholder="/public/assets/default/malus.svg"
                />
              </div>
            </div>
            
            <div className="editor-import-export-file">
              <label className="btn-importa-file">
                📁 Importa JSON esistente
                <input
                  type="file"
                  accept=".json"
                  onChange={gestisciImportazione}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          <div className="editor-sezione-definizioni">
            <h3>Definizioni</h3>
            
            <div className="editor-tabs">
              <button
                className={"editor-tab " + (tabAttivo === "across" ? "active" : "")}
                onClick={function () { setTabAttivo("across"); }}
              >
                Orizzontali (Across)
              </button>
              <button
                className={"editor-tab " + (tabAttivo === "down" ? "active" : "")}
                onClick={function () { setTabAttivo("down"); }}
              >
                Verticali (Down)
              </button>
            </div>

            <button className="btn-aggiungi-def" onClick={aggiungiDefinizione}>
              ➕ Aggiungi Definizione ({tabAttivo === "across" ? "Orizzontale" : "Verticale"})
            </button>

            <div className="editor-lista-definizioni">
              {definizioniFiltrate.length === 0 ? (
                <div className="editor-nessuna-def">
                  Nessuna definizione definita per questa direzione. Clicca per aggiungerne una.
                </div>
              ) : (
                definizioniFiltrate.map(function (def) {
                  const isSelected = def.id === definizioneSelezionataId;
                  return (
                    <div
                      key={def.id}
                      className={"editor-def-card " + (isSelected ? "selezionata" : "")}
                      onClick={function () { setDefinizioneSelezionataId(def.id); }}
                    >
                      <div className="editor-def-riga-alto">
                        <span className="editor-def-badge">ID: {def.id}</span>
                        <button
                          className="btn-rimuovi-def"
                          onClick={function (e) {
                            e.stopPropagation();
                            rimuoviDefinizione(def.id);
                          }}
                        >
                          Rimuovi
                        </button>
                      </div>

                      <div className="editor-def-campi-griglia">
                        <div className="editor-def-campo-piccolo">
                          <label>N° Casella</label>
                          <input
                            type="number"
                            min="1"
                            value={def.number}
                            onChange={function (e) { modificaDefinizione(def.id, "number", e.target.value); }}
                            onClick={function (e) { e.stopPropagation(); }}
                          />
                        </div>
                        <div className="editor-def-campo-piccolo">
                          <label>Riga (0-idx)</label>
                          <input
                            type="number"
                            min="0"
                            max={righe - 1}
                            value={def.row}
                            onChange={function (e) { modificaDefinizione(def.id, "row", e.target.value); }}
                            onClick={function (e) { e.stopPropagation(); }}
                          />
                        </div>
                        <div className="editor-def-campo-piccolo">
                          <label>Col (0-idx)</label>
                          <input
                            type="number"
                            min="0"
                            max={colonne - 1}
                            value={def.col}
                            onChange={function (e) { modificaDefinizione(def.id, "col", e.target.value); }}
                            onClick={function (e) { e.stopPropagation(); }}
                          />
                        </div>
                        <div className="editor-def-campo-piccolo">
                          <label>Lunghezza</label>
                          <input
                            type="number"
                            min="1"
                            value={def.length}
                            onChange={function (e) { modificaDefinizione(def.id, "length", e.target.value); }}
                            onClick={function (e) { e.stopPropagation(); }}
                          />
                        </div>
                      </div>

                      <div className="editor-def-campo-testo">
                        <label>Risposta (maiuscolo, senza spazi)</label>
                        <input
                          type="text"
                          value={def.answer}
                          onChange={function (e) { modificaDefinizione(def.id, "answer", e.target.value); }}
                          onClick={function (e) { e.stopPropagation(); }}
                          placeholder="ESEMPIO"
                        />
                      </div>

                      <div className="editor-def-campo-testo">
                        <label>Definizione (Clue)</label>
                        <textarea
                          rows="2"
                          value={def.clue}
                          onChange={function (e) { modificaDefinizione(def.id, "clue", e.target.value); }}
                          onClick={function (e) { e.stopPropagation(); }}
                          placeholder="Testo della definizione..."
                        />
                      </div>

                      <div className="editor-def-opzione-hint">
                        <label className="editor-def-checkbox-label" onClick={function (e) { e.stopPropagation(); }}>
                          <input
                            type="checkbox"
                            checked={def.hint}
                            onChange={function (e) { modificaDefinizione(def.id, "hint", e.target.checked); }}
                          />
                          <span>Usa immagine come suggerimento (Hint)</span>
                        </label>
                      </div>

                      {def.hint && (
                        <div className="editor-def-hint-path">
                          <strong>Percorso Immagine:</strong>
                          <span className="editor-percorso-codice">{def.image}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* COLONNA DESTRA: Anteprima griglia e JSON generato */}
        <div className="editor-colonna-anteprima">
          <div className="editor-sezione-anteprima">
            <h3>Anteprima Griglia</h3>
            <div className="editor-contenitore-griglia" style={{ aspectRatio: colonne + "/" + righe, height: "auto" }}>
              <div
                className="editor-griglia-visualizzazione"
                style={{ gridTemplateColumns: "repeat(" + colonne + ", 1fr)" }}
              >
                {Array.from({ length: righe }).map(function (_, r) {
                  return Array.from({ length: colonne }).map(function (_, c) {
                    const chiave = r + "," + c;
                    const cella = mappaGriglia[chiave];
                    if (!cella) {
                      return null;
                    }

                    if (cella.black) {
                      return <div key={chiave} className="editor-cella editor-cella-nera"></div>;
                    }

                    return (
                      <div
                        key={chiave}
                        className={"editor-cella editor-cella-bianca " + (cella.highlighted ? "evidenziata" : "")}
                      >
                        {cella.numbers.length > 0 && (
                          <span className="editor-cella-numero">{cella.numbers[0]}</span>
                        )}
                        <span className="editor-cella-lettera">{cella.letter}</span>
                      </div>
                    );
                  });
                })}
              </div>
            </div>
            <div className="editor-legenda">
              <span className="legenda-item"><span className="blocco-legenda nera"></span> Casella Nera</span>
              <span className="legenda-item"><span className="blocco-legenda bianca"></span> Casella Bianca</span>
              <span className="legenda-item"><span className="blocco-legenda evidenziata"></span> Definizione Selezionata</span>
            </div>
          </div>

          <div className="editor-sezione-json">
            <div className="editor-json-intestazione">
              <h3>JSON Generato</h3>
              <div className="editor-json-azioni">
                <button onClick={copiaNegliAppunti}>📋 Copia</button>
                <button onClick={scaricaJSON}>💾 Scarica</button>
              </div>
            </div>
            <textarea
              className="editor-textarea-json"
              readOnly
              value={stringaJSON}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

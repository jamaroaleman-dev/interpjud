// Módulos individuales de los 10 criterios del examen oral: práctica + evaluación.
import { GUIAS, QUIZ, PASAJES, ORALES, MODO, ICONOS, FALSOS_AMIGOS, PARES_PRON } from "./criterios.js";
import { GLOSARIO, MODISMOS } from "./content.js";
import { CRITERIOS, evaluateCriterion, generateCriterionSet } from "./ai.js";
import { makeItem, checkItem, termMatch } from "./drills.js";
import * as A from "./audio.js";

let C; // contexto de app.js
let CRIT_HIST, CRIT_SETS;

const rnd = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = rnd(i + 1); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const first = (s) => s.split("|")[0];
const name = (k) => CRITERIOS.find(([x]) => x === k)[1];
const desc = (k) => CRITERIOS.find(([x]) => x === k)[2];
const dirLabel = (d) => (d === "en" ? "Inglés → español" : d === "es" ? "Español → inglés" : "Ambas direcciones");
const pickDir = (dir, i) => (dir === "mix" ? (i % 2 ? "es" : "en") : dir);
const n100 = (n5) => (n5 == null ? null : Math.round(n5 * 20));

export function initModulos(ctx) {
  C = ctx;
  CRIT_HIST = C.LS.get("crit", []);
  CRIT_SETS = C.LS.get("critsets", {});
  C.routes.criterios = listPage;
  C.routes.crit = critPage;
}

function saveCritHist() { CRIT_HIST = CRIT_HIST.slice(-400); C.LS.set("crit", CRIT_HIST); }
function lastOf(k) { const h = CRIT_HIST.filter((x) => x.criterio === k && x.nota100 != null); return h[h.length - 1] || null; }
function bestOf(k) { const h = CRIT_HIST.filter((x) => x.criterio === k && x.nota100 != null); return h.length ? Math.max(...h.map((x) => x.nota100)) : null; }

// ---------- Evaluaciones de criterio pendientes (sin internet) ----------
export function critPendingCount() { return (CRIT_HIST || []).filter((x) => x.pending).length; }
function finalizeCrit(rec, ev) {
  rec.oral5 = ev.nota;
  rec.comentario = ev.comentario || "";
  rec.consejos = ev.consejos || [];
  const q5 = rec.quizPct != null ? rec.quizPct / 20 : null;
  const n5 = q5 != null ? q5 * 0.4 + ev.nota * 0.6 : ev.nota;
  rec.nota5 = +n5.toFixed(2);
  rec.nota100 = n100(n5);
  rec.pending = false;
  delete rec.items;
}
export async function processCritPending() {
  let ok = 0;
  for (const rec of CRIT_HIST.filter((x) => x.pending)) {
    if (!navigator.onLine) break;
    try { finalizeCrit(rec, await evaluateCriterion({ settings: C.S, criterio: rec.criterio, items: rec.items })); ok++; saveCritHist(); }
    catch (e) { if (e.offline) break; rec.pending = false; rec.error = e.message; saveCritHist(); }
  }
  return ok;
}

export function critSummaryHTML() {
  if (!CRIT_HIST?.length) return "";
  return `<div class="card"><h2>Módulos por criterio (última evaluación)</h2>${CRITERIOS.map(([k, nm]) => {
    const l = lastOf(k);
    if (!l) return `<div class="crit"><span class="n">${nm}</span><span class="v muted">—</span><div class="bar"><i style="width:0"></i></div></div>`;
    const cls = l.nota100 >= 90 ? "good" : l.nota100 >= 80 ? "warn" : "bad";
    return `<div class="crit"><span class="n">${nm}</span><span class="v" style="color:var(--${cls})">${l.nota100}</span><div class="bar"><i style="width:${l.nota100}%;background:var(--${cls})"></i></div></div>`;
  }).join("")}</div>`;
}

// ====================== Lista ======================
function listPage() {
  C.setTitle("Los 10 criterios");
  C.view.innerHTML = `
    <div class="card"><p class="muted small" style="margin:0">Cada criterio del examen oral (Bases, art. 6.2) tiene su <b>práctica</b> (guía, referencia, quiz con corrección inmediata y ejercicios hablados) y su <b>evaluación</b> (prueba con nota de 0 a 100 solo en ese criterio), en inglés → español y español → inglés.</p></div>
    <div class="list">
      ${CRITERIOS.map(([k, nm], i) => {
        const l = lastOf(k), b = bestOf(k);
        return `<button class="item" data-k="${k}"><span style="font-size:24px">${ICONOS[k]}</span><div class="grow"><div class="t">${i + 1}. ${nm}</div><div class="d">${C.esc(desc(k))}</div></div>${l ? `<span class="pill ${C.scoreClass(l.nota100)}" title="Mejor: ${b}">${l.nota100}</span>` : `<span class="pill">nuevo</span>`}</button>`;
      }).join("")}
    </div>`;
  C.view.querySelectorAll(".item[data-k]").forEach((b) => (b.onclick = () => C.go("#crit/" + b.dataset.k)));
}

// ====================== Página de un criterio ======================
function critPage(arg) {
  const [k, tab = "practica"] = (arg || "").split(":");
  if (!MODO[k]) return C.go("#criterios");
  const m = MODO[k];
  C.setTitle(name(k));
  const dir = C.S.critDir || "mix";
  const hist = CRIT_HIST.filter((x) => x.criterio === k).slice(-8).reverse();
  const gen = CRIT_SETS[k] || {};
  const nGen = (gen.quiz?.length || 0) + (gen.orales?.length || 0) + (gen.pasajes?.length || 0);
  C.view.innerHTML = `
    <div class="card">
      <div class="row"><span style="font-size:30px">${ICONOS[k]}</span><div class="grow" style="flex:1"><h2 style="margin:0">${name(k)}</h2><div class="muted small">${C.esc(desc(k))}</div></div></div>
      <label class="f"><span>Dirección</span><select id="cDir">${["mix", "en", "es"].map((d) => `<option value="${d}" ${d === dir ? "selected" : ""}>${dirLabel(d)}</option>`).join("")}</select></label>
      <div class="row" style="gap:6px">
        <button class="btn ${tab === "practica" ? "primary" : ""}" id="tPr" style="flex:1">🏋️ Práctica</button>
        <button class="btn ${tab === "evaluacion" ? "primary" : ""}" id="tEv" style="flex:1">📝 Evaluación</button>
      </div>
    </div>
    <div id="cBody"></div>`;
  C.$("#cDir").onchange = (e) => { C.S.critDir = e.target.value; C.saveSettings(); };
  C.$("#tPr").onclick = () => C.go(`#crit/${k}:practica`);
  C.$("#tEv").onclick = () => C.go(`#crit/${k}:evaluacion`);
  const body = C.$("#cBody");
  if (tab === "practica") {
    body.innerHTML = `
      <div class="card"><h2>Guía rápida</h2><ul style="margin:0;padding-left:20px">${GUIAS[k].map((g) => `<li style="margin:4px 0">${C.esc(g)}</li>`).join("")}</ul></div>
      ${referenciaHTML(k)}
      <div class="card"><h2>Ejercicios de práctica</h2><p class="muted small" style="margin-top:0">Con corrección inmediata después de cada respuesta.</p>
        <div class="grid2">
          ${m.quiz ? `<button class="btn block" id="pQuiz">${m.quiz === "pasajes" ? "👂 Escuchar y responder" : "☑️ Quiz de selección múltiple"}</button>` : ""}
          ${m.oral ? `<button class="btn block" id="pOral">${{ interp: "🎙️ Interpretar frases", shadow: "👄 Repetir frases (pronunciación)", numeros: "🔢 Cifras habladas", terminos: "⚖️ Términos hablados" }[m.oral]}</button>` : ""}
        </div>
        ${m.quiz === "propio" || m.quiz === "pasajes" || m.oral === "interp" ? `<button class="btn sm ghost" id="pGen" style="margin-top:10px" ${C.S.apiKey ? "" : "disabled"}>✨ Generar material nuevo con Claude</button> <span class="muted small" id="pGenOut">${nGen ? `${nGen} ítems generados guardados` : ""}</span>` : ""}
      </div>`;
    const q = C.$("#pQuiz"); if (q) q.onclick = () => runQuiz(k, C.S.critDir || "mix", false);
    const o = C.$("#pOral"); if (o) o.onclick = () => runOral(k, C.S.critDir || "mix", false);
    const g = C.$("#pGen"); if (g) g.onclick = () => genMore(k);
    body.querySelectorAll("[data-say]").forEach((b) => (b.onclick = () => { A.stopSpeaking(); A.speak(b.dataset.say, b.dataset.lang, { rate: C.rateOf(b.dataset.lang), voiceName: C.voiceOf(b.dataset.lang) }); }));
  } else {
    const parts = [];
    if (m.quiz) parts.push(m.quiz === "pasajes" ? "2 pasajes auditivos con 4 preguntas cada uno" : "10 preguntas de selección múltiple");
    if (m.oral) parts.push({ interp: "5 frases para interpretar en voz alta (evaluadas por Claude)", shadow: "8 frases para repetir (pronunciación medida por reconocimiento de voz)", numeros: "8 frases con cifras, fechas y nombres", terminos: "12 términos hablados" }[m.oral]);
    body.innerHTML = `
      <div class="card"><h2>Evaluación: ${name(k)}</h2>
        <p class="muted small">Contenido: ${parts.join(" + ")}. Sin corrección hasta el final, como en el examen. Nota final de 0 a 100 en este criterio${m.quiz && m.oral ? " (40% parte escrita, 60% parte oral)" : ""}.</p>
        ${m.oral === "interp" && !C.S.apiKey ? `<div class="note">La parte oral necesita tu API key para ser evaluada (<a href="#ajustes">Ajustes</a>).</div>` : ""}
        <button class="btn primary block" id="eGo">▶ Empezar evaluación (${dirLabel(C.S.critDir || "mix").toLowerCase()})</button>
      </div>
      <div class="card"><h2>Historial de este criterio</h2>
        ${hist.length ? `<div class="list">${hist.map((h) => `<div class="item" style="cursor:default"><div class="grow"><div class="t">${h.pending ? "⏳ Pendiente de evaluar (se hará al tener internet)" : h.nota100 == null ? `Sin nota${h.error ? `: ${C.esc(h.error)}` : ""}` : `${h.nota100}/100`} · ${dirLabel(h.dir)}</div><div class="d">${new Date(h.date).toLocaleString("es-DO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}${h.quizPct != null ? ` · escrito ${h.quizPct}%` : ""}${h.oral5 != null ? ` · oral ${h.oral5}/5` : ""}</div></div><span class="pill ${h.pending ? "warn" : C.scoreClass(h.nota100)}">${h.pending ? "⏳" : h.nota100 ?? "—"}</span></div>`).join("")}</div>` : `<p class="muted">Aún no has hecho esta evaluación.</p>`}
      </div>`;
    C.$("#eGo").onclick = () => runEvaluation(k, C.S.critDir || "mix");
  }
}

function referenciaHTML(k) {
  const tbl = (head, rows) => `<div class="tablewrap"><table class="e"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table></div>`;
  const say = (t, l) => `<button class="btn sm ghost" data-say="${C.esc(t)}" data-lang="${l}" title="Escuchar">🔊</button>`;
  if (k === "interferencias") return `<details class="card"><summary>Falsos amigos y calcos (${FALSOS_AMIGOS.length})</summary>${tbl(["Inglés", "Correcto", "Trampa"], FALSOS_AMIGOS.map(([a, b, c]) => [C.esc(a), `<b>${C.esc(b)}</b>`, `<span class="muted">${C.esc(c)}</span>`]))}</details>`;
  if (k === "pronunciacion") return `<details class="card" open><summary>Sonidos clave (toca 🔊 para escuchar)</summary><h3>Inglés</h3>${tbl(["Palabras", "Qué cuidar", ""], PARES_PRON.en.map(([a, b]) => [`<b>${C.esc(a)}</b>`, C.esc(b), say(a.replaceAll("/", ","), "en")]))}<h3>Español</h3>${tbl(["Palabras", "Qué cuidar", ""], PARES_PRON.es.map(([a, b]) => [`<b>${C.esc(a)}</b>`, C.esc(b), say(a.replaceAll("/", ","), "es")]))}</details>`;
  if (k === "terminologia_juridica") return `<details class="card"><summary>Glosario (${GLOSARIO.length} términos)</summary>${tbl(["Inglés", "Español", ""], GLOSARIO.map(([en, es, cat]) => [C.esc(en.replaceAll("|", " / ")), C.esc(es.replaceAll("|", " / ")), `<span class="pill">${cat}</span>`]))}<p class="small"><a href="#terminos">Ir a las tarjetas habladas completas →</a></p></details>`;
  if (k === "modismos_expresiones") return `<details class="card"><summary>Modismos y expresiones (${MODISMOS.length})</summary>${tbl(["Expresión", "Equivalente", ""], MODISMOS.map(([a, b, cat]) => [`<b>${C.esc(a.replaceAll("|", " / "))}</b>`, C.esc(b.replaceAll("|", " / ")), `<span class="pill">${cat}</span>`]))}</details>`;
  if (k === "numeros_nombres_fechas") return `<div class="card"><h2>Drill rápido</h2><p class="muted small" style="margin-top:0">Rondas de 10–20 frases con corrección automática de cada cifra, mes y apellido.</p><a class="btn block" href="#numeros">🔢 Ir al drill de números</a></div>`;
  if (k === "fluidez") return `<div class="card"><h2>Metas medibles</h2>${tbl(["Métrica", "Meta"], [["Inicio tras el original (consecutiva)", "< 2 s"], ["Ritmo", "110–150 palabras/min"], ["Pausas > 1 s por intervención", "0–2"], ["Pausa más larga", "< 2 s"], ["Muletillas", "0"]])}<p class="muted small">El app mide todo esto en cada ejercicio hablado.</p></div>`;
  return "";
}

async function genMore(k) {
  const out = C.$("#pGenOut"), b = C.$("#pGen");
  if (!navigator.onLine) { out.textContent = "Necesitas internet para generar material nuevo."; return; }
  b.disabled = true;
  out.textContent = "Generando…";
  try {
    const dir = C.S.critDir || "mix";
    const lang = dir === "mix" ? (Math.random() < 0.5 ? "en" : "es") : dir;
    const r = await generateCriterionSet({ settings: C.S, criterio: k, lang, onProgress: (n) => (out.textContent = `Generando… ${n} caracteres`) });
    const set = (CRIT_SETS[k] ||= { quiz: [], orales: [], pasajes: [] });
    if (k === "comprension") set.pasajes.push({ lang, titulo: r.titulo, texto: r.texto, preguntas: r.preguntas.map((p) => ({ q: p.pregunta, o: p.opciones, c: p.correcta })) });
    else {
      for (const q of r.quiz || []) if (q.opciones?.length >= 2) set.quiz.push({ d: lang, q: q.pregunta, o: q.opciones, c: Math.max(0, Math.min(q.opciones.length - 1, q.correcta)), e: q.explicacion, ia: true });
      for (const o of r.orales || []) set.orales.push({ lang, t: o.texto, ia: true });
    }
    for (const key of ["quiz", "orales", "pasajes"]) set[key] = set[key].slice(-80);
    C.LS.set("critsets", CRIT_SETS);
    out.textContent = `✓ Material nuevo listo (${dirLabel(lang).toLowerCase()}). Ya está mezclado en la práctica y la evaluación.`;
  } catch (e) { out.textContent = e.message; }
  b.disabled = false;
}

// ====================== Bancos de preguntas ======================
function autoQuiz(source, lang, n) {
  // source: "glosario" | "modismos"
  const rows = source === "glosario" ? GLOSARIO.map(([en, es, cat]) => ({ en, es, cat })) : MODISMOS.map(([a, b, cat]) => (cat === "Dominicano" ? { es: a, en: b, cat } : { en: a, es: b, cat }));
  const out = [];
  const pool = shuffle(rows.filter((r) => source === "glosario" || (lang === "en" ? r.cat !== "Dominicano" : r.cat === "Dominicano") || true));
  for (const r of pool) {
    if (out.length >= n) break;
    const from = source === "modismos" ? (r.cat === "Dominicano" ? "es" : "en") : lang;
    if (source === "modismos" && lang !== "mix" && from !== lang) continue;
    const to = from === "en" ? "es" : "en";
    const correct = first(r[to]);
    const same = rows.filter((x) => x !== r && x.cat === r.cat && first(x[to]) !== correct);
    const others = shuffle(same.length >= 3 ? same : rows.filter((x) => x !== r)).slice(0, 3).map((x) => first(x[to]));
    const opts = shuffle([correct, ...others]);
    out.push({ d: from, q: `¿Cuál es el mejor equivalente de «${first(r[from])}»${source === "modismos" ? " (por su sentido)" : ""}?`, o: opts, c: opts.indexOf(correct), e: `«${r[from].replaceAll("|", " / ")}» = ${r[to].replaceAll("|", " / ")}.` });
  }
  return out;
}

function quizPool(k, dir, n) {
  const m = MODO[k];
  const gen = CRIT_SETS[k]?.quiz || [];
  let pool;
  if (m.quiz === "glosario") pool = [...autoQuiz("glosario", dir === "mix" ? "en" : dir, n), ...autoQuiz("glosario", dir === "mix" ? "es" : dir, n), ...(QUIZ[k] || []), ...(QUIZ[k] || []), ...gen];
  else if (m.quiz === "modismos") pool = [...autoQuiz("modismos", dir, n * 2), ...(QUIZ[k] || []), ...(QUIZ[k] || []), ...gen];
  else pool = [...(QUIZ[k] || []), ...gen];
  if (dir !== "mix") pool = pool.filter((q) => q.d === dir);
  // mezclar opciones
  const seen = new Set();
  pool = shuffle(pool).filter((q) => (seen.has(q.q) ? false : seen.add(q.q)));
  return pool.slice(0, n).map((q) => {
    const idx = shuffle(q.o.map((_, i) => i));
    return { ...q, o: idx.map((i) => q.o[i]), c: idx.indexOf(q.c) };
  });
}

function pasajePool(dir, n) {
  let p = [...PASAJES, ...(CRIT_SETS.comprension?.pasajes || [])];
  if (dir !== "mix") p = p.filter((x) => x.lang === dir);
  return shuffle(p).slice(0, n);
}

function oralPool(k, dir, n) {
  let p = [...(ORALES[k] || []), ...(CRIT_SETS[k]?.orales || [])];
  if (k === "pronunciacion") {
    // En pronunciación se repite en el idioma de DESTINO.
    if (dir !== "mix") p = p.filter((x) => x.lang === (dir === "en" ? "es" : "en"));
  } else if (dir !== "mix") p = p.filter((x) => x.lang === dir);
  p = shuffle(p);
  if (dir === "mix") { const en = p.filter((x) => x.lang === "en"), es = p.filter((x) => x.lang === "es"); p = []; while (en.length || es.length) { if (en.length) p.push(en.shift()); if (es.length) p.push(es.shift()); } }
  return p.slice(0, n);
}

// ====================== Quiz ======================
async function runQuiz(k, dir, exam, onDone) {
  const m = MODO[k];
  if (m.quiz === "pasajes") return runListening(k, dir, exam, onDone);
  const qs = quizPool(k, dir, exam ? 10 : 8);
  if (!qs.length) { C.toast("No hay preguntas para esa dirección todavía. Genera material nuevo con Claude."); return onDone?.(null); }
  const answers = [];
  for (let i = 0; i < qs.length; i++) {
    const q = qs[i];
    const choice = await askQuestion(q, i, qs.length, exam, `${name(k)} · ${exam ? "Evaluación" : "Práctica"}`);
    if (choice === "quit") return onDone ? onDone(null) : C.go(`#crit/${k}`);
    answers.push(choice);
  }
  const ok = answers.filter((a, i) => a === qs[i].c).length;
  const pct = Math.round((ok / qs.length) * 100);
  const review = qs.map((q, i) => ({ q, a: answers[i] }));
  if (onDone) return onDone({ pct, review });
  C.logDaily("criterios");
  showQuizReview(k, pct, review, false);
}

function askQuestion(q, i, total, exam, head, extraHTML = "") {
  return new Promise((resolve) => {
    C.view.innerHTML = `
      <div class="card">
        <div class="row" style="justify-content:space-between"><span class="pill">${C.esc(head)}</span><span class="pill">${i + 1}/${total}</span></div>
        ${extraHTML}
        <div class="row" style="margin-top:12px">${q.d ? `<span class="pill ${q.d}">${q.d === "en" ? "EN → ES" : "ES → EN"}</span>` : ""}</div>
        <p style="font-size:17px;font-weight:600;margin:10px 0 14px">${C.esc(q.q)}</p>
        <div class="list" id="qOpts">${q.o.map((o, j) => `<button class="item" data-j="${j}"><span class="pill">${"ABCD"[j] || j + 1}</span><div class="grow">${C.esc(o)}</div></button>`).join("")}</div>
        <div id="qFb"></div>
        <div class="row" style="justify-content:space-between;margin-top:12px"><button class="btn sm ghost" id="qQuit">✕ Salir</button><span></span></div>
      </div>`;
    C.$("#qQuit").onclick = () => resolve("quit");
    C.view.querySelectorAll("#qOpts .item").forEach((b) => (b.onclick = () => {
      const j = +b.dataset.j;
      if (exam) return resolve(j);
      C.view.querySelectorAll("#qOpts .item").forEach((x) => {
        x.disabled = true;
        const jj = +x.dataset.j;
        if (jj === q.c) x.style.borderColor = "var(--good)", x.style.background = "var(--good-soft)";
        else if (jj === j) x.style.borderColor = "var(--bad)", x.style.background = "var(--bad-soft)";
      });
      C.$("#qFb").innerHTML = `<div class="${j === q.c ? "ok" : "err"}">${j === q.c ? "✓ Correcto." : "✗ Incorrecto."} ${C.esc(q.e || "")}</div><button class="btn primary block" id="qNext">Siguiente ▶</button>`;
      C.$("#qNext").onclick = () => resolve(j);
    }));
  });
}

function showQuizReview(k, pct, review, exam) {
  C.setTitle("Resultado");
  C.view.innerHTML = `
    <div class="card" style="text-align:center"><div class="big-score" style="color:var(--${pct >= 90 ? "good" : pct >= 75 ? "warn" : "bad"})">${pct}%</div><p class="muted">${name(k)} · quiz de práctica</p>
      <div class="row" style="justify-content:center"><button class="btn primary" id="again">↺ Otro quiz</button><button class="btn" onclick="location.hash='#crit/${k}'">Volver al criterio</button></div></div>
    ${reviewHTML(review)}`;
  C.$("#again").onclick = () => runQuiz(k, C.S.critDir || "mix", false);
}

function reviewHTML(review) {
  const bad = review.filter((r) => r.a !== r.q.c);
  if (!bad.length) return `<div class="card"><div class="ok">¡Todas correctas!</div></div>`;
  return `<div class="card"><h2>Repasa</h2>${bad.map((r) => `<div class="src small" style="margin-bottom:8px"><b>${C.esc(r.q.q)}</b><br><span style="color:var(--bad)">✗ ${C.esc(r.q.o[r.a] ?? "(sin respuesta)")}</span><br><span style="color:var(--good)">✓ ${C.esc(r.q.o[r.q.c])}</span>${r.q.e ? `<br><span class="muted">${C.esc(r.q.e)}</span>` : ""}</div>`).join("")}</div>`;
}

// Comprensión auditiva: escuchar pasaje (sin texto) y responder.
async function runListening(k, dir, exam, onDone) {
  const ps = pasajePool(dir, exam ? 2 : 1);
  if (!ps.length) { C.toast("No hay pasajes para esa dirección. Genera uno con Claude."); return onDone?.(null); }
  const review = [];
  for (let pi = 0; pi < ps.length; pi++) {
    const p = ps[pi];
    // Pantalla de escucha
    const go = await new Promise((resolve) => {
      C.view.innerHTML = `
        <div class="card stage">
          <div class="who">${C.esc(name(k))} · Pasaje ${pi + 1}/${ps.length}</div>
          <div class="dir"><span class="pill ${p.lang}">${p.lang === "en" ? "Audio en inglés" : "Audio en español"}</span></div>
          <div class="state" id="lState">Escucha con atención. Puedes tomar notas en papel.</div>
          <div class="controls"><button class="btn primary" id="lPlay">🔊 Reproducir</button><button class="btn ghost" id="lQuit">✕ Salir</button></div>
          <p class="muted small">${exam ? "En la evaluación el audio se escucha una sola vez." : "En práctica puedes repetirlo una vez."}</p>
        </div>`;
      let plays = 0;
      C.$("#lQuit").onclick = () => { A.stopSpeaking(); resolve(false); };
      C.$("#lPlay").onclick = async () => {
        C.primeAudio();
        plays++;
        C.$("#lPlay").disabled = true;
        C.$("#lState").textContent = "🔊 Reproduciendo…";
        for (const s of A.splitSentences(p.texto)) await A.speak(s, p.lang, { rate: C.rateOf(p.lang), voiceName: C.voiceOf(p.lang) });
        C.$("#lState").textContent = "Listo.";
        const ctl = C.$("#lPlay").parentElement;
        ctl.innerHTML = `${!exam && plays < 2 ? `<button class="btn" id="lRe">↺ Repetir audio</button>` : ""}<button class="btn primary" id="lGo">Responder preguntas ▶</button>`;
        const re = C.$("#lRe"); if (re) re.onclick = () => { ctl.innerHTML = `<button class="btn primary" id="lPlay">🔊</button>`; C.$("#lPlay").onclick = null; plays++; (async () => { C.$("#lState").textContent = "🔊 Reproduciendo…"; for (const s of A.splitSentences(p.texto)) await A.speak(s, p.lang, { rate: C.rateOf(p.lang), voiceName: C.voiceOf(p.lang) }); ctl.innerHTML = `<button class="btn primary" id="lGo">Responder preguntas ▶</button>`; C.$("#lGo").onclick = () => resolve(true); })(); };
        C.$("#lGo").onclick = () => resolve(true);
      };
    });
    if (!go) return onDone ? onDone(null) : C.go(`#crit/${k}`);
    for (let i = 0; i < p.preguntas.length; i++) {
      const q0 = p.preguntas[i];
      const idx = shuffle(q0.o.map((_, j) => j));
      const q = { q: q0.q, o: idx.map((j) => q0.o[j]), c: idx.indexOf(q0.c), e: "" };
      const a = await askQuestion(q, i, p.preguntas.length, exam, `${p.titulo}`);
      if (a === "quit") return onDone ? onDone(null) : C.go(`#crit/${k}`);
      review.push({ q, a, texto: p.texto });
    }
  }
  const ok = review.filter((r) => r.a === r.q.c).length;
  const pct = Math.round((ok / review.length) * 100);
  if (onDone) return onDone({ pct, review });
  C.logDaily("criterios");
  showQuizReview(k, pct, review, false);
  C.view.insertAdjacentHTML("beforeend", `<details class="card"><summary>Ver el texto del pasaje</summary>${ps.map((p) => `<div class="src" style="margin-top:8px">${C.esc(p.texto)}</div>`).join("")}</details>`);
}

// ====================== Orales ======================
function stageUI() {
  return {
    state: (t) => (C.$("#sState").innerHTML = t), ctl: (h) => (C.$("#sCtl").innerHTML = h),
    live: (t) => { const l = C.$("#sLive"); if (!l) return; l.style.display = t == null ? "none" : "block"; l.textContent = t || "…"; },
    meter: (v) => { const m = C.$("#sMeter"); if (m) m.style.width = `${v * 100}%`; }, src: (h) => (C.$("#sSrc").innerHTML = h),
    who: (t) => (C.$("#sWho").innerHTML = t), prog: (t) => (C.$("#sProg").textContent = t), part: (t) => (C.$("#sPart").textContent = t),
    dir: (from, same) => (C.$("#sDir").innerHTML = same ? `<span class="pill ${from}">Repite en ${from === "es" ? "español" : "inglés"}</span>` : `<span class="pill ${from}">${from.toUpperCase()}</span> → <span class="pill ${C.other(from)}">${C.other(from).toUpperCase()}</span>`)
  };
}

const normW = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ'\s]/g, " ").split(/\s+/).filter(Boolean);
function wordDiff(expected, got) {
  const a = normW(expected), b = normW(got);
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const hit = new Array(a.length).fill(false);
  let i = 0, j = 0;
  while (i < a.length && j < b.length) { if (a[i] === b[j]) { hit[i] = true; i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++; }
  const acc = a.length ? dp[0][0] / a.length : 0;
  const words = expected.split(/\s+/);
  // Mapear aciertos a palabras originales (misma tokenización aproximada)
  let wi = 0;
  const html = words.map((w) => { const n = normW(w); if (!n.length) return C.esc(w); const okw = n.every(() => hit[wi++]); return okw ? C.esc(w) : `<b style="color:var(--bad);text-decoration:underline">${C.esc(w)}</b>`; }).join(" ");
  return { acc, html };
}
function pronNota(acc, conf) {
  let n = acc >= 0.97 ? 5 : acc >= 0.92 ? 4 : acc >= 0.85 ? 3 : acc >= 0.75 ? 2 : acc >= 0.6 ? 1 : 0;
  if (conf != null && conf < 0.7 && n > 0) n -= 1;
  return n;
}

async function runOral(k, dir, exam, onDone) {
  const m = MODO[k];
  try { await C.ensureMic(); } catch (e) { C.toast(e.message, 6000); return onDone?.(null); }
  const sess = new C.Session();
  C.setCurrent(sess);
  C.keepAwake(true);
  C.view.innerHTML = C.stageHTML();
  C.$("#sPause").remove();
  C.$("#sEnd").textContent = exam ? "⏹ Terminar" : "⏹ Terminar práctica";
  let quit = false;
  C.$("#sEnd").onclick = () => sess.abort();
  C.$("#sQuit").onclick = () => { quit = true; sess.abort(); };
  const ui = stageUI();
  ui.part(`${name(k)} · ${exam ? "Evaluación" : "Práctica"} oral`);
  const t0 = Date.now();
  const clock = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); const el = C.$("#sClock"); if (el) el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }, 1000);

  // Construir ítems
  let items = [];
  if (m.oral === "interp") items = oralPool(k, dir, exam ? 5 : 5).map((o) => ({ ...o }));
  else if (m.oral === "shadow") items = oralPool(k, dir, exam ? 8 : 6).map((o) => ({ ...o, shadow: true }));
  else if (m.oral === "numeros") items = Array.from({ length: exam ? 8 : 6 }, (_, i) => { const it = makeItem(pickDir(dir, i)); return { lang: it.lang, t: it.text, num: it }; });
  else if (m.oral === "terminos") {
    const rows = shuffle(GLOSARIO).slice(0, exam ? 12 : 10);
    items = rows.map(([en, es], i) => { const from = pickDir(dir, i); const r = { en, es }; return { lang: from, t: first(r[from]), answers: r[C.other(from)].split("|"), term: true }; });
  }
  if (!items.length) { clearInterval(clock); C.toast("No hay frases para esa dirección. Genera material con Claude."); return onDone ? onDone(null) : C.go(`#crit/${k}`); }

  const done = [];
  const startHash = location.hash;
  for (let i = 0; i < items.length && !sess.aborted; i++) {
    const it = items[i];
    const outLang = it.shadow ? it.lang : C.other(it.lang);
    ui.prog(`${i + 1}/${items.length}`);
    ui.who(it.shadow ? "Escucha y repite exactamente" : it.term ? "Di el término equivalente" : "Interpreta al otro idioma");
    ui.dir(it.lang, it.shadow);
    ui.live(null); ui.ctl(""); ui.src(it.term ? `<div class="flash">${C.esc(it.t)}</div>` : "");
    ui.state("🔊 Escucha…");
    await A.speak(it.t, it.lang, { rate: C.rateOf(it.lang), voiceName: C.voiceOf(it.lang), signal: sess.ctrl.signal });
    if (sess.aborted) break;
    A.beep();
    const res = await C.recordTurn({ lang: outLang, sess, ui, maxSec: it.term ? 12 : Math.max(30, it.t.split(/\s+/).length * 1.8), maxWaitSec: it.term ? 7 : 12, silenceSec: it.term ? 1.6 : it.shadow ? 2 : C.S.silenceSec });
    if (sess.aborted && !res.transcript) break;
    const rec = { ...it, transcripcion: res.transcript, metricas: res.metrics };
    // Puntuación local cuando aplica
    if (it.shadow) { const d = wordDiff(it.t, res.transcript); rec.nota = pronNota(d.acc, res.metrics.confianza_asr); rec.diffHTML = d.html; rec.acc = d.acc; }
    if (it.num) { const c = checkItem(it.num, res.transcript); rec.nota = c.total ? Math.round((c.okCount / c.total) * 5 * 10) / 10 : 0; rec.checks = c.checks; }
    if (it.term) { const r = termMatch(res.transcript, it.answers); rec.nota = r.ok ? 5 : 0; rec.ok = r.ok; }
    done.push(rec);
    if (!exam) {
      // Corrección inmediata
      if (it.shadow) { ui.state(`${rec.nota >= 4 ? "✅" : "⚠"} Claridad ${Math.round(rec.acc * 100)}% · ${rec.nota}/5`); ui.src(`<div class="src">${rec.diffHTML}</div><p class="muted small">En rojo: palabras que el reconocimiento no entendió. Tú dijiste: «${C.esc(res.transcript || "(nada)")}»</p>`); }
      else if (it.num) { ui.state(`${rec.nota >= 5 ? "✅" : "❌"} ${rec.nota}/5`); ui.src(`<div class="src small"><b>Original:</b> ${C.esc(it.t)}<br><b>Dijiste:</b> ${C.esc(res.transcript || "(nada)")}</div><div class="row" style="gap:6px;margin-top:8px">${rec.checks.map((x) => `<span class="pill ${x.ok ? "good" : "bad"}">${x.ok ? "✓" : "✗"} ${C.esc(x.label)}</span>`).join("")}</div>`); }
      else if (it.term) { ui.state(rec.ok ? "✅ Correcto" : "❌"); ui.src(`<div class="flash">${C.esc(it.t)}</div><div class="src" style="text-align:center"><b>${C.esc(it.answers.join(" / "))}</b><br><span class="muted small">Dijiste: ${C.esc(res.transcript || "(nada)")}</span></div>`); }
      else {
        ui.src(`<div class="src small"><b>Original:</b> ${C.esc(it.t)}<br><b>Tu versión:</b> ${C.esc(res.transcript || "(nada)")}</div>`);
        if (C.S.apiKey && res.transcript && !navigator.onLine) {
          ui.state("📴 Sin internet: compara tu versión con el original");
        } else if (C.S.apiKey && res.transcript) {
          ui.state(`<span class="spinner" style="width:20px;height:20px;display:inline-block;margin:0 6px -4px 0"></span> Claude está corrigiendo…`);
          try {
            const ev = await evaluateCriterion({ settings: C.S, criterio: k, items: [rec] });
            const x = ev.items?.[0] || { nota: ev.nota };
            rec.nota = x.nota;
            ui.state(`${x.nota >= 5 ? "✅" : x.nota >= 4 ? "🟡" : "❌"} ${name(k)}: ${x.nota}/5`);
            ui.src(`<div class="src small"><b>Original:</b> ${C.esc(it.t)}<br><b>Tu versión:</b> ${C.esc(res.transcript)}</div>${x.problema ? `<div class="err">${C.esc(x.problema)}</div>` : `<div class="ok">Sin problemas en este criterio.</div>`}${x.sugerido ? `<div class="ok"><b>Mejor:</b> ${C.esc(x.sugerido)}</div>` : ""}`);
          } catch (e) { ui.state("Sin corrección"); ui.src(C.$("#sSrc").innerHTML + `<div class="err">${C.esc(e.message)}</div>`); }
        } else ui.state(res.transcript ? "Compara tu versión con el original" : "⚠ No se captó voz");
      }
      ui.live(null);
      ui.ctl(`<button class="btn" id="oRep">🔊 Original</button><button class="btn primary" id="oNext">Siguiente ▶</button>`);
      C.$("#oRep").onclick = () => { A.stopSpeaking(); A.speak(it.t, it.lang, { rate: C.rateOf(it.lang), voiceName: C.voiceOf(it.lang) }); };
      await new Promise((r) => { C.$("#oNext").onclick = r; sess.waiters.push(r); });
    } else {
      ui.state(res.transcript ? "✓ Registrado" : "⚠ No se captó voz");
      await new Promise((r) => setTimeout(r, 600));
    }
  }
  clearInterval(clock);
  C.keepAwake(false);
  if (location.hash !== startHash) return; // el usuario navegó a otra pantalla
  C.setCurrent(null);
  if (quit) return onDone ? onDone(null) : C.go(`#crit/${k}`);
  if (!done.length) return onDone ? onDone(null) : C.go(`#crit/${k}`);
  if (onDone) return onDone({ items: done });
  C.logDaily("criterios", (Date.now() - t0) / 60000);
  const avg = done.filter((d) => d.nota != null);
  const n5 = avg.length ? avg.reduce((a, d) => a + d.nota, 0) / avg.length : null;
  C.setTitle("Resultado");
  C.view.innerHTML = `<div class="card" style="text-align:center">${n5 != null ? `<div class="big-score" style="color:var(--${C.scoreClass(n100(n5))})">${n5.toFixed(1)}/5</div>` : ""}<p class="muted">${name(k)} · práctica oral (${done.length} ítems)</p>
    <div class="row" style="justify-content:center"><button class="btn primary" id="again">↺ Otra práctica</button><button class="btn" onclick="location.hash='#crit/${k}'">Volver al criterio</button></div></div>`;
  C.$("#again").onclick = () => runOral(k, C.S.critDir || "mix", false);
}

// ====================== Evaluación completa de un criterio ======================
async function runEvaluation(k, dir) {
  C.primeAudio();
  const m = MODO[k];
  const t0 = Date.now();
  let quiz = null, oral = null;
  if (m.quiz) {
    quiz = await new Promise((r) => runQuiz(k, dir, true, r));
    if (quiz === null) return C.go(`#crit/${k}:evaluacion`);
  }
  if (m.oral) {
    if (m.quiz) {
      const cont = await new Promise((r) => {
        C.view.innerHTML = `<div class="card" style="text-align:center"><h2>Parte escrita completada</h2><p class="muted">Ahora la parte oral. Prepara el micrófono${m.oral === "interp" ? "" : ""}.</p><button class="btn primary" id="cGo">Continuar ▶</button> <button class="btn ghost" id="cNo">Salir</button></div>`;
        C.$("#cGo").onclick = () => { C.primeAudio(); r(true); };
        C.$("#cNo").onclick = () => r(false);
      });
      if (!cont) return C.go(`#crit/${k}:evaluacion`);
    }
    oral = await new Promise((r) => runOral(k, dir, true, r));
    if (oral === null && !quiz) return C.go(`#crit/${k}:evaluacion`);
  }
  // Calificar parte oral
  let oralEval = null, oral5 = null, pending = false;
  const pendItems = () => oral.items.map(({ lang, t, transcripcion, metricas }) => ({ lang, t, transcripcion, metricas }));
  if (oral?.items?.length) {
    if (m.oral === "interp") {
      if (C.S.apiKey && !navigator.onLine) pending = true;
      else if (C.S.apiKey) {
        C.setTitle("Evaluando…");
        C.view.innerHTML = `<div class="card" style="text-align:center"><div class="spinner"></div><h2>Claude está evaluando: ${name(k)}</h2><p class="muted small" id="evP">Analizando ${oral.items.length} respuestas…</p></div>`;
        try {
          oralEval = await evaluateCriterion({ settings: C.S, criterio: k, items: oral.items, onProgress: (n) => { const p = C.$("#evP"); if (p) p.textContent = `Escribiendo la evaluación… ${n} caracteres`; } });
          oral5 = oralEval.nota;
          oralEval.items?.forEach((x) => { if (oral.items[x.indice]) Object.assign(oral.items[x.indice], { nota: x.nota, problema: x.problema, sugerido: x.sugerido }); });
        } catch (e) { if (e.offline) pending = true; else C.toast(e.message, 5000); }
      }
    } else {
      const ns = oral.items.map((x) => x.nota ?? 0);
      oral5 = ns.reduce((a, b) => a + b, 0) / ns.length;
    }
  }
  const q5 = quiz ? quiz.pct / 20 : null;
  if (pending) {
    CRIT_HIST.push({ id: C.uid(), date: Date.now(), criterio: k, dir, quizPct: quiz?.pct ?? null, oral5: null, nota5: null, nota100: null, pending: true, items: pendItems() });
    saveCritHist();
    C.logDaily("criterios", (Date.now() - t0) / 60000);
    C.setTitle("Resultado");
    C.view.innerHTML = `<div class="card"><div class="muted small">${ICONOS[k]} Evaluación · ${dirLabel(dir)}</div><h2 style="margin:4px 0 12px">${name(k)}</h2>
      ${quiz ? `<div class="stat"><b>${quiz.pct}%</b><span>parte escrita</span></div>` : ""}
      <div class="note">⏳ Sin internet: la parte oral quedó guardada y Claude la evaluará automáticamente cuando te conectes. La nota final aparecerá en el historial de este criterio y en Progreso.</div></div>
      ${quiz ? reviewHTML(quiz.review) : ""}
      <div class="row" style="justify-content:center;margin-bottom:24px"><button class="btn" onclick="location.hash='#criterios'">Los 10 criterios</button><button class="btn primary" onclick="location.hash='#crit/${k}:evaluacion'">Ver historial</button></div>`;
    return;
  }
  let n5 = q5 != null && oral5 != null ? q5 * 0.4 + oral5 * 0.6 : q5 ?? oral5;
  if (n5 == null) return C.go(`#crit/${k}:evaluacion`);
  const rec = { id: C.uid(), date: Date.now(), criterio: k, dir, quizPct: quiz?.pct ?? null, oral5: oral5 != null ? +oral5.toFixed(1) : null, nota5: +n5.toFixed(2), nota100: n100(n5), comentario: oralEval?.comentario || "", consejos: oralEval?.consejos || [] };
  CRIT_HIST.push(rec);
  saveCritHist();
  C.logDaily("criterios", (Date.now() - t0) / 60000);
  // Reporte
  C.setTitle("Resultado");
  const n = rec.nota100;
  C.view.innerHTML = `
    <div class="card">
      <div class="muted small">${ICONOS[k]} Evaluación · ${dirLabel(dir)}</div>
      <h2 style="margin:4px 0 12px">${name(k)}</h2>
      <div class="row" style="gap:24px">
        <div><div class="big-score" style="color:var(--${C.scoreClass(n)})">${n}</div><div class="muted small">/100 en este criterio (${(n5).toFixed(1)}/5)</div></div>
        ${quiz ? `<div class="stat"><b>${quiz.pct}%</b><span>parte escrita</span></div>` : ""}
        ${oral5 != null ? `<div class="stat"><b>${oral5.toFixed(1)}/5</b><span>parte oral</span></div>` : m.oral === "interp" && oral ? `<div class="stat"><b>—</b><span>oral sin evaluar (falta API key)</span></div>` : ""}
      </div>
      ${n >= 90 ? `<div class="ok">Nivel de examen alcanzado en este criterio.</div>` : `<div class="note">Te faltan ${90 - n} puntos para el nivel de 90 en este criterio.</div>`}
      ${rec.comentario ? `<p>${C.esc(rec.comentario)}</p>` : ""}
      ${rec.consejos.length ? `<h3>🎯 Consejos</h3><ul style="margin:0;padding-left:20px">${rec.consejos.map((c) => `<li>${C.esc(c)}</li>`).join("")}</ul>` : ""}
    </div>
    ${quiz ? reviewHTML(quiz.review) : ""}
    ${oral?.items?.length ? `<div class="card"><h2>Parte oral</h2>${oral.items.map((x, i) => `
      <details ${x.nota != null && x.nota < 4 ? "open" : ""}><summary>${i + 1}. <span class="pill ${x.lang}">${x.shadow ? "Repetir " + x.lang.toUpperCase() : x.lang.toUpperCase() + "→" + C.other(x.lang).toUpperCase()}</span> ${x.nota != null ? `<span class="pill ${x.nota >= 5 ? "good" : x.nota >= 4 ? "warn" : "bad"}">${+x.nota.toFixed?.(1) || x.nota}/5</span>` : ""}</summary>
        <div class="src small" style="margin-top:8px"><b>Original:</b> ${x.diffHTML || C.esc(x.t)}<br><b>Tu versión:</b> ${C.esc(x.transcripcion || "(nada)")}</div>
        ${x.checks ? `<div class="row" style="gap:6px;margin-top:6px">${x.checks.map((c) => `<span class="pill ${c.ok ? "good" : "bad"}">${c.ok ? "✓" : "✗"} ${C.esc(c.label)}</span>`).join("")}</div>` : ""}
        ${x.answers ? `<p class="small">Respuesta esperada: <b>${C.esc(x.answers.join(" / "))}</b></p>` : ""}
        ${x.problema ? `<div class="err">${C.esc(x.problema)}</div>` : ""}${x.sugerido ? `<div class="ok"><b>Mejor:</b> ${C.esc(x.sugerido)}</div>` : ""}
      </details>`).join("")}</div>` : ""}
    <div class="row" style="justify-content:center;margin-bottom:24px"><button class="btn" onclick="location.hash='#criterios'">Los 10 criterios</button><button class="btn primary" onclick="location.hash='#crit/${k}:practica'">Practicar este criterio</button></div>`;
}

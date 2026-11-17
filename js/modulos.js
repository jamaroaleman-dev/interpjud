// Módulos individuales de los 10 criterios del examen oral: práctica + evaluación.
import { GUIAS, QUIZ, PASAJES, ORALES, MODO, ICONOS, FALSOS_AMIGOS, PARES_PRON } from "./criterios.js";
import { GLOSARIO, MODISMOS } from "./content.js";
import { CRITERIOS, evaluateCriterion, generateCriterionSet } from "./ai.js";
import { makeItem, checkItem, termMatch } from "./drills.js";
import * as A from "./audio.js";
import { AUTOQ, oralExtra } from "./banco3.js";
import { addFallo, removeFallo, getFallos, countFallos, clearFallos } from "./fallos.js";

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
  C.routes.fallos = fallosPage;
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

// Cuántos ejercicios hay sin internet por criterio (ítems de quiz + ítems hablados).
export function bankCount(k) {
  const m = MODO[k];
  let q = 0, o = 0;
  if (m.quiz === "glosario") q = GLOSARIO.length * 2;
  else if (m.quiz === "modismos") q = MODISMOS.length;
  if (m.quiz) q += (QUIZ[k]?.length || 0) + (AUTOQ[k] ? AUTOQ[k]("mix", 9999).length : 0) + (k === "comprension" ? PASAJES.reduce((a, p) => a + p.preguntas.length, 0) : 0);
  if (m.oral === "terminos") o = GLOSARIO.length * 2;
  else if (m.oral === "numeros") o = Infinity;
  else if (m.oral) o = new Set([...(ORALES[k] || []), ...oralExtra(k)].map((x) => x.t)).size;
  return { q, o, total: q + o };
}
const fmtN = (n) => (n === Infinity ? "∞" : n.toLocaleString("es-DO"));

// ====================== Mis fallos ======================
function falloLine(f) {
  if (f.type === "quiz") return `<b>${C.esc(f.q.audio ? "🔊 " + f.q.audio.text : f.q.q)}</b><br><span style="color:var(--good)">✓ ${C.esc(f.q.o[f.q.c])}</span>${f.q.e ? `<br><span class="muted">${C.esc(f.q.e)}</span>` : ""}`;
  if (f.type === "term") return `<b>${C.esc(f.t)}</b> → <span style="color:var(--good)">${C.esc(f.answers.join(" / "))}</span>`;
  if (f.type === "num") return `<b>${C.esc(f.t)}</b>`;
  return `<b>${C.esc(f.t)}</b>${f.ref ? `<br><span style="color:var(--good)">Modelo: ${C.esc(f.ref)}</span>` : ""}${f.problema ? `<br><span style="color:var(--bad)">${C.esc(f.problema)}</span>` : ""}${f.sugerido ? `<br><span style="color:var(--good)">Mejor: ${C.esc(f.sugerido)}</span>` : ""}`;
}
function fallosCardHTML(k) {
  const fs = getFallos(k);
  if (!fs.length) return `<div class="card"><h2>📌 Mis fallos</h2><p class="muted small" style="margin:0">Aquí se guardan las preguntas y frases que falles en este criterio para que las repases. Salen de la lista cuando las aciertas.</p></div>`;
  return `<div class="card" style="border-color:var(--bad)"><h2>📌 Mis fallos (${fs.length})</h2>
    <button class="btn primary block" id="fRev">🔁 Repasar fallos (${Math.min(fs.length, 15)} de ${fs.length})</button>
    <details style="margin-top:10px"><summary class="small">Ver la lista</summary>${fs.map((f) => `<div class="src small" style="margin-top:8px">${f.veces > 1 ? `<span class="pill bad">×${f.veces}</span> ` : ""}${falloLine(f)} <button class="btn sm ghost" data-del="${C.esc(f.id)}" title="Quitar">✕</button></div>`).join("")}
    <button class="btn sm ghost" id="fClr" style="margin-top:8px">Borrar todos los fallos de este criterio</button></details></div>`;
}
function wireFallosCard(k) {
  const r = C.$("#fRev"); if (r) r.onclick = () => reviewFallos(k);
  const c = C.$("#fClr"); if (c) c.onclick = () => { if (confirm("¿Borrar todos los fallos guardados de este criterio?")) { clearFallos(k); C.go(`#crit/${k}:practica`); } };
  C.view.querySelectorAll("[data-del]").forEach((b) => (b.onclick = () => { removeFallo(k, b.dataset.del); b.parentElement.remove(); }));
}
async function reviewFallos(k) {
  C.primeAudio();
  const fs = getFallos(k).slice(0, 15);
  if (!fs.length) { C.toast("¡No tienes fallos pendientes en este criterio!"); return C.go(`#crit/${k}:practica`); }
  const quiz = shuffle(fs.filter((f) => f.type === "quiz")).map((f) => { const idx = shuffle(f.q.o.map((_, i) => i)); return { ...f.q, o: idx.map((i) => f.q.o[i]), c: idx.indexOf(f.q.c) }; });
  const oral = shuffle(fs.filter((f) => f.type !== "quiz")).map((f) => (f.type === "term" ? { lang: f.lang, t: f.t, answers: f.answers, term: true } : f.type === "num" ? { lang: f.lang, t: f.t, num: f.num } : { lang: f.lang, t: f.t, ref: f.ref, shadow: f.shadow }));
  let qres = null;
  if (quiz.length) {
    qres = await new Promise((r) => runQuiz(k, "mix", false, r, quiz));
    if (qres === null) return C.go(`#crit/${k}:practica`);
  }
  if (oral.length) {
    if (quiz.length) {
      const go = await new Promise((r) => {
        C.view.innerHTML = `<div class="card" style="text-align:center"><h2>Preguntas repasadas: ${qres.pct}%</h2><p class="muted">Ahora ${oral.length} ejercicio(s) hablado(s) que fallaste.</p><button class="btn primary" id="cGo">Continuar ▶</button> <button class="btn ghost" id="cNo">Terminar</button></div>`;
        C.$("#cGo").onclick = () => { C.primeAudio(); r(true); };
        C.$("#cNo").onclick = () => r(false);
      });
      if (!go) return C.go(`#crit/${k}:practica`);
    }
    return runOral(k, "mix", false, null, oral);
  }
  C.setTitle("Repaso de fallos");
  C.view.innerHTML = `<div class="card" style="text-align:center"><div class="big-score" style="color:var(--${C.scoreClass(qres.pct)})">${qres.pct}%</div><p class="muted">Repaso de fallos · ${name(k)}. Los que acertaste salieron de la lista.</p>
    <div class="row" style="justify-content:center">${countFallos(k) ? `<button class="btn primary" id="again">🔁 Repasar otra vez (${countFallos(k)})</button>` : `<span class="pill good">✓ Sin fallos pendientes</span>`}<button class="btn" data-go="#crit/${k}:practica">Volver al criterio</button></div></div>${reviewHTML(qres.review)}`;
  const a = C.$("#again"); if (a) a.onclick = () => reviewFallos(k);
}
function fallosPage() {
  C.setTitle("Mis fallos");
  const total = countFallos();
  C.view.innerHTML = `<div class="card"><h2>📌 Mis fallos (${total})</h2><p class="muted small" style="margin:0">Todo lo que has fallado, guardado por criterio. Al acertarlo en el repaso, sale de la lista.</p></div>
    <div class="list">${CRITERIOS.map(([k, nm]) => { const n = countFallos(k); return `<button class="item" data-k="${k}" ${n ? "" : "disabled"}><span style="font-size:22px">${ICONOS[k]}</span><div class="grow"><div class="t">${nm}</div><div class="d">${n ? `${n} por repasar` : "Sin fallos"}</div></div>${n ? `<span class="pill bad">${n}</span><span>🔁</span>` : `<span class="pill good">✓</span>`}</button>`; }).join("")}</div>`;
  C.view.querySelectorAll(".item[data-k]").forEach((b) => (b.onclick = () => { if (countFallos(b.dataset.k)) reviewFallos(b.dataset.k); }));
}
export { countFallos };

// ====================== Lista ======================
function listPage() {
  C.setTitle("Los 10 criterios");
  C.view.innerHTML = `
    <div class="card"><p class="muted small" style="margin:0">Los 10 criterios oficiales de la guía de evaluación oral (escala 0–5 cada uno; 10 × 5 = 50 puntos → ×2 = 100; necesitas 45/50). Cada uno tiene su <b>práctica</b> (guía, referencia, quiz con corrección inmediata y ejercicios hablados) y su <b>evaluación</b> (prueba con nota de 0 a 100 solo en ese criterio), en inglés → español y español → inglés.</p></div>
    <div class="list">
      ${CRITERIOS.map(([k, nm], i) => {
        const l = lastOf(k), b = bestOf(k);
        const bc = bankCount(k);
        return `<button class="item" data-k="${k}"><span style="font-size:24px">${ICONOS[k]}</span><div class="grow"><div class="t">${i + 1}. ${nm}</div><div class="d">${C.esc(desc(k))}</div><div class="d"><b>${fmtN(bc.total)}</b> ejercicios sin internet${countFallos(k) ? ` · <span style="color:var(--bad)">📌 ${countFallos(k)} fallos por repasar</span>` : ""}</div></div>${l ? `<span class="pill ${C.scoreClass(l.nota100)}" title="Mejor: ${b}">${l.nota100}</span>` : `<span class="pill">nuevo</span>`}</button>`;
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
      ${(() => { const bc = bankCount(k); return `<p class="small" style="margin:8px 0 0">📦 Banco sin internet: <b>${fmtN(bc.total)}</b> ejercicios${bc.q ? ` (${fmtN(bc.q)} de selección múltiple` : " ("}${bc.q && bc.o ? " + " : ""}${bc.o ? `${fmtN(bc.o)} hablados` : ""}). Cada ronda sale distinta.</p>`; })()}
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
      ${fallosCardHTML(k)}
      <div class="card"><h2>Guía rápida</h2><ul style="margin:0;padding-left:20px">${GUIAS[k].map((g) => `<li style="margin:4px 0">${C.esc(g)}</li>`).join("")}</ul></div>
      ${referenciaHTML(k)}
      <div class="card"><h2>Ejercicios de práctica</h2><p class="muted small" style="margin-top:0">Con corrección inmediata después de cada respuesta.</p>
        <div class="grid2">
          ${m.quiz ? `<button class="btn block" id="pQuiz">${m.quiz === "auditivo" ? "🎧 Frases auditivas (escuchar y elegir)" : k === "integridad_mensaje" ? "🧩 ¿Cuál versión es fiel? (quiz)" : "☑️ Quiz de selección múltiple"}</button>` : ""}
          ${m.quiz === "auditivo" ? `<button class="btn block" id="pPas">👂 Pasajes largos (memoria)</button>` : ""}
          ${m.oral ? `<button class="btn block" id="pOral">${{ interp: "🎙️ Interpretar frases", shadow: "👄 Repetir frases (pronunciación)", numeros: "🔢 Cifras habladas", terminos: "⚖️ Términos hablados" }[m.oral]}</button>` : ""}
        </div>
        ${m.quiz === "propio" || m.quiz === "auditivo" || m.oral === "interp" ? `<button class="btn sm ghost" id="pGen" style="margin-top:10px" ${C.S.apiKey ? "" : "disabled"}>✨ Generar material nuevo con Claude</button> <span class="muted small" id="pGenOut">${nGen ? `${nGen} ítems generados guardados` : ""}</span>` : ""}
      </div>`;
    const q = C.$("#pQuiz"); if (q) q.onclick = () => runQuiz(k, C.S.critDir || "mix", false);
    const pp = C.$("#pPas"); if (pp) pp.onclick = () => runListening(k, C.S.critDir || "mix", false);
    const o = C.$("#pOral"); if (o) o.onclick = () => runOral(k, C.S.critDir || "mix", false);
    const g = C.$("#pGen"); if (g) g.onclick = () => genMore(k);
    wireFallosCard(k);
    body.querySelectorAll("[data-say]").forEach((b) => (b.onclick = () => { A.stopSpeaking(); A.speak(b.dataset.say, b.dataset.lang, { rate: C.rateOf(b.dataset.lang), voiceName: C.voiceOf(b.dataset.lang) }); }));
  } else {
    const parts = [];
    if (m.quiz) parts.push(m.quiz === "auditivo" ? "10 frases auditivas + 1 pasaje con preguntas" : "10 preguntas de selección múltiple");
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
  if (AUTOQ[k]) pool.push(...AUTOQ[k](dir, Math.max(n, 12)));
  if (dir !== "mix") pool = pool.filter((q) => q.d === dir);
  // mezclar opciones
  const seen = new Set();
  pool = shuffle(pool).filter((q) => { const id = q.k || q.q; return seen.has(id) ? false : seen.add(id); });
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
  let p = [...(ORALES[k] || []), ...(CRIT_SETS[k]?.orales || []), ...oralExtra(k)];
  const seenT = new Set(); p = shuffle(p).filter((x) => (seenT.has(x.t) ? false : seenT.add(x.t)));
  if (k === "pronunciacion") {
    // En pronunciación se repite en el idioma de DESTINO.
    if (dir !== "mix") p = p.filter((x) => x.lang === (dir === "en" ? "es" : "en"));
  } else if (dir !== "mix") p = p.filter((x) => x.lang === dir);
  p = shuffle(p);
  if (dir === "mix") { const en = p.filter((x) => x.lang === "en"), es = p.filter((x) => x.lang === "es"); p = []; while (en.length || es.length) { if (en.length) p.push(en.shift()); if (es.length) p.push(es.shift()); } }
  return p.slice(0, n);
}

// ====================== Quiz ======================
const quizEntry = (q) => ({ type: "quiz", q: { d: q.d, k: q.k, q: q.q, o: q.o, c: q.c, e: q.e, audio: q.audio } });
async function runQuiz(k, dir, exam, onDone, override) {
  const m = MODO[k];
  if (m.quiz === "pasajes" && !override) return runListening(k, dir, exam, onDone);
  const qs = override || quizPool(k, dir, exam ? 10 : m.quiz === "auditivo" ? 8 : 10);
  if (!qs.length) { C.toast("No hay preguntas para esa dirección todavía. Genera material nuevo con Claude."); return onDone?.(null); }
  const answers = [];
  for (let i = 0; i < qs.length; i++) {
    const q = qs[i];
    const choice = await askQuestion(q, i, qs.length, exam, `${name(k)} · ${override ? "Repaso de fallos" : exam ? "Evaluación" : "Práctica"}`);
    if (choice === "quit") return onDone ? onDone(null) : C.go(`#crit/${k}`);
    answers.push(choice);
    if (choice === q.c) removeFallo(k, quizEntry(q)); else addFallo(k, quizEntry(q));
  }
  let ok = answers.filter((a, i) => a === qs[i].c).length;
  let review = qs.map((q, i) => ({ q, a: answers[i] }));
  if (exam && m.quiz === "auditivo" && !override) {
    // La evaluación de comprensión añade un pasaje largo.
    const pas = await new Promise((r) => runListening(k, dir, true, r, 1));
    if (pas === null) return onDone ? onDone(null) : C.go(`#crit/${k}`);
    review = [...review, ...pas.review];
    ok += pas.review.filter((x) => x.a === x.q.c).length;
  }
  const pct = Math.round((ok / review.length) * 100);
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
        ${q.audio ? `<div class="row" style="margin-bottom:12px"><button class="btn" id="qPlay">🔊 Escuchar</button><span class="muted small" id="qPlayN">${exam ? "Se escucha una sola vez." : "Puedes repetirla."}</span></div>` : ""}
        <div class="list" id="qOpts">${q.o.map((o, j) => `<button class="item" data-j="${j}"><span class="pill">${"ABCD"[j] || j + 1}</span><div class="grow">${C.esc(o)}</div></button>`).join("")}</div>
        <div id="qFb"></div>
        <div class="row" style="justify-content:space-between;margin-top:12px"><button class="btn sm ghost" id="qQuit">✕ Salir</button><span></span></div>
      </div>`;
    C.$("#qQuit").onclick = () => { A.stopSpeaking(); resolve("quit"); };
    if (q.audio) {
      let plays = 0;
      const play = async () => {
        const b = C.$("#qPlay"); if (!b) return;
        plays++; b.disabled = true; b.textContent = "🔊 …";
        await A.speak(q.audio.text, q.audio.lang, { rate: C.rateOf(q.audio.lang), voiceName: C.voiceOf(q.audio.lang) });
        const b2 = C.$("#qPlay"); if (!b2) return;
        b2.textContent = "🔊 Escuchar"; b2.disabled = exam && plays >= 1;
      };
      C.$("#qPlay").onclick = () => { C.primeAudio(); play(); };
      play();
    }
    C.view.querySelectorAll("#qOpts .item").forEach((b) => (b.onclick = () => {
      const j = +b.dataset.j;
      if (exam) { A.stopSpeaking(); return resolve(j); }
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
      <div class="row" style="justify-content:center"><button class="btn primary" id="again">↺ Otro quiz</button><button class="btn" data-go="#crit/${k}">Volver al criterio</button></div></div>
    ${reviewHTML(review)}`;
  C.$("#again").onclick = () => runQuiz(k, C.S.critDir || "mix", false);
  if (countFallos(k)) C.view.querySelector(".card .row").insertAdjacentHTML("beforeend", `<button class="btn" id="revF">🔁 Repasar fallos (${countFallos(k)})</button>`);
  const rv = C.$("#revF"); if (rv) rv.onclick = () => reviewFallos(k);
}

function reviewHTML(review) {
  const bad = review.filter((r) => r.a !== r.q.c);
  if (!bad.length) return `<div class="card"><div class="ok">¡Todas correctas!</div></div>`;
  return `<div class="card"><h2>Repasa</h2>${bad.map((r) => `<div class="src small" style="margin-bottom:8px"><b>${C.esc(r.q.q)}</b><br><span style="color:var(--bad)">✗ ${C.esc(r.q.o[r.a] ?? "(sin respuesta)")}</span><br><span style="color:var(--good)">✓ ${C.esc(r.q.o[r.q.c])}</span>${r.q.e ? `<br><span class="muted">${C.esc(r.q.e)}</span>` : ""}</div>`).join("")}</div>`;
}

// Comprensión auditiva: escuchar pasaje (sin texto) y responder.
async function runListening(k, dir, exam, onDone, nPas) {
  const ps = pasajePool(dir, nPas || (exam ? 2 : 1));
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

const oralEntry = (it) => (it.term ? { type: "term", lang: it.lang, t: it.t, answers: it.answers, term: true } : it.num ? { type: "num", lang: it.lang, t: it.t, num: it.num } : { type: "oral", lang: it.lang, t: it.t, ref: it.ref, shadow: it.shadow });
async function runOral(k, dir, exam, onDone, override) {
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
  if (override) items = override.map((o) => ({ ...o }));
  else if (m.oral === "interp") items = oralPool(k, dir, exam ? 5 : 5).map((o) => ({ ...o }));
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
    // Mis fallos: guardar lo que salió mal; quitar lo que ya sale bien.
    const good = it.shadow ? rec.nota >= 4 : it.num ? rec.nota >= 5 : it.term ? rec.ok : null;
    if (good === true) removeFallo(k, oralEntry(it)); else if (good === false) addFallo(k, oralEntry(it));
    if (!exam) {
      // Corrección inmediata
      if (it.shadow) { ui.state(`${rec.nota >= 4 ? "✅" : "⚠"} Claridad ${Math.round(rec.acc * 100)}% · ${rec.nota}/5`); ui.src(`<div class="src">${rec.diffHTML}</div><p class="muted small">En rojo: palabras que el reconocimiento no entendió. Tú dijiste: «${C.esc(res.transcript || "(nada)")}»</p>`); }
      else if (it.num) { ui.state(`${rec.nota >= 5 ? "✅" : "❌"} ${rec.nota}/5`); ui.src(`<div class="src small"><b>Original:</b> ${C.esc(it.t)}<br><b>Dijiste:</b> ${C.esc(res.transcript || "(nada)")}</div><div class="row" style="gap:6px;margin-top:8px">${rec.checks.map((x) => `<span class="pill ${x.ok ? "good" : "bad"}">${x.ok ? "✓" : "✗"} ${C.esc(x.label)}</span>`).join("")}</div>`); }
      else if (it.term) { ui.state(rec.ok ? "✅ Correcto" : "❌"); ui.src(`<div class="flash">${C.esc(it.t)}</div><div class="src" style="text-align:center"><b>${C.esc(it.answers.join(" / "))}</b><br><span class="muted small">Dijiste: ${C.esc(res.transcript || "(nada)")}</span></div>`); }
      else {
        const mt = res.metrics || {};
        const metr = `<p class="muted small">Inicio ${mt.latencia_inicio_s ?? "—"} s · ${mt.palabras_por_minuto ?? "—"} ppm · pausas >1 s: ${mt.pausas_mayores_1s ?? "—"} · pausa más larga ${mt.pausa_mas_larga_s ?? "—"} s${mt.muletillas_detectadas ? ` · muletillas: ${mt.muletillas_detectadas}` : ""}</p>`;
        const sim = it.ref && res.transcript ? Math.round(wordDiff(it.ref, res.transcript).acc * 100) : null;
        const refHTML = it.ref ? `<div class="ok small"><b>Versión modelo:</b> ${C.esc(it.ref)}${sim != null ? `<br><span class="muted">Coincidencia de palabras con el modelo: ${sim}% (orientativo: otra forma correcta también vale)</span>` : ""}</div>` : "";
        ui.src(`<div class="src small"><b>Original:</b> ${C.esc(it.t)}<br><b>Tu versión:</b> ${C.esc(res.transcript || "(nada)")}</div>${refHTML}${metr}`);
        if (C.S.apiKey && res.transcript && !navigator.onLine) {
          ui.state("📴 Sin internet: compara con la versión modelo (fíjate en omisiones, adiciones y cifras)");
        } else if (C.S.apiKey && res.transcript) {
          ui.state(`<span class="spinner" style="width:20px;height:20px;display:inline-block;margin:0 6px -4px 0"></span> Claude está corrigiendo…`);
          try {
            const ev = await evaluateCriterion({ settings: C.S, criterio: k, items: [rec] });
            const x = ev.items?.[0] || { nota: ev.nota };
            rec.nota = x.nota;
            if (x.nota >= 4) removeFallo(k, oralEntry(it)); else addFallo(k, { ...oralEntry(it), nota: x.nota, problema: x.problema, sugerido: x.sugerido });
            ui.state(`${x.nota >= 5 ? "✅" : x.nota >= 4 ? "🟡" : "❌"} ${name(k)}: ${x.nota}/5`);
            ui.src(`<div class="src small"><b>Original:</b> ${C.esc(it.t)}<br><b>Tu versión:</b> ${C.esc(res.transcript)}</div>${metr}${x.problema ? `<div class="err">${C.esc(x.problema)}</div>` : `<div class="ok">Sin problemas en este criterio.</div>`}${x.sugerido ? `<div class="ok"><b>Mejor:</b> ${C.esc(x.sugerido)}</div>` : ""}`);
          } catch (e) { ui.state("Sin corrección"); ui.src(C.$("#sSrc").innerHTML + `<div class="err">${C.esc(e.message)}</div>`); }
        } else ui.state(res.transcript ? (it.ref ? "Compara tu versión con la versión modelo" : "Compara tu versión con el original") : "⚠ No se captó voz");
      }
      ui.live(null);
      const saved = getFallos(k).some((f) => f.t === it.t);
      ui.ctl(`<button class="btn" id="oRep">🔊 Original</button>${it.term || it.num ? "" : `<button class="btn" id="oSave">${saved ? "✓ En mis fallos" : "📌 Guardar en mis fallos"}</button>`}<button class="btn primary" id="oNext">Siguiente ▶</button>`);
      C.$("#oRep").onclick = () => { A.stopSpeaking(); A.speak(it.t, it.lang, { rate: C.rateOf(it.lang), voiceName: C.voiceOf(it.lang) }); };
      const sv = C.$("#oSave");
      if (sv) sv.onclick = () => {
        if (getFallos(k).some((f) => f.t === it.t)) { removeFallo(k, oralEntry(it)); sv.textContent = "📌 Guardar en mis fallos"; }
        else { addFallo(k, { ...oralEntry(it), transcripcion: rec.transcripcion }); sv.textContent = "✓ En mis fallos (toca para quitar)"; }
      };
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
    <div class="row" style="justify-content:center"><button class="btn primary" id="again">↺ Otra práctica</button><button class="btn" data-go="#crit/${k}">Volver al criterio</button></div></div>`;
  C.$("#again").onclick = () => (override ? reviewFallos(k) : runOral(k, C.S.critDir || "mix", false));
  if (override) { C.$("#again").textContent = countFallos(k) ? `🔁 Repasar fallos otra vez (${countFallos(k)})` : "✓ Sin fallos pendientes"; C.$("#again").disabled = !countFallos(k); }
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
  const pendItems = () => oral.items.map(({ lang, t, ref, transcripcion, metricas }) => ({ lang, t, ref, transcripcion, metricas }));
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
      <div class="row" style="justify-content:center;margin-bottom:24px"><button class="btn" data-go="#criterios">Los 10 criterios</button><button class="btn primary" data-go="#crit/${k}:evaluacion">Ver historial</button></div>`;
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
    <div class="row" style="justify-content:center;margin-bottom:24px"><button class="btn" data-go="#criterios">Los 10 criterios</button><button class="btn primary" data-go="#crit/${k}:practica">Practicar este criterio</button></div>`;
}

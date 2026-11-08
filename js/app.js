import "./banco2.js"; // banco ampliado (se fusiona con los bancos base)
import { DIALOGOS, DISCURSOS, VISTAS, GLOSARIO, MODISMOS, ESCENARIOS } from "./content.js";
import * as A from "./audio.js";
import { CRITERIOS, MODELS, evaluate, generate, testKey } from "./ai.js";
import { makeItem, checkItem, termMatch } from "./drills.js";
import { initModulos, critSummaryHTML, critPendingCount, processCritPending } from "./modulos.js";
import { PASAJES, ORALES, PARES_PRON } from "./criterios.js";

// ====================== Estado y almacenamiento ======================
const LS = {
  get(k, d) { try { const v = localStorage.getItem("ij_" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("ij_" + k, JSON.stringify(v)); } catch {} }
};

const DEFAULTS = {
  apiKey: "", model: "claude-opus-5-5", escrito: 70, examDate: "",
  voiceES: "", voiceEN: "", rateES: 1, rateEN: 1,
  recES: "es-US", recEN: "en-US", useAudio: !A.isAndroid, silenceSec: 3, prepSec: 30,
  showText: false, allowRepeat: true, nivel: 2
};
let S = { ...DEFAULTS, ttsProvider: "browser", googleKey: "", gVoiceEN: A.GOOGLE_VOICES.en[0][0], gVoiceES: A.GOOGLE_VOICES.es[0][0], ...LS.get("settings", {}) };
// Migración: volver a elegir la mejor voz del navegador (prioriza voces «Natural»).
if (S.voiceVer !== 2) { S.voiceEN = ""; S.voiceES = ""; S.voiceVer = 2; LS.set("settings", S); }
// es-US tiene paquete de reconocimiento sin conexión; es-DO normalmente no.
if (!S.recVer) { if (S.recES === "es-DO") S.recES = "es-US"; S.recVer = 1; LS.set("settings", S); }
let ttsWarned = false;
function applyTTS() {
  A.configureTTS({
    provider: S.ttsProvider, key: S.googleKey, en: S.gVoiceEN, es: S.gVoiceES,
    onError: (e) => { if (!ttsWarned) { ttsWarned = true; toast("Voz de Google no disponible (" + e.message + "). Usando la voz del navegador.", 6000); } }
  });
}
const saveSettings = () => { LS.set("settings", S); applyTTS(); };
applyTTS();

let HIST = LS.get("history", []);
const saveHist = () => { HIST = HIST.slice(-300); LS.set("history", HIST); };
let TERMS = LS.get("terms", {});
let MYTERMS = LS.get("myterms", []);
let DAILY = LS.get("daily", {});
let GENERATED = LS.get("generated", []); // ejercicios generados con IA

const today = () => new Date().toLocaleDateString("en-CA");
function logDaily(kind, minutes = 0) {
  const d = (DAILY[today()] ||= {});
  d[kind] = (d[kind] || 0) + 1;
  d.min = +((d.min || 0) + minutes).toFixed(1);
  LS.set("daily", DAILY);
}

// ====================== Utilidades UI ======================
const $ = (s, el = document) => el.querySelector(s);
const view = $("#view");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const L = (l) => (l === "es" ? "ES" : "EN");
const other = (l) => (l === "es" ? "en" : "es");
const recLang = (l) => (l === "es" ? S.recES : S.recEN);
const voiceOf = (l) => (l === "es" ? S.voiceES : S.voiceEN);
const rateOf = (l) => (l === "es" ? S.rateES : S.rateEN);
const fmtDate = (ts) => new Date(ts).toLocaleString("es-DO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const wc = (t) => (t || "").split(/\s+/).filter(Boolean).length;

function toast(msg, ms = 2600) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}
function setTitle(t) { $("#title").textContent = t; document.title = t === "InterpJud · Oral" ? "InterpJud Oral" : `${t} · InterpJud`; }
function scoreClass(n) { return n == null ? "" : n >= 90 ? "good" : n >= 80 ? "warn" : "bad"; }

let wakeLock = null;
async function keepAwake(on) {
  try {
    if (on && "wakeLock" in navigator) wakeLock = await navigator.wakeLock.request("screen");
    else { await wakeLock?.release(); wakeLock = null; }
  } catch {}
}

// Desbloquea audio en iOS/Android dentro del gesto del usuario.
function primeAudio() {
  try { A.beep(1, 1, 0.0001); } catch {}
  A.unlockAudio();
  try { if (A.hasTTS) { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; speechSynthesis.speak(u); } } catch {}
}

async function ensureMic() {
  if (!A.hasRecognition) {
    throw new Error("Este navegador no tiene reconocimiento de voz. Usa Google Chrome (PC o Android), Microsoft Edge o Safari (iPhone).");
  }
  if (S.useAudio && A.hasRecorder) {
    try { await A.openMic(); } catch (e) {
      throw new Error("No se pudo usar el micrófono. Permite el acceso al micrófono en el navegador. (" + (e.message || e) + ")");
    }
  }
}

// ====================== Router ======================
let current = null; // sesión en curso (para abortar)
const routes = {};
function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
window.addEventListener("hashchange", render);
$("#backBtn").onclick = () => go("#home");
$("#settingsBtn").onclick = () => go("#ajustes");

function render() {
  if (current) { current.abort(); current = null; }
  A.stopSpeaking();
  keepAwake(false);
  const [name, arg] = (location.hash.slice(1) || "home").split("/");
  const fn = routes[name] || routes.home;
  window.scrollTo(0, 0);
  fn(arg);
}

// ====================== Inicio ======================
function evaluated() { return HIST.filter((h) => h.nota100 != null); }
function avgCriteria(n = 5) {
  const ev = evaluated().slice(-n);
  if (!ev.length) return null;
  const out = {};
  for (const [k] of CRITERIOS) {
    const vals = ev.map((h) => h.puntuaciones?.[k]).filter((v) => v != null);
    out[k] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }
  return out;
}
function weakest(n = 3) {
  const a = avgCriteria();
  if (!a) return [];
  return CRITERIOS.filter(([k]) => a[k] != null).sort((x, y) => a[x[0]] - a[y[0]]).slice(0, n).filter(([k]) => a[k] < 4.7);
}
function streak() {
  let n = 0;
  const d = new Date();
  for (;;) {
    const k = d.toLocaleDateString("en-CA");
    const day = DAILY[k];
    if (day && Object.keys(day).some((x) => x !== "min")) { n++; d.setDate(d.getDate() - 1); }
    else if (n === 0 && k === today()) { d.setDate(d.getDate() - 1); if (!DAILY[d.toLocaleDateString("en-CA")]) break; }
    else break;
  }
  return n;
}
function daysToExam() {
  const target = new Date((S.examDate || "2026-11-10") + "T00:00:00");
  const now = new Date();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - todayMid) / 86400000);
}

routes.home = () => {
  setTitle("InterpJud · Oral");
  const ev = evaluated();
  const last5 = ev.slice(-5);
  const avg = last5.length ? Math.round(last5.reduce((a, h) => a + h.nota100, 0) / last5.length) : null;
  const dte = daysToExam();
  const d = DAILY[today()] || {};
  const plan = [
    ["consec", "1 diálogo de consecutiva", "#consec"],
    ["simul", "1 discurso de simultánea", "#simul"],
    ["vista", "1 traducción a la vista", "#vista"],
    ["numeros", "1 ronda de números, nombres y fechas", "#numeros"],
    ["terminos", "1 ronda de terminología", "#terminos"],
    ["criterios", "1 práctica o evaluación de un criterio", "#criterios"]
  ];
  const weak = weakest();
  view.innerHTML = `
    <div class="card">
      <div class="stats">
        <div class="stat"><b>${dte > 0 ? dte : dte === 0 ? "¡Hoy!" : "—"}</b><span>${S.examDate ? "días para tu oral" : "días para el inicio del oral (10 nov)"}</span></div>
        <div class="stat"><b class="${scoreClass(avg)}" style="color:var(--${avg == null ? "text" : scoreClass(avg)})">${avg ?? "—"}</b><span>promedio últimas 5 (meta 90)</span></div>
        <div class="stat"><b>${avg == null ? "—" : ((S.escrito + avg) / 2).toFixed(1)}</b><span>global estimado (escrito ${S.escrito})</span></div>
        <div class="stat"><b>${streak()}🔥</b><span>días seguidos · ${d.min ? Math.round(d.min) : 0} min hoy</span></div>
      </div>
      ${!navigator.onLine ? `<div class="note">📴 Sin internet. Puedes practicar todo; las evaluaciones de Claude quedan pendientes y se hacen solas al conectarte.</div>` : ""}
      ${pendingCount() ? `<div class="note">⏳ ${pendingCount()} evaluación(es) pendiente(s)${navigator.onLine ? " — procesando…" : " — se harán al tener internet"}.</div>` : ""}
      ${!S.apiKey ? `<div class="note">Para que Claude te evalúe y genere ejercicios nuevos, agrega tu API key en <a href="#ajustes">Ajustes</a>. Sin ella puedes practicar con el banco integrado y los drills.</div>` : ""}
    </div>

    <div class="card">
      <h2>Simulacro del examen</h2>
      <p class="muted small" style="margin:0 0 10px">Consecutiva + simultánea + traducción a la vista, de corrido (~20–30 min), con evaluación completa sobre 100.</p>
      <button class="btn primary block" onclick="location.hash='#simulacro'">▶ Hacer un simulacro</button>
    </div>

    <div class="card">
      <h2>Los 10 criterios del oral</h2>
      <p class="muted small" style="margin:0 0 10px">Práctica y evaluación individual de cada aspecto: gramática, vocabulario, fluidez, pronunciación, comprensión, terminología, interferencias, números, modismos y registro.</p>
      <button class="btn block" onclick="location.hash='#criterios'">📋 Ir a los 10 criterios</button>
    </div>

    <div class="grid">
      <button class="tile" onclick="location.hash='#consec'"><span class="ic">🗣️</span><b>Consecutiva</b><span>Diálogos de audiencia ES ⇄ EN</span></button>
      <button class="tile" onclick="location.hash='#simul'"><span class="ic">🎧</span><b>Simultánea</b><span>Discursos continuos, con audífonos</span></button>
      <button class="tile" onclick="location.hash='#vista'"><span class="ic">📄</span><b>A la vista</b><span>Lee un documento y dilo en el otro idioma</span></button>
      <button class="tile" onclick="location.hash='#numeros'"><span class="ic">🔢</span><b>Números y nombres</b><span>Cifras, fechas, montos, cédulas</span></button>
      <button class="tile" onclick="location.hash='#terminos'"><span class="ic">⚖️</span><b>Terminología</b><span>Tarjetas habladas y modismos</span></button>
      <button class="tile" onclick="location.hash='#progreso'"><span class="ic">📈</span><b>Progreso</b><span>Historial, notas, debilidades</span></button>
    </div>

    <div class="card" style="margin-top:14px">
      <h2>Plan de hoy</h2>
      ${plan.map(([k, t, h]) => `<div class="chk ${d[k] ? "done" : ""}"><span class="box">${d[k] ? "✓" : ""}</span><a href="${h}" style="flex:1;color:inherit;text-decoration:none">${t}</a>${d[k] > 1 ? `<span class="pill">×${d[k]}</span>` : ""}</div>`).join("")}
      ${weak.length ? `<p class="small" style="margin:12px 0 0">Tus criterios más débiles: ${weak.map(([, n]) => `<span class="pill bad">${n}</span>`).join(" ")}</p>` : ""}
    </div>
  `;
};

// ====================== Selección de ejercicios ======================
function genBox(tipo) {
  const weak = weakest().map(([, n]) => n).join(", ");
  return `
    <div class="card">
      <h2>✨ Generar ejercicio nuevo con Claude</h2>
      ${!S.apiKey ? `<p class="muted small">Requiere API key (<a href="#ajustes">Ajustes</a>).</p>` : ""}
      <div class="grid2">
        <label class="f"><span>Escenario</span><select id="gEsc"><option value="">Aleatorio</option>${ESCENARIOS.map((e) => `<option>${esc(e)}</option>`).join("")}</select></label>
        <label class="f"><span>Nivel</span><select id="gNivel"><option value="1">Básico</option><option value="2" selected>Examen</option><option value="3">Avanzado (más difícil que el examen)</option></select></label>
        ${tipo !== "consec" ? `<label class="f"><span>Idioma del original</span><select id="gLang"><option value="">Aleatorio</option><option value="es">Español → interpretas al inglés</option><option value="en">Inglés → interpretas al español</option></select></label>` : ""}
      </div>
      ${weak ? `<label class="check"><input type="checkbox" id="gWeak" checked> Enfocar en mis debilidades (${esc(weak)})</label>` : ""}
      <button class="btn primary block" id="gBtn" ${!S.apiKey ? "disabled" : ""}>Generar y empezar</button>
      <div id="gOut"></div>
    </div>`;
}
function wireGen(tipo, onReady) {
  const b = $("#gBtn");
  if (!b) return;
  b.onclick = async () => {
    primeAudio();
    const out = $("#gOut");
    b.disabled = true;
    out.innerHTML = `<div class="spinner"></div><p class="muted small" style="text-align:center" id="gProg">Claude está escribiendo el ejercicio…</p>`;
    try {
      const enfoque = $("#gWeak")?.checked ? weakest().map(([, n]) => n).join(", ") : "";
      const g = await generate({
        settings: S, tipo, nivel: +$("#gNivel").value, escenario: $("#gEsc").value, idioma: $("#gLang")?.value || "",
        enfoque, usados: [...GENERATED.map((x) => x.titulo), ...HIST.map((h) => h.titulo)],
        onProgress: (n) => { const p = $("#gProg"); if (p) p.textContent = `Claude está escribiendo… ${n} caracteres`; }
      });
      g.id = "g" + uid(); g.tipo = tipo; g.ia = true;
      GENERATED.push(g); GENERATED = GENERATED.slice(-60); LS.set("generated", GENERATED);
      onReady(g);
    } catch (e) {
      out.innerHTML = `<div class="err">${esc(e.message)}</div>`;
      b.disabled = false;
    }
  };
}
function optionsBox(kind) {
  return `
    <details class="card" style="padding:12px 16px">
      <summary>Opciones</summary>
      ${kind === "consec" ? `<label class="check"><input type="checkbox" id="oRepeat" ${S.allowRepeat ? "checked" : ""}> Permitir pedir repetición (cuenta en la evaluación)</label>` : ""}
      <label class="check"><input type="checkbox" id="oText" ${S.showText ? "checked" : ""}> Mostrar el texto original mientras suena (modo estudio, no examen)</label>
      ${kind === "consec" ? `<label class="f"><span>Segundos de silencio para terminar tu turno: <b id="oSilV">${S.silenceSec}</b></span><input type="range" min="2" max="6" step="0.5" id="oSil" value="${S.silenceSec}"></label>` : ""}
      ${kind === "vista" ? `<label class="f"><span>Tiempo de lectura previa: <b id="oPrepV">${S.prepSec}</b> s</span><input type="range" min="0" max="90" step="5" id="oPrep" value="${S.prepSec}"></label>` : ""}
    </details>`;
}
function wireOptions() {
  const bind = (id, key, fn = (e) => e.checked) => { const el = $(id); if (el) el.onchange = () => { S[key] = fn(el); saveSettings(); }; };
  bind("#oRepeat", "allowRepeat");
  bind("#oText", "showText");
  const sil = $("#oSil"); if (sil) sil.oninput = () => { S.silenceSec = +sil.value; $("#oSilV").textContent = sil.value; saveSettings(); };
  const pr = $("#oPrep"); if (pr) pr.oninput = () => { S.prepSec = +pr.value; $("#oPrepV").textContent = pr.value; saveSettings(); };
}
function doneBadge(id) {
  const n = HIST.filter((h) => h.srcId === id);
  if (!n.length) return "";
  const best = Math.max(...n.map((h) => h.nota100 ?? 0));
  return `<span class="pill ${scoreClass(best || null)}">${best ? best : "✓"}</span>`;
}

routes.consec = () => {
  setTitle("Consecutiva");
  const gen = GENERATED.filter((g) => g.tipo === "consec").slice(-8).reverse();
  view.innerHTML = `
    <div class="card"><p class="muted small" style="margin:0">El app lee cada intervención con voz. Al sonar el <b>bip</b>, interpreta en primera persona al otro idioma. Tu turno termina solo tras unos segundos de silencio (o toca <b>Terminé</b>). Toma notas en papel como en el examen.</p></div>
    ${optionsBox("consec")}
    ${genBox("consec")}
    <div class="card"><h2>Banco de diálogos</h2><div class="list">
      ${[...gen, ...DIALOGOS].map((d) => `<button class="item" data-id="${d.id}"><div class="grow"><div class="t">${esc(d.titulo)}</div><div class="d">${d.turnos.length} turnos · ${d.ia ? "Generado con IA" : "Integrado"}</div></div>${doneBadge(d.id)}<span>▶</span></button>`).join("")}
    </div></div>`;
  wireOptions();
  wireGen("consec", (g) => startExercise(buildConsec(g)));
  view.querySelectorAll(".item[data-id]").forEach((b) => b.onclick = () => {
    primeAudio();
    const d = [...GENERATED, ...DIALOGOS].find((x) => x.id === b.dataset.id);
    startExercise(buildConsec(d));
  });
};
routes.simul = () => {
  setTitle("Simultánea");
  const gen = GENERATED.filter((g) => g.tipo === "simul").slice(-8).reverse();
  view.innerHTML = `
    <div class="card"><div class="note" style="margin:0">🎧 <b>Usa audífonos.</b> Sin audífonos el micrófono capta la voz del app y la evaluación sale mal.</div>
    <p class="muted small" style="margin:10px 0 0">Empieza a interpretar en cuanto entiendas la primera idea (desfase de 2–4 s). Al terminar el original, el app espera a que termines.</p></div>
    ${optionsBox("simul")}
    <div class="card"><label class="f"><span>Velocidad del orador: <b id="spdV">${S.rateES}</b>×</span><input type="range" id="spd" min="0.7" max="1.3" step="0.05" value="${S.rateES}"></label></div>
    ${genBox("simul")}
    <div class="card"><h2>Banco de discursos</h2><div class="list">
      ${[...gen, ...DISCURSOS].map((d) => `<button class="item" data-id="${d.id}"><span class="pill ${d.idioma}">${L(d.idioma)}→${L(other(d.idioma))}</span><div class="grow"><div class="t">${esc(d.titulo)}</div><div class="d">${wc(d.texto)} palabras · ${d.ia ? "IA" : "Integrado"}</div></div>${doneBadge(d.id)}<span>▶</span></button>`).join("")}
    </div></div>`;
  wireOptions();
  const spd = $("#spd");
  spd.oninput = () => { S.rateES = S.rateEN = +spd.value; $("#spdV").textContent = spd.value; saveSettings(); };
  wireGen("simul", (g) => startExercise(buildSimple("simul", g)));
  view.querySelectorAll(".item[data-id]").forEach((b) => b.onclick = () => {
    primeAudio();
    startExercise(buildSimple("simul", [...GENERATED, ...DISCURSOS].find((x) => x.id === b.dataset.id)));
  });
};
routes.vista = () => {
  setTitle("Traducción a la vista");
  const gen = GENERATED.filter((g) => g.tipo === "vista").slice(-8).reverse();
  view.innerHTML = `
    <div class="card"><p class="muted small" style="margin:0">Verás el documento con un tiempo de lectura previa; luego suena el bip y lo dices en voz alta en el otro idioma.</p></div>
    ${optionsBox("vista")}
    ${genBox("vista")}
    <div class="card"><h2>Banco de documentos</h2><div class="list">
      ${[...gen, ...VISTAS].map((d) => `<button class="item" data-id="${d.id}"><span class="pill ${d.idioma}">${L(d.idioma)}→${L(other(d.idioma))}</span><div class="grow"><div class="t">${esc(d.titulo)}</div><div class="d">${wc(d.texto)} palabras · ${d.ia ? "IA" : "Integrado"}</div></div>${doneBadge(d.id)}<span>▶</span></button>`).join("")}
    </div></div>`;
  wireOptions();
  wireGen("vista", (g) => startExercise(buildSimple("vista", g)));
  view.querySelectorAll(".item[data-id]").forEach((b) => b.onclick = () => {
    primeAudio();
    startExercise(buildSimple("vista", [...GENERATED, ...VISTAS].find((x) => x.id === b.dataset.id)));
  });
};

function buildConsec(d) {
  return { srcId: d.id, tipo: "consec", tipoLabel: "Interpretación consecutiva (diálogo de audiencia)", titulo: d.titulo, contexto: d.contexto, parts: [{ modalidad: "consecutiva", turnos: d.turnos }] };
}
function buildSimple(tipo, d) {
  return {
    srcId: d.id, tipo,
    tipoLabel: tipo === "simul" ? "Interpretación simultánea" : "Traducción a la vista",
    titulo: d.titulo, contexto: d.contexto || d.tipo_documento || "",
    parts: [{ modalidad: tipo === "simul" ? "simultanea" : "vista", idioma: d.idioma, texto: d.texto, titulo: d.titulo }]
  };
}

routes.simulacro = () => {
  setTitle("Simulacro");
  view.innerHTML = `
    <div class="card">
      <h2>Simulacro completo</h2>
      <p class="muted small">Tres partes de corrido, sin ver los textos: <b>1)</b> consecutiva (diálogo de audiencia), <b>2)</b> simultánea (con audífonos), <b>3)</b> traducción a la vista. Al final, una evaluación con la rúbrica de 10 criterios sobre 100.</p>
      <label class="f"><span>Contenido</span>
        <select id="mSrc">
          <option value="ia" ${S.apiKey ? "selected" : "disabled"}>Nuevo, generado por Claude (recomendado)</option>
          <option value="bank" ${S.apiKey ? "" : "selected"}>Del banco integrado (aleatorio)</option>
        </select></label>
      <label class="f"><span>Nivel</span><select id="mNivel"><option value="2" selected>Examen</option><option value="3">Avanzado</option></select></label>
      <button class="btn primary block" id="mGo">▶ Empezar simulacro</button>
      <div id="mOut"></div>
    </div>`;
  $("#mGo").onclick = async () => {
    primeAudio();
    const out = $("#mOut");
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    let c, s, v;
    if ($("#mSrc").value === "ia") {
      $("#mGo").disabled = true;
      out.innerHTML = `<div class="spinner"></div><p class="muted small" style="text-align:center">Claude está preparando tu examen (3 partes)…</p>`;
      try {
        const nivel = +$("#mNivel").value;
        const usados = [...GENERATED.map((x) => x.titulo), ...HIST.map((h) => h.titulo)];
        const enfoque = weakest().map(([, n]) => n).join(", ");
        const simLang = Math.random() < 0.5 ? "es" : "en";
        [c, s, v] = await Promise.all([
          generate({ settings: S, tipo: "consec", nivel, usados, enfoque }),
          generate({ settings: S, tipo: "simul", nivel, usados, idioma: simLang, enfoque }),
          generate({ settings: S, tipo: "vista", nivel, usados, idioma: other(simLang), enfoque })
        ]);
        for (const [g, t] of [[c, "consec"], [s, "simul"], [v, "vista"]]) { g.id = "g" + uid(); g.tipo = t; g.ia = true; GENERATED.push(g); }
        GENERATED = GENERATED.slice(-60); LS.set("generated", GENERATED);
      } catch (e) {
        out.innerHTML = `<div class="err">${esc(e.message)}</div>`;
        $("#mGo").disabled = false;
        return;
      }
    } else {
      c = pick(DIALOGOS); s = pick(DISCURSOS); v = pick(VISTAS.filter((x) => x.idioma !== s.idioma));
    }
    startExercise({
      srcId: "mock-" + uid(), tipo: "simulacro", tipoLabel: "Simulacro completo del examen oral (consecutiva + simultánea + a la vista)",
      titulo: `Simulacro: ${c.titulo}`, contexto: c.contexto,
      parts: [
        { modalidad: "consecutiva", turnos: c.turnos, titulo: c.titulo },
        { modalidad: "simultanea", idioma: s.idioma, texto: s.texto, titulo: s.titulo },
        { modalidad: "vista", idioma: v.idioma, texto: v.texto, titulo: v.titulo }
      ]
    }, { exam: true });
  };
};

// ====================== Motor de ejercicio ======================
class Session {
  constructor() { this.aborted = false; this.paused = false; this.skip = false; this.rec = null; this.ctrl = new AbortController(); this.waiters = []; }
  abort() { this.aborted = true; this.ctrl.abort(); A.stopSpeaking(); this.rec?.stop("abort"); this.waiters.forEach((w) => w()); }
  async gate() { while (this.paused && !this.aborted) await new Promise((r) => { this.waiters.push(r); }); this.waiters = []; }
  resume() { this.paused = false; const w = this.waiters; this.waiters = []; w.forEach((f) => f()); }
}

function stageHTML(ex, opts) {
  return `
    <div class="card">
      <div class="row" style="justify-content:space-between">
        <span class="pill" id="sPart">—</span>
        <span class="pill" id="sProg">—</span>
        <span class="pill" id="sClock">0:00</span>
      </div>
      <div class="stage">
        <div class="who" id="sWho">&nbsp;</div>
        <div class="dir" id="sDir"></div>
        <div class="state" id="sState">Preparando…</div>
        <div class="meter"><i id="sMeter"></i></div>
        <div class="controls" id="sCtl"></div>
      </div>
      <div id="sSrc"></div>
      <div class="live" id="sLive" style="display:none"></div>
    </div>
    <div class="row" style="justify-content:center">
      <button class="btn sm ghost" id="sPause">⏸ Pausar</button>
      <button class="btn sm ghost" id="sEnd">⏹ Terminar y evaluar</button>
      <button class="btn sm ghost" id="sQuit">✕ Salir sin guardar</button>
    </div>`;
}

async function startExercise(ex, { exam = false } = {}) {
  try { await ensureMic(); } catch (e) { toast(e.message, 6000); return; }
  if (current) current.abort();
  const sess = new Session();
  current = sess;
  setTitle(ex.tipo === "simulacro" ? "Simulacro en curso" : ex.titulo);
  view.innerHTML = stageHTML(ex);
  keepAwake(true);
  const t0 = Date.now();
  const clock = setInterval(() => {
    const s = Math.floor((Date.now() - t0) / 1000);
    const el = $("#sClock"); if (el) el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }, 1000);

  let finishRequested = false;
  $("#sPause").onclick = () => {
    if (sess.paused) { sess.resume(); $("#sPause").textContent = "⏸ Pausar"; }
    else { sess.paused = true; $("#sPause").textContent = "▶ Continuar"; toast("Se pausará al terminar el paso actual."); }
  };
  $("#sEnd").onclick = () => { finishRequested = true; sess.abort(); };
  $("#sQuit").onclick = () => { if (confirm("¿Salir sin guardar este ejercicio?")) { sess.abort(); clearInterval(clock); go("#home"); } };

  const ui = {
    part: (t) => { $("#sPart").textContent = t; },
    prog: (t) => { $("#sProg").textContent = t; },
    who: (t) => { $("#sWho").innerHTML = t; },
    dir: (from) => { $("#sDir").innerHTML = from ? `<span class="pill ${from}">${L(from)}</span> → <span class="pill ${other(from)}">interpreta al ${from === "es" ? "INGLÉS" : "ESPAÑOL"}</span>` : ""; },
    state: (t) => { $("#sState").innerHTML = t; },
    meter: (v) => { const m = $("#sMeter"); if (m) m.style.width = `${Math.round(v * 100)}%`; },
    ctl: (html) => { $("#sCtl").innerHTML = html; },
    src: (html) => { $("#sSrc").innerHTML = html; },
    live: (t) => { const l = $("#sLive"); if (!l) return; l.style.display = t == null ? "none" : "block"; l.textContent = t || "…"; }
  };

  const segs = [];
  try {
    for (let pi = 0; pi < ex.parts.length; pi++) {
      if (sess.aborted) break;
      const part = ex.parts[pi];
      ui.part(ex.parts.length > 1 ? `Parte ${pi + 1}/${ex.parts.length} · ${part.modalidad}` : part.modalidad);
      if (ex.parts.length > 1 && pi > 0) {
        ui.who(""); ui.dir(null); ui.src(""); ui.live(null);
        ui.state(`Siguiente: <b>${part.modalidad}</b>`);
        ui.ctl(`<button class="btn primary" id="nx">Continuar ▶</button>`);
        if (part.modalidad === "simultanea") ui.src(`<div class="note">🎧 Ponte los audífonos ahora.</div>`);
        await new Promise((r) => { $("#nx").onclick = r; sess.waiters.push(r); });
        if (sess.aborted) break;
      }
      if (part.modalidad === "consecutiva") await runConsec(part, sess, ui, segs, exam);
      else if (part.modalidad === "simultanea") await runSimul(part, sess, ui, segs, exam);
      else await runVista(part, sess, ui, segs, exam);
    }
  } catch (e) {
    console.error(e);
    toast("Error: " + e.message, 5000);
  }
  clearInterval(clock);
  keepAwake(false);
  A.stopSpeaking();
  if (current === sess) current = null;
  const valid = segs.filter((s) => s.transcripcion || s.metricas);
  if (!valid.length) {
    if (finishRequested || !sess.aborted) { toast("No se grabó ninguna respuesta."); go("#home"); }
    return;
  }
  if (sess.aborted && !finishRequested) return;
  const minutes = (Date.now() - t0) / 60000;
  await finishExercise(ex, segs, minutes);
}

async function recordTurn({ lang, sess, ui, autoStop = true, maxSec = 120, maxWaitSec = 15, silenceSec = S.silenceSec, extraButtons = "" }) {
  const rec = new A.Recorder({
    lang: recLang(lang), useAudio: S.useAudio, autoStop, silenceSec, maxWaitSec, maxSec,
    onInterim: (t) => ui.live(t), onLevel: (v) => ui.meter(v)
  });
  sess.rec = rec;
  ui.live("");
  ui.state(`<span class="dot"></span> Tu turno — habla en ${lang === "es" ? "español" : "inglés"}`);
  ui.ctl(`<button class="btn rec" id="stopBtn">✓ Terminé</button>${extraButtons}`);
  $("#stopBtn").onclick = () => rec.stop("manual");
  const res = await rec.start();
  ui.meter(0);
  sess.rec = null;
  if (res.recError && res.recError !== "no-speech" && res.recError !== "aborted") {
    toast(`Reconocimiento de voz: ${res.recError}${res.recError === "network" ? " (necesita internet)" : ""}`, 4000);
  }
  return res;
}

async function runConsec(part, sess, ui, segs, exam) {
  const turns = part.turnos;
  for (let i = 0; i < turns.length; i++) {
    await sess.gate();
    if (sess.aborted) return;
    const t = turns[i];
    ui.prog(`Turno ${i + 1}/${turns.length}`);
    ui.who(esc(t.hablante));
    ui.dir(t.idioma);
    ui.live(null);
    ui.src(!exam && S.showText ? `<div class="src">${esc(t.texto)}</div>` : "");
    let repeats = 0, res, dur;
    for (;;) {
      ui.state("🔊 Escucha…");
      ui.ctl("");
      const sp = await A.speak(t.texto, t.idioma, { rate: rateOf(t.idioma), voiceName: voiceOf(t.idioma), signal: sess.ctrl.signal });
      if (sess.aborted) return;
      dur = (sp.end - sp.start) / 1000;
      if (turns[i + 1]) A.prefetch(turns[i + 1].texto, turns[i + 1].idioma, rateOf(turns[i + 1].idioma));
      A.beep();
      let wantRepeat = false;
      const canRepeat = S.allowRepeat && repeats < 1;
      const maxSec = Math.max(40, wc(t.texto) * 1.6);
      const p = recordTurn({ lang: other(t.idioma), sess, ui, maxSec, extraButtons: canRepeat ? `<button class="btn" id="repBtn">↺ Repetir</button>` : "" });
      if (canRepeat) $("#repBtn").onclick = () => { wantRepeat = true; sess.rec?.stop("repetir"); };
      res = await p;
      if (sess.aborted && res.reason === "abort" && !res.transcript) return;
      if (wantRepeat) { repeats++; continue; }
      break;
    }
    const audioId = await A.saveAudio(uid(), res.audio);
    segs.push({
      modalidad: "consecutiva", hablante: t.hablante, idiomaOrigen: t.idioma, texto: t.texto, duracionOriginal: +dur.toFixed(1),
      transcripcion: res.transcript, metricas: { ...res.metrics, repeticiones_pedidas: repeats, fin: res.reason }, audioId
    });
    ui.state(res.transcript ? "✓ Registrado" : "⚠ No se captó voz");
    if (sess.aborted) return;
    await new Promise((r) => setTimeout(r, 700));
  }
}

async function runSimul(part, sess, ui, segs, exam) {
  await sess.gate();
  if (sess.aborted) return;
  const from = part.idioma, to = other(from);
  ui.who(esc(part.titulo || "Discurso"));
  ui.dir(from);
  ui.prog(`${wc(part.texto)} palabras`);
  ui.src(!exam && S.showText ? `<div class="src">${esc(part.texto)}</div>` : "");
  ui.state("Prepárate… comienza en 3 s");
  ui.ctl("");
  await new Promise((r) => setTimeout(r, 3000));
  if (sess.aborted) return;
  A.beep(660);
  const rec = new A.Recorder({
    lang: recLang(to), useAudio: S.useAudio, autoStop: false, maxSec: 900,
    onInterim: (t) => ui.live(t), onLevel: (v) => ui.meter(v)
  });
  sess.rec = rec;
  const pRes = rec.start();
  ui.live("");
  ui.state(`<span class="dot"></span> 🔊 Interpreta simultáneamente al ${to === "es" ? "español" : "inglés"}`);
  ui.ctl(`<button class="btn rec" id="stopBtn">✓ Terminé</button>`);
  let manual = false;
  $("#stopBtn").onclick = () => { manual = true; A.stopSpeaking(); rec.stop("manual"); };
  const sentences = A.splitSentences(part.texto);
  let ttsStart = null, ttsEnd = null;
  A.prefetch(sentences[0], from, rateOf(from));
  for (let i = 0; i < sentences.length; i++) {
    if (sess.aborted || manual) break;
    ui.prog(`Oración ${i + 1}/${sentences.length}`);
    if (sentences[i + 1]) A.prefetch(sentences[i + 1], from, rateOf(from));
    const sp = await A.speak(sentences[i], from, { rate: rateOf(from), voiceName: voiceOf(from), signal: sess.ctrl.signal });
    ttsStart ??= sp.start;
    ttsEnd = sp.end;
  }
  if (!manual && !sess.aborted) {
    ui.state(`<span class="dot"></span> Termina tu interpretación… (se cierra tras 4 s de silencio)`);
    const endWait = performance.now();
    await new Promise((r) => {
      const iv = setInterval(() => {
        const last = Math.max(rec.lastSoundAt || 0, rec.lastResultAt || 0);
        const now = performance.now();
        if (rec.stopped || (now - Math.max(last, endWait) > 4000) || now - endWait > 30000) { clearInterval(iv); r(); }
      }, 200);
    });
    rec.stop("fin");
  }
  const res = await pRes;
  sess.rec = null;
  ui.meter(0);
  const m = res.metrics;
  const segsV = rec.speechSegs || [];
  const lastSpeech = segsV.length ? rec.t0 + segsV[segsV.length - 1].e : null;
  if (ttsStart) {
    m.inicio_tras_original_s = rec.firstSpeechAt ? +((rec.firstSpeechAt - ttsStart) / 1000).toFixed(1) : null;
    m.cola_final_tras_original_s = lastSpeech && ttsEnd ? +((lastSpeech - ttsEnd) / 1000).toFixed(1) : null;
  }
  m.palabras_original = wc(part.texto);
  m.ratio_palabras = m.palabras_original ? +(m.palabras / m.palabras_original).toFixed(2) : null;
  m.fin = res.reason;
  const audioId = await A.saveAudio(uid(), res.audio);
  segs.push({
    modalidad: "simultanea", hablante: part.titulo || "", idiomaOrigen: from, texto: part.texto,
    duracionOriginal: ttsStart && ttsEnd ? +((ttsEnd - ttsStart) / 1000).toFixed(1) : null,
    transcripcion: res.transcript, metricas: m, audioId
  });
}

async function runVista(part, sess, ui, segs) {
  await sess.gate();
  if (sess.aborted) return;
  const from = part.idioma, to = other(from);
  ui.who(esc(part.titulo || "Documento"));
  ui.dir(from);
  ui.prog(`${wc(part.texto)} palabras`);
  ui.live(null);
  ui.src(`<div class="src">${esc(part.texto)}</div>`);
  let left = S.prepSec;
  if (left > 0) {
    await new Promise((r) => {
      ui.ctl(`<button class="btn primary" id="goNow">Empezar ya</button>`);
      ui.state(`📖 Lee el documento: ${left} s`);
      const iv = setInterval(() => {
        left--;
        if (left <= 0 || sess.aborted) { clearInterval(iv); r(); return; }
        ui.state(`📖 Lee el documento: ${left} s`);
      }, 1000);
      $("#goNow").onclick = () => { clearInterval(iv); r(); };
      sess.waiters.push(() => { clearInterval(iv); r(); });
    });
  }
  if (sess.aborted) return;
  A.beep();
  const res = await recordTurn({ lang: to, sess, ui, maxSec: 420, maxWaitSec: 20, silenceSec: Math.max(4, S.silenceSec + 1) });
  const audioId = await A.saveAudio(uid(), res.audio);
  segs.push({
    modalidad: "vista", hablante: part.titulo || "", idiomaOrigen: from, texto: part.texto, duracionOriginal: null,
    transcripcion: res.transcript, metricas: { ...res.metrics, palabras_original: wc(part.texto), fin: res.reason }, audioId
  });
}

// ====================== Evaluación y reporte ======================
async function finishExercise(ex, segs, minutes) {
  const rec = {
    id: uid(), date: Date.now(), tipo: ex.tipo, tipoLabel: ex.tipoLabel, titulo: ex.titulo, contexto: ex.contexto, srcId: ex.srcId,
    minutos: +minutes.toFixed(1), segmentos: segs, nota100: null, puntuaciones: null, eval: null
  };
  HIST.push(rec);
  saveHist();
  logDaily(ex.tipo === "simulacro" ? "consec" : ex.tipo, minutes);
  if (ex.tipo === "simulacro") { logDaily("simul"); logDaily("vista"); }
  if (S.apiKey && !navigator.onLine) { rec.pendingEval = true; saveHist(); toast("Sin internet: la evaluación quedó pendiente y se hará sola al conectarte.", 5000); go("#reporte/" + rec.id); }
  else if (S.apiKey) await runEvaluation(rec);
  else go("#reporte/" + rec.id);
}

async function evalRecord(rec, onProgress) {
  const r = await evaluate({ settings: S, ejercicio: rec, segmentos: rec.segmentos, onProgress });
  rec.eval = r;
  rec.puntuaciones = Object.fromEntries(CRITERIOS.map(([k]) => [k, r.puntuaciones?.[k]?.nota ?? 0]));
  rec.nota100 = Object.values(rec.puntuaciones).reduce((a, b) => a + b, 0) * 2;
  rec.pendingEval = false;
  rec.evalError = null;
  saveHist();
}

async function runEvaluation(rec) {
  setTitle("Evaluando…");
  view.innerHTML = `<div class="card" style="text-align:center"><div class="spinner"></div><h2>Claude está evaluando tu interpretación</h2><p class="muted small" id="evProg">Analizando ${rec.segmentos.length} segmento(s) con la rúbrica de 10 criterios…</p><p class="muted small">Puede tardar entre 30 s y 2 min.</p></div>`;
  try {
    await evalRecord(rec, (n) => { const p = $("#evProg"); if (p) p.textContent = `Escribiendo la evaluación… ${n} caracteres`; });
  } catch (e) {
    if (e.offline) { rec.pendingEval = true; toast("Sin internet: la evaluación quedó pendiente y se hará sola al conectarte.", 5000); }
    else rec.evalError = e.message;
    saveHist();
  }
  go("#reporte/" + rec.id);
}

// ---------- Cola de evaluaciones pendientes (se procesa al volver internet) ----------
let processing = false;
function pendingCount() { return HIST.filter((h) => h.pendingEval).length + critPendingCount(); }
async function processPending() {
  if (processing || !navigator.onLine || !S.apiKey) return;
  processing = true;
  let ok = 0;
  try {
    for (const rec of HIST.filter((h) => h.pendingEval)) {
      if (!navigator.onLine) break;
      try { await evalRecord(rec); ok++; }
      catch (e) { if (e.offline) break; rec.pendingEval = false; rec.evalError = e.message; saveHist(); }
    }
    ok += await processCritPending();
  } finally { processing = false; }
  if (ok) {
    toast(`✓ ${ok} evaluación(es) pendiente(s) completada(s). Revísalas en Progreso.`, 6000);
    if (calmScreen()) render();
  }
}
const calmScreen = () => !current && ["home", "progreso", "ajustes", "criterios"].includes((location.hash.slice(1) || "home").split("/")[0]);
window.addEventListener("online", () => { if (calmScreen()) render(); setTimeout(processPending, 1500); });
window.addEventListener("offline", () => { if (calmScreen()) render(); });

routes.reporte = async (id) => {
  const rec = HIST.find((h) => h.id === id);
  if (!rec) return go("#progreso");
  setTitle("Resultado");
  const ev = rec.eval;
  const n = rec.nota100;
  const crit = ev ? CRITERIOS.map(([k, name]) => {
    const p = ev.puntuaciones[k] || { nota: 0, comentario: "" };
    const cls = p.nota >= 5 ? "good" : p.nota >= 4 ? "warn" : "bad";
    return `<div class="crit"><span class="n">${name}</span><span class="v" style="color:var(--${cls})">${p.nota}/5</span><div class="bar"><i style="width:${p.nota * 20}%;background:var(--${cls})"></i></div><span class="c">${esc(p.comentario)}</span></div>`;
  }).join("") : "";
  const lost = n != null ? 100 - n : null;
  view.innerHTML = `
    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:flex-start">
        <div>
          <div class="muted small">${esc(rec.tipoLabel)} · ${fmtDate(rec.date)} · ${Math.round(rec.minutos)} min</div>
          <h2 style="margin:4px 0 0">${esc(rec.titulo)}</h2>
        </div>
      </div>
      ${n != null ? `
      <div class="row" style="gap:24px;margin-top:14px">
        <div><div class="big-score" style="color:var(--${scoreClass(n)})">${n}</div><div class="muted small">nota oral /100 (${n / 2}/50)</div></div>
        <div class="stat"><b>${((S.escrito + n) / 2).toFixed(1)}</b><span>promedio global con escrito ${S.escrito} (mín. 80)</span></div>
        <div class="stat"><b>${n >= 90 ? "✓" : `−${90 - n}`}</b><span>${n >= 90 ? "alcanzas la meta de 90" : "puntos para llegar a 90"}</span></div>
      </div>` : ""}
      ${rec.pendingEval ? `<div class="note">⏳ Evaluación pendiente: se hará automáticamente cuando tengas internet. Mientras, revisa abajo tus transcripciones, métricas y audios.</div>` : ""}
      ${rec.evalError ? `<div class="err">No se pudo evaluar: ${esc(rec.evalError)}</div><button class="btn primary" id="retryEv">Reintentar evaluación</button>` : ""}
      ${!ev && !rec.evalError && !rec.pendingEval ? `<div class="note">Sin evaluación de Claude (no hay API key). Abajo están tus métricas, transcripciones y audios.${S.apiKey ? "" : ` <a href="#ajustes">Agregar API key</a>`}</div>${S.apiKey ? `<button class="btn primary" id="retryEv">Evaluar ahora</button>` : ""}` : ""}
    </div>
    ${ev ? `
    <div class="card"><h2>Resumen</h2><p style="margin:0">${esc(ev.resumen)}</p>
      ${ev.prioridades?.length ? `<h3>🎯 Prioridades</h3><ol style="margin:0;padding-left:20px">${ev.prioridades.map((p) => `<li>${esc(p)}</li>`).join("")}</ol>` : ""}
      ${ev.fortalezas?.length ? `<h3>💪 Fortalezas</h3><ul style="margin:0;padding-left:20px">${ev.fortalezas.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
      ${ev.consejo_proxima_practica ? `<h3>Próxima práctica</h3><p style="margin:0">${esc(ev.consejo_proxima_practica)}</p>` : ""}
    </div>
    <div class="card"><h2>Rúbrica (10 criterios × 5)</h2>${crit}${lost ? `<p class="muted small">Perdiste ${lost / 2} de 50 puntos. Para 90 puedes perder como máximo 5.</p>` : ""}</div>
    ${ev.terminos_a_estudiar?.length ? `<div class="card"><h2>Términos a estudiar</h2><div class="tablewrap"><table class="e"><tr><th>Término</th><th>Traducción</th></tr>${ev.terminos_a_estudiar.map((t) => `<tr><td>${esc(t.termino)}</td><td>${esc(t.traduccion)}</td></tr>`).join("")}</table></div><button class="btn sm" id="addTerms" style="margin-top:10px">＋ Agregar a mis tarjetas</button></div>` : ""}
    ` : ""}
    <div class="card"><h2>Segmento por segmento</h2>${rec.segmentos.map((s, i) => segHTML(s, i, ev)).join("")}</div>
    <div class="row" style="justify-content:center;margin-bottom:24px">
      <button class="btn" onclick="location.hash='#home'">⌂ Inicio</button>
      ${rec.srcId && !String(rec.srcId).startsWith("mock") ? `<button class="btn primary" id="again">↺ Repetir este ejercicio</button>` : ""}
    </div>`;
  // audios
  for (const [i, s] of rec.segmentos.entries()) {
    if (!s.audioId) continue;
    const blob = await A.getAudio(s.audioId);
    const slot = $(`#aud${i}`);
    if (blob && slot) { const a = document.createElement("audio"); a.controls = true; a.src = URL.createObjectURL(blob); a.style.width = "100%"; slot.appendChild(a); }
  }
  view.querySelectorAll("[data-play]").forEach((b) => b.onclick = () => {
    const s = rec.segmentos[+b.dataset.play];
    A.stopSpeaking();
    A.speak(b.dataset.kind === "model" ? b.dataset.text : s.texto, b.dataset.kind === "model" ? other(s.idiomaOrigen) : s.idiomaOrigen, { rate: 1, voiceName: voiceOf(b.dataset.kind === "model" ? other(s.idiomaOrigen) : s.idiomaOrigen) });
  });
  const re = $("#retryEv"); if (re) re.onclick = () => { rec.evalError = null; runEvaluation(rec); };
  const at = $("#addTerms"); if (at) at.onclick = () => {
    for (const t of ev.terminos_a_estudiar) {
      const isEs = /[áéíóúñ¿¡]/i.test(t.termino) || rec.segmentos.every((s) => s.idiomaOrigen === "es");
      const pair = isEs ? [t.traduccion, t.termino, "Mis términos"] : [t.termino, t.traduccion, "Mis términos"];
      if (!MYTERMS.some((m) => m[0] === pair[0])) MYTERMS.push(pair);
    }
    LS.set("myterms", MYTERMS);
    toast("Agregados a «Mis términos» en Terminología.");
    at.disabled = true;
  };
  const ag = $("#again"); if (ag) ag.onclick = () => {
    primeAudio();
    const all = [...GENERATED, ...DIALOGOS, ...DISCURSOS, ...VISTAS];
    const d = all.find((x) => x.id === rec.srcId);
    if (!d) return toast("Ejercicio no disponible.");
    startExercise(rec.tipo === "consec" ? buildConsec(d) : buildSimple(rec.tipo, d));
  };
};

function metricChips(m) {
  if (!m) return "";
  const c = [];
  const add = (label, val, cls = "") => val != null && c.push(`<span class="pill ${cls}">${label}: ${val}</span>`);
  add("Inicio", m.latencia_inicio_s != null ? m.latencia_inicio_s + " s" : null, m.latencia_inicio_s > 4 ? "warn" : "");
  add("Duración", m.duracion_total_s + " s");
  add("Hablando", m.tiempo_hablando_s != null ? m.tiempo_hablando_s + " s" : null);
  add("Ritmo", m.palabras_por_minuto != null ? m.palabras_por_minuto + " ppm" : null, m.palabras_por_minuto && m.palabras_por_minuto < 90 ? "warn" : "");
  add("Pausas >1s", m.pausas_mayores_1s, m.pausas_mayores_1s > 3 ? "warn" : "");
  add("Pausa máx", m.pausa_mas_larga_s ? m.pausa_mas_larga_s + " s" : null, m.pausa_mas_larga_s > 3 ? "bad" : "");
  add("Muletillas", m.muletillas_detectadas || null, "warn");
  add("Autocorrecciones", m.autocorrecciones || null, "warn");
  add("Claridad (ASR)", m.confianza_asr != null ? Math.round(m.confianza_asr * 100) + "%" : null, m.confianza_asr != null && m.confianza_asr < 0.8 ? "bad" : "");
  add("Repeticiones", m.repeticiones_pedidas || null, "warn");
  add("Desfase inicial", m.inicio_tras_original_s != null ? m.inicio_tras_original_s + " s" : null, m.inicio_tras_original_s > 5 ? "warn" : "");
  add("Cola final", m.cola_final_tras_original_s != null ? m.cola_final_tras_original_s + " s" : null, m.cola_final_tras_original_s > 8 ? "warn" : "");
  add("Palabras", m.palabras_original ? `${m.palabras}/${m.palabras_original}` : m.palabras);
  return `<div class="row" style="gap:6px;margin:8px 0">${c.join("")}</div>`;
}

function segHTML(s, i, ev) {
  const e = ev?.segmentos?.find((x) => x.indice === i);
  return `
  <details ${i === 0 ? "open" : ""}>
    <summary>${i + 1}. ${esc(s.modalidad)} · ${esc(s.hablante || "")} <span class="pill ${s.idiomaOrigen}">${L(s.idiomaOrigen)}→${L(other(s.idiomaOrigen))}</span> ${e?.fidelidad ? `<span class="pill">${esc(e.fidelidad)}</span>` : ""}</summary>
    <h3>Original <button class="btn sm ghost" data-play="${i}" data-kind="orig">🔊</button></h3>
    <div class="src">${esc(s.texto)}</div>
    <h3>Tu versión (transcripción automática)</h3>
    <div class="src">${esc(s.transcripcion || "(no se captó voz)")}</div>
    <div id="aud${i}" style="margin-top:8px"></div>
    ${metricChips(s.metricas)}
    ${e?.errores?.length ? `<h3>Errores</h3><div class="tablewrap"><table class="e"><tr><th>Tipo</th><th>Original</th><th>Dijiste</th><th>Mejor</th></tr>${e.errores.map((x) => `<tr><td><span class="pill">${esc(x.tipo)}</span></td><td>${esc(x.original)}</td><td>${esc(x.dijiste)}</td><td><b>${esc(x.sugerido)}</b><div class="muted small">${esc(x.explicacion)}</div></td></tr>`).join("")}</table></div>` : e ? `<div class="ok">Sin errores relevantes en este segmento.</div>` : ""}
    ${e?.version_modelo ? `<h3>Versión modelo <button class="btn sm ghost" data-play="${i}" data-kind="model" data-text="${esc(e.version_modelo)}">🔊</button></h3><div class="src">${esc(e.version_modelo)}</div>` : ""}
  </details>`;
}

// ====================== Drill: números, nombres y fechas ======================
routes.numeros = () => {
  setTitle("Números y nombres");
  view.innerHTML = `
    <div class="card">
      <p class="muted small" style="margin-top:0">El app dice una frase cargada de cifras, fechas, montos y nombres. Al bip, interprétala completa al otro idioma. Se corrige al instante y sin internet de IA.</p>
      <label class="f"><span>Dirección</span><select id="nDir"><option value="mix">Mixto</option><option value="en">Inglés → español</option><option value="es">Español → inglés</option></select></label>
      <label class="f"><span>Cantidad de frases</span><select id="nCount"><option>10</option><option>15</option><option>20</option></select></label>
      <button class="btn primary block" id="nGo">▶ Empezar ronda</button>
    </div>`;
  $("#nGo").onclick = async () => {
    primeAudio();
    try { await ensureMic(); } catch (e) { return toast(e.message, 6000); }
    runNumeros($("#nDir").value, +$("#nCount").value);
  };
};

async function runNumeros(dir, count) {
  const sess = new Session();
  current = sess;
  keepAwake(true);
  const t0 = Date.now();
  view.innerHTML = stageHTML();
  $("#sPause").remove(); $("#sEnd").textContent = "⏹ Terminar ronda";
  $("#sEnd").onclick = () => sess.abort();
  $("#sQuit").onclick = () => { sess.abort(); go("#home"); };
  const ui = {
    state: (t) => $("#sState").innerHTML = t, ctl: (h) => $("#sCtl").innerHTML = h, live: (t) => { const l = $("#sLive"); l.style.display = t == null ? "none" : "block"; l.textContent = t || "…"; },
    meter: (v) => { const m = $("#sMeter"); if (m) m.style.width = `${v * 100}%`; }, src: (h) => $("#sSrc").innerHTML = h
  };
  $("#sPart").textContent = "Números, nombres y fechas";
  let ok = 0, total = 0;
  const log = [];
  for (let i = 0; i < count && !sess.aborted; i++) {
    const lang = dir === "mix" ? (i % 2 ? "es" : "en") : dir;
    const item = makeItem(lang);
    $("#sProg").textContent = `${i + 1}/${count}`;
    $("#sWho").textContent = `Aciertos: ${ok}/${total}`;
    $("#sDir").innerHTML = `<span class="pill ${lang}">${L(lang)}</span> → <span class="pill ${other(lang)}">${L(other(lang))}</span>`;
    ui.src(""); ui.live(null); ui.ctl("");
    ui.state("🔊 Escucha…");
    await A.speak(item.text, lang, { rate: rateOf(lang), voiceName: voiceOf(lang), signal: sess.ctrl.signal });
    if (sess.aborted) break;
    A.beep();
    const res = await recordTurn({ lang: other(lang), sess, ui, maxSec: 40, maxWaitSec: 10, silenceSec: 2.5 });
    if (sess.aborted && !res.transcript) break;
    const c = checkItem(item, res.transcript);
    ok += c.okCount; total += c.total;
    log.push({ item, transcript: res.transcript, c });
    ui.state(c.okCount === c.total ? "✅ ¡Todo correcto!" : `❌ ${c.okCount}/${c.total} datos correctos`);
    ui.src(`<div class="src small"><b>Original:</b> ${esc(item.text)}<br><b>Dijiste:</b> ${esc(res.transcript || "(nada)")}</div>
      <div class="row" style="gap:6px;margin-top:8px">${c.checks.map((k) => `<span class="pill ${k.ok ? "good" : "bad"}">${k.ok ? "✓" : "✗"} ${esc(k.label)}</span>`).join("")}</div>`);
    ui.live(null);
    ui.ctl(`<button class="btn primary" id="nxt">Siguiente ▶</button>`);
    await new Promise((r) => {
      const to = setTimeout(r, c.okCount === c.total ? 1800 : 60000);
      $("#nxt").onclick = () => { clearTimeout(to); r(); };
      sess.waiters.push(() => { clearTimeout(to); r(); });
    });
  }
  keepAwake(false);
  current = null;
  if (!total) return go("#numeros");
  const pct = Math.round((ok / total) * 100);
  const min = (Date.now() - t0) / 60000;
  logDaily("numeros", min);
  HIST.push({ id: uid(), date: Date.now(), tipo: "numeros", tipoLabel: "Drill de números, nombres y fechas", titulo: `Números: ${pct}% (${ok}/${total})`, minutos: +min.toFixed(1), drillPct: pct, segmentos: [] });
  saveHist();
  setTitle("Resultado");
  view.innerHTML = `
    <div class="card" style="text-align:center"><div class="big-score" style="color:var(--${pct >= 95 ? "good" : pct >= 85 ? "warn" : "bad"})">${pct}%</div><p class="muted">${ok} de ${total} datos exactos. En el examen, cada cifra o nombre alterado cuesta puntos en «Números, nombres y fechas».</p>
    <div class="row" style="justify-content:center"><button class="btn primary" onclick="location.hash='#numeros'">↺ Otra ronda</button><button class="btn" onclick="location.hash='#home'">⌂ Inicio</button></div></div>
    <div class="card"><h2>Fallos</h2>${log.filter((l) => l.c.okCount < l.c.total).map((l) => `<div class="src small" style="margin-bottom:8px"><b>${esc(l.item.text)}</b><br>Dijiste: ${esc(l.transcript || "(nada)")}<br>${l.c.checks.filter((k) => !k.ok).map((k) => `<span class="pill bad">✗ ${esc(k.label)}</span>`).join(" ")}</div>`).join("") || `<div class="ok">¡Sin fallos!</div>`}</div>`;
}

// ====================== Drill: terminología ======================
function decks() {
  return {
    glosario: GLOSARIO.map(([en, es, cat]) => ({ en, es, cat })),
    modismos: MODISMOS.map(([a, b, cat]) => (cat === "Dominicano" ? { en: b, es: a, cat, srcLang: "es" } : { en: a, es: b, cat, srcLang: "en" })),
    mios: MYTERMS.map(([en, es, cat]) => ({ en, es, cat }))
  };
}
routes.terminos = () => {
  setTitle("Terminología");
  const cats = [...new Set(GLOSARIO.map((g) => g[2]))];
  view.innerHTML = `
    <div class="card">
      <p class="muted small" style="margin-top:0">El app dice el término; tú lo dices en el otro idioma. Se priorizan los que fallas.</p>
      <label class="f"><span>Mazo</span><select id="tDeck"><option value="glosario">Glosario jurídico (${GLOSARIO.length})</option><option value="modismos">Modismos y expresiones (${MODISMOS.length})</option><option value="mios">Mis términos (${MYTERMS.length})</option></select></label>
      <label class="f"><span>Categoría</span><select id="tCat"><option value="">Todas</option>${cats.map((c) => `<option>${c}</option>`).join("")}</select></label>
      <label class="f"><span>Dirección</span><select id="tDir"><option value="mix">Mixto</option><option value="en">Inglés → español</option><option value="es">Español → inglés</option></select></label>
      <label class="f"><span>Tarjetas</span><select id="tCount"><option>15</option><option>25</option><option>40</option></select></label>
      <button class="btn primary block" id="tGo">▶ Empezar</button>
    </div>
    <div class="card"><h2>Consultar glosario</h2><input type="search" id="tQ" placeholder="Buscar en inglés o español…"><div id="tRes" class="tablewrap"></div></div>`;
  const showRes = () => {
    const q = $("#tQ").value.toLowerCase().trim();
    const all = [...decks().glosario, ...decks().modismos, ...decks().mios];
    const f = (q ? all.filter((d) => (d.en + " " + d.es).toLowerCase().includes(q)) : all).slice(0, 60);
    $("#tRes").innerHTML = `<table class="e"><tr><th>Inglés</th><th>Español</th><th></th></tr>${f.map((d) => `<tr><td>${esc(d.en.replaceAll("|", " / "))}</td><td>${esc(d.es.replaceAll("|", " / "))}</td><td><span class="pill">${esc(d.cat)}</span></td></tr>`).join("")}</table>`;
  };
  $("#tQ").oninput = showRes;
  showRes();
  $("#tGo").onclick = async () => {
    primeAudio();
    try { await ensureMic(); } catch (e) { return toast(e.message, 6000); }
    let deck = decks()[$("#tDeck").value];
    const cat = $("#tCat").value;
    if (cat && $("#tDeck").value === "glosario") deck = deck.filter((d) => d.cat === cat);
    if (!deck.length) return toast("Ese mazo está vacío.");
    runTerminos(deck, $("#tDir").value, +$("#tCount").value);
  };
};

async function runTerminos(deck, dir, count) {
  const key = (c) => c.en.split("|")[0];
  const weight = (c) => { const s = TERMS[key(c)]; if (!s) return 3; return 1 + s.fail * 2 - Math.min(s.ok, 3) * 0.5 + Math.random(); };
  const cards = [...deck].sort((a, b) => weight(b) - weight(a) + (Math.random() - 0.5)).slice(0, count);
  const sess = new Session();
  current = sess;
  keepAwake(true);
  const t0 = Date.now();
  view.innerHTML = stageHTML();
  $("#sPause").remove(); $("#sEnd").textContent = "⏹ Terminar";
  $("#sEnd").onclick = () => sess.abort();
  $("#sQuit").onclick = () => { sess.abort(); go("#home"); };
  $("#sPart").textContent = "Terminología";
  const ui = {
    state: (t) => $("#sState").innerHTML = t, ctl: (h) => $("#sCtl").innerHTML = h, live: (t) => { const l = $("#sLive"); l.style.display = t == null ? "none" : "block"; l.textContent = t || "…"; },
    meter: (v) => { const m = $("#sMeter"); if (m) m.style.width = `${v * 100}%`; }, src: (h) => $("#sSrc").innerHTML = h
  };
  let ok = 0, n = 0;
  const missed = [];
  for (let i = 0; i < cards.length && !sess.aborted; i++) {
    const c = cards[i];
    const from = c.srcLang && dir === "mix" ? c.srcLang : dir === "mix" ? (Math.random() < 0.5 ? "en" : "es") : dir;
    const to = other(from);
    const prompt = c[from].split("|")[0];
    const answers = c[to].split("|");
    $("#sProg").textContent = `${i + 1}/${cards.length}`;
    $("#sWho").textContent = `Aciertos ${ok}/${n} · ${c.cat}`;
    $("#sDir").innerHTML = `<span class="pill ${from}">${L(from)}</span> → <span class="pill ${to}">${L(to)}</span>`;
    ui.src(`<div class="flash">${esc(prompt)}</div>`);
    ui.live(null); ui.ctl("");
    ui.state("🔊");
    await A.speak(prompt, from, { rate: rateOf(from), voiceName: voiceOf(from), signal: sess.ctrl.signal });
    if (sess.aborted) break;
    A.beep(990, 90);
    const pRec = recordTurn({ lang: to, sess, ui, maxSec: 12, maxWaitSec: 7, silenceSec: 1.6, extraButtons: `<button class="btn" id="dk">No sé</button>` });
    $("#dk").onclick = () => sess.rec?.stop("no-se");
    const res = await pRec;
    if (sess.aborted && !res.transcript) break;
    let m = termMatch(res.transcript, answers);
    n++;
    const show = (good) => {
      ui.state(good ? "✅ Correcto" : "❌");
      ui.src(`<div class="flash">${esc(prompt)}</div><div class="src" style="text-align:center"><b>${esc(answers.join(" / "))}</b><br><span class="muted small">Dijiste: ${esc(res.transcript || "(nada)")}</span></div>`);
    };
    show(m.ok);
    const s = (TERMS[key(c)] ||= { ok: 0, fail: 0 });
    ui.ctl(m.ok ? `<button class="btn" id="fix">Marcar como fallo</button><button class="btn primary" id="nxt">Siguiente ▶</button>` : `<button class="btn" id="fix">Lo dije bien ✓</button><button class="btn primary" id="nxt">Siguiente ▶</button>`);
    A.speak(answers[0], to, { rate: rateOf(to), voiceName: voiceOf(to), signal: sess.ctrl.signal });
    let verdict = m.ok;
    await new Promise((r) => {
      const to2 = setTimeout(r, m.ok ? 1800 : 60000);
      $("#fix").onclick = () => { verdict = !verdict; show(verdict); $("#fix").disabled = true; clearTimeout(to2); };
      $("#nxt").onclick = () => { clearTimeout(to2); r(); };
      sess.waiters.push(() => { clearTimeout(to2); r(); });
    });
    if (verdict) { ok++; s.ok++; s.fail = Math.max(0, s.fail - 1); } else { s.fail++; missed.push(c); }
    s.last = Date.now();
    LS.set("terms", TERMS);
  }
  keepAwake(false);
  current = null;
  if (!n) return go("#terminos");
  const min = (Date.now() - t0) / 60000;
  logDaily("terminos", min);
  const pct = Math.round((ok / n) * 100);
  HIST.push({ id: uid(), date: Date.now(), tipo: "terminos", tipoLabel: "Drill de terminología", titulo: `Terminología: ${pct}% (${ok}/${n})`, minutos: +min.toFixed(1), drillPct: pct, segmentos: [] });
  saveHist();
  setTitle("Resultado");
  view.innerHTML = `
    <div class="card" style="text-align:center"><div class="big-score" style="color:var(--${pct >= 90 ? "good" : pct >= 75 ? "warn" : "bad"})">${pct}%</div><p class="muted">${ok} de ${n} correctos.</p>
    <div class="row" style="justify-content:center"><button class="btn primary" onclick="location.hash='#terminos'">↺ Otra ronda</button><button class="btn" onclick="location.hash='#home'">⌂ Inicio</button></div></div>
    ${missed.length ? `<div class="card"><h2>Repasa</h2><table class="e"><tr><th>Inglés</th><th>Español</th></tr>${missed.map((c) => `<tr><td>${esc(c.en.replaceAll("|", " / "))}</td><td>${esc(c.es.replaceAll("|", " / "))}</td></tr>`).join("")}</table></div>` : ""}`;
}

// ====================== Progreso ======================
routes.progreso = () => {
  setTitle("Progreso");
  const ev = evaluated();
  const a = avgCriteria(5);
  const totalMin = Object.values(DAILY).reduce((s, d) => s + (d.min || 0), 0);
  const chart = ev.length >= 2 ? lineChart(ev.slice(-20).map((h) => h.nota100)) : `<p class="muted small">Completa al menos 2 ejercicios evaluados para ver la gráfica.</p>`;
  view.innerHTML = `
    <div class="card"><div class="stats">
      <div class="stat"><b>${ev.length}</b><span>ejercicios evaluados</span></div>
      <div class="stat"><b>${ev.length ? Math.max(...ev.map((h) => h.nota100)) : "—"}</b><span>mejor nota</span></div>
      <div class="stat"><b>${Math.round(totalMin)}</b><span>minutos practicados</span></div>
      <div class="stat"><b>${streak()}🔥</b><span>racha de días</span></div>
    </div></div>
    <div class="card"><h2>Nota oral (últimos 20)</h2>${chart}</div>
    ${a ? `<div class="card"><h2>Promedio por criterio (últimos 5)</h2>${CRITERIOS.map(([k, name]) => {
      const v = a[k]; if (v == null) return "";
      const cls = v >= 4.7 ? "good" : v >= 4 ? "warn" : "bad";
      return `<div class="crit"><span class="n">${name}</span><span class="v" style="color:var(--${cls})">${v.toFixed(1)}</span><div class="bar"><i style="width:${v * 20}%;background:var(--${cls})"></i></div></div>`;
    }).join("")}</div>` : ""}
    ${critSummaryHTML()}
    <div class="card"><h2>Historial</h2><div class="list">
      ${[...HIST].reverse().slice(0, 80).map((h) => `<button class="item" data-id="${h.id}" ${h.segmentos?.length ? "" : "disabled style='cursor:default'"}><div class="grow"><div class="t">${esc(h.titulo)}</div><div class="d">${esc(h.tipoLabel)} · ${fmtDate(h.date)} · ${Math.round(h.minutos || 0)} min</div></div>${h.nota100 != null ? `<span class="pill ${scoreClass(h.nota100)}">${h.nota100}</span>` : h.pendingEval ? `<span class="pill warn">⏳ pendiente</span>` : h.drillPct != null ? `<span class="pill">${h.drillPct}%</span>` : `<span class="pill">sin nota</span>`}</button>`).join("") || `<p class="muted">Aún no hay práctica registrada.</p>`}
    </div></div>
    <div class="card"><h2>Respaldo</h2><p class="muted small">El progreso se guarda en este dispositivo. Exporta para pasarlo entre la PC y el celular (los audios no se incluyen).</p>
      <div class="row"><button class="btn sm" id="exp">⬇ Exportar</button><label class="btn sm">⬆ Importar<input type="file" id="imp" accept="application/json" hidden></label></div></div>`;
  view.querySelectorAll(".item[data-id]").forEach((b) => b.onclick = () => { if (!b.disabled) go("#reporte/" + b.dataset.id); });
  $("#exp").onclick = () => {
    const data = { v: 1, exported: Date.now(), history: HIST, terms: TERMS, myterms: MYTERMS, daily: DAILY, generated: GENERATED };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }));
    a.download = `interpjud-progreso-${today()}.json`;
    a.click();
  };
  $("#imp").onchange = async (e) => {
    try {
      const d = JSON.parse(await e.target.files[0].text());
      const ids = new Set(HIST.map((h) => h.id));
      HIST = [...HIST, ...(d.history || []).filter((h) => !ids.has(h.id))].sort((a, b) => a.date - b.date);
      saveHist();
      TERMS = { ...(d.terms || {}), ...TERMS }; LS.set("terms", TERMS);
      for (const t of d.myterms || []) if (!MYTERMS.some((m) => m[0] === t[0])) MYTERMS.push(t);
      LS.set("myterms", MYTERMS);
      for (const [k, v] of Object.entries(d.daily || {})) DAILY[k] ||= v;
      LS.set("daily", DAILY);
      const gids = new Set(GENERATED.map((g) => g.id));
      GENERATED = [...GENERATED, ...(d.generated || []).filter((g) => !gids.has(g.id))].slice(-60); LS.set("generated", GENERATED);
      toast("Progreso importado.");
      render();
    } catch { toast("Archivo inválido."); }
  };
};

function lineChart(vals) {
  const w = 600, h = 200, p = 28;
  const x = (i) => p + (i * (w - 2 * p)) / Math.max(1, vals.length - 1);
  const y = (v) => h - p - ((v - 40) / 60) * (h - 2 * p);
  const pts = vals.map((v, i) => `${x(i)},${y(Math.max(40, v))}`).join(" ");
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="Evolución de la nota">
    ${[50, 70, 90, 100].map((g) => `<line x1="${p}" x2="${w - p}" y1="${y(g)}" y2="${y(g)}" stroke="${g === 90 ? "var(--good)" : "var(--border)"}" stroke-dasharray="${g === 90 ? "5 4" : "0"}"/><text x="2" y="${y(g) + 4}">${g}</text>`).join("")}
    <polyline points="${pts}" fill="none" stroke="var(--primary)" stroke-width="2.5"/>
    ${vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(Math.max(40, v))}" r="4" fill="var(--${scoreClass(v)})"/>`).join("")}
  </svg>`;
}

// ====================== Ajustes ======================
routes.ajustes = async () => {
  setTitle("Ajustes");
  await A.loadVoices();
  const vopts = (lang, sel) => `<option value="">Automática (${lang === "en" ? "inglés americano" : "español neutro"})</option>` + A.accentVoices(lang).map((v) => `<option ${v.name === sel ? "selected" : ""} value="${esc(v.name)}">${esc(v.name)} (${v.lang})</option>`).join("");
  view.innerHTML = `
    <div class="card"><h2>Claude (evaluación y ejercicios nuevos)</h2>
      <label class="f"><span>API key de Anthropic</span><input type="password" id="kKey" value="${esc(S.apiKey)}" placeholder="sk-ant-…" autocomplete="off"></label>
      <p class="muted small" style="margin-top:-4px">Se guarda solo en este dispositivo. Créala en <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a> (Settings → API Keys) y recarga crédito en Billing.</p>
      <label class="f"><span>Modelo</span><select id="kModel">${MODELS.map((m) => `<option value="${m.id}" ${m.id === S.model ? "selected" : ""}>${m.label}</option>`).join("")}</select></label>
      <div class="row"><button class="btn sm" id="kTest">Probar conexión</button><span id="kOut" class="small"></span></div>
    </div>
    <div class="card"><h2>Examen</h2>
      <div class="grid2">
        <label class="f"><span>Nota del escrito</span><input type="number" id="eEsc" min="0" max="100" value="${S.escrito}"></label>
        <label class="f"><span>Fecha de tu oral (si ya la sabes)</span><input type="date" id="eDate" value="${esc(S.examDate)}"></label>
      </div>
    </div>
    <div class="card"><h2>Voces del app</h2>
      <label class="f"><span>Motor de voz</span><select id="tProv">
        <option value="browser" ${S.ttsProvider !== "google" ? "selected" : ""}>Voces del navegador (gratis, calidad variable)</option>
        <option value="google" ${S.ttsProvider === "google" ? "selected" : ""}>Google Cloud – voces naturales (recomendado)</option>
      </select></label>
      <div id="gBox" style="display:${S.ttsProvider === "google" ? "block" : "none"}">
        <label class="f"><span>API key de Google Cloud (Text-to-Speech)</span><input type="password" id="gKey" value="${esc(S.googleKey)}" placeholder="AIza…" autocomplete="off"></label>
        <details style="margin:0 0 10px"><summary class="small">Cómo obtenerla (5 min, gratis hasta 1 millón de caracteres al mes)</summary>
          <ol class="small" style="padding-left:20px;margin:8px 0">
            <li>Entra a <a href="https://console.cloud.google.com/" target="_blank" rel="noopener">console.cloud.google.com</a> con tu cuenta de Google y crea un proyecto (p. ej. «interpjud»).</li>
            <li>Activa la facturación (pide tarjeta, pero el uso de práctica cabe en el nivel gratis).</li>
            <li>Busca <b>Cloud Text-to-Speech API</b> y pulsa <b>Habilitar</b>.</li>
            <li>Ve a <b>APIs y servicios → Credenciales → Crear credenciales → Clave de API</b>.</li>
            <li>En la clave: <b>Restricciones de API</b> → solo «Cloud Text-to-Speech API»; <b>Restricciones de aplicación</b> → sitios web → <code>jamaroaleman-dev.github.io/*</code>.</li>
            <li>Copia la clave y pégala aquí. Repite el paso en el celular (o pégala ahí también).</li>
          </ol></details>
        <label class="f"><span>Voz natural en inglés (americano)</span><select id="gEN">${A.GOOGLE_VOICES.en.map(([id, l]) => `<option value="${id}" ${id === S.gVoiceEN ? "selected" : ""}>${l}</option>`).join("")}</select></label>
        <label class="f"><span>Voz natural en español (neutro)</span><select id="gES">${A.GOOGLE_VOICES.es.map(([id, l]) => `<option value="${id}" ${id === S.gVoiceES ? "selected" : ""}>${l}</option>`).join("")}</select></label>
      </div>
      <div id="bBox" style="display:${S.ttsProvider === "google" ? "none" : "block"}">
      ${!A.hasTTS ? `<div class="err">Este navegador no tiene síntesis de voz.</div>` : ""}
      <label class="f"><span>Voz en inglés</span><select id="vEN">${vopts("en", S.voiceEN)}</select></label>
      <label class="f"><span>Voz en español</span><select id="vES">${vopts("es", S.voiceES)}</select></label>
      <p class="muted small">Gratis y más naturales: en PC abre el app en <b>Microsoft Edge</b> y elige una voz «Online (Natural)» (Aria, Jenny, Guy / Paloma, Alonso).</p>
      </div>
      <label class="f"><span>Velocidad inglés: <b id="rENv">${S.rateEN}</b>×</span><input type="range" id="rEN" min="0.7" max="1.4" step="0.05" value="${S.rateEN}"></label>
      <label class="f"><span>Velocidad español: <b id="rESv">${S.rateES}</b>×</span><input type="range" id="rES" min="0.7" max="1.4" step="0.05" value="${S.rateES}"></label>
      <div class="row"><button class="btn sm" id="tEN">🔊 Probar inglés</button><button class="btn sm" id="tES">🔊 Probar español</button><span class="small" id="tOut"></span></div>
    </div>
    <div class="card"><h2>Micrófono y reconocimiento</h2>
      ${!A.hasRecognition ? `<div class="err">Este navegador no tiene reconocimiento de voz. Usa Chrome, Edge o Safari.</div>` : ""}
      <div class="grid2">
        <label class="f"><span>Reconocer español como</span><select id="lES">${["es-DO", "es-US", "es-MX", "es-ES", "es-419"].map((l) => `<option ${l === S.recES ? "selected" : ""}>${l}</option>`).join("")}</select></label>
        <label class="f"><span>Reconocer inglés como</span><select id="lEN">${["en-US", "en-GB", "en-CA", "en-JM"].map((l) => `<option ${l === S.recEN ? "selected" : ""}>${l}</option>`).join("")}</select></label>
      </div>
      <label class="check"><input type="checkbox" id="mAudio" ${S.useAudio ? "checked" : ""}> Grabar audio para volver a escucharme y medir pausas</label>
      <p class="muted small" style="margin-top:-4px">En algunos Android, grabar audio y reconocer voz a la vez no funciona. Si la transcripción sale vacía, desactiva esta opción.</p>
      <div class="row"><button class="btn sm" id="mTest">🎙️ Probar micrófono (inglés)</button><button class="btn sm" id="mTestEs">🎙️ Probar (español)</button></div>
      <div class="meter"><i id="mMeter"></i></div>
      <div class="live" id="mLive" style="display:none"></div>
    </div>
    <div class="card"><h2>📴 Uso sin internet</h2>
      <p class="small" style="margin-top:0">${navigator.serviceWorker?.controller ? "✓ El app está guardada en este dispositivo y abre sin internet." : "Abre el app una vez con internet desde el enlace publicado para que quede guardada en el dispositivo."}</p>
      <h3>1. Voces naturales sin internet</h3>
      ${S.ttsProvider === "google" && S.googleKey
        ? `<p class="muted small">Descarga una sola vez el audio de todo el banco (diálogos, discursos, pasajes, frases y términos) con tu voz natural actual: <b id="oCount">calculando…</b>. Lo que no esté descargado (cifras aleatorias, material nuevo) usará la voz del teléfono.</p>
           <button class="btn sm" id="oTTS">⬇ Descargar voces para usar sin internet</button><div class="bar" style="margin-top:8px"><i id="oBar" style="width:0"></i></div><p class="small" id="oOut"></p>`
        : `<p class="muted small">Sin internet se usa la voz del teléfono. Para tener la voz natural sin conexión, activa Google Cloud arriba y vuelve aquí para descargarla.</p>`}
      <h3>2. Reconocimiento de voz sin internet</h3>
      ${A.localASRSupported
        ? `<p class="muted small">Tu navegador puede reconocer la voz en el dispositivo. Descarga los idiomas:</p><p class="small" id="aStat">Estado: comprobando…</p><button class="btn sm" id="aInst">⬇ Descargar reconocimiento (inglés y español)</button>`
        : `<p class="muted small">Este navegador no anuncia reconocimiento en el dispositivo. En Android puede funcionar igual si descargas los idiomas en el teléfono: <b>Ajustes → Google → Ajustes de las apps de Google → Búsqueda, Asistente y voz → Voz → Reconocimiento de voz sin conexión</b> → descarga «English (US)» y «Español (Estados Unidos)». Luego activa el modo avión y usa «Probar micrófono» arriba para confirmarlo.</p>`}
      <p class="muted small">Si sin internet no se obtiene transcripción, el app igual graba tu audio y mide pausas y ritmo, pero esa respuesta no podrá evaluarla Claude.</p>
      <h3>3. Evaluaciones pendientes</h3>
      <p class="small"><b id="pCount">${pendingCount()}</b> pendiente(s). Se evalúan solas al volver internet.</p>
      <button class="btn sm" id="pNow" ${pendingCount() && navigator.onLine ? "" : "disabled"}>Evaluar pendientes ahora</button>
    </div>
    <div class="card"><h2>Apariencia</h2>
      <select id="theme"><option value="">Automática</option><option value="light">Clara</option><option value="dark">Oscura</option></select>
    </div>
    <p class="muted small" style="text-align:center">InterpJud Oral · herramienta personal de práctica. No es un producto oficial del Poder Judicial ni de la ENJ.</p>`;
  const bind = (id, k, f = (el) => el.value) => { $(id).onchange = () => { S[k] = f($(id)); saveSettings(); }; };
  bind("#kKey", "apiKey", (el) => el.value.trim());
  bind("#kModel", "model");
  bind("#eEsc", "escrito", (el) => Math.max(0, Math.min(100, +el.value || 0)));
  bind("#eDate", "examDate");
  bind("#vES", "voiceES"); bind("#vEN", "voiceEN");
  bind("#lES", "recES"); bind("#lEN", "recEN");
  bind("#mAudio", "useAudio", (el) => el.checked);
  for (const l of ["ES", "EN"]) {
    const r = $("#r" + l);
    r.oninput = () => { S["rate" + l] = +r.value; $(`#r${l}v`).textContent = r.value; saveSettings(); };
  }
  bind("#gKey", "googleKey", (el) => el.value.trim());
  bind("#gEN", "gVoiceEN"); bind("#gES", "gVoiceES");
  $("#tProv").onchange = () => {
    S.ttsProvider = $("#tProv").value; saveSettings(); ttsWarned = false;
    $("#gBox").style.display = S.ttsProvider === "google" ? "block" : "none";
    $("#bBox").style.display = S.ttsProvider === "google" ? "none" : "block";
  };
  for (const id of ["#gKey", "#gEN", "#gES"]) $(id).addEventListener("change", () => { ttsWarned = false; });
  $("#tES").onclick = () => { primeAudio(); A.stopSpeaking(); A.speak("Se abre la audiencia. El Ministerio Público solicita tres meses de prisión preventiva contra el imputado.", "es", { rate: S.rateES, voiceName: S.voiceES }); };
  $("#tEN").onclick = () => { primeAudio(); A.stopSpeaking(); A.speak("Your Honor, I had no clue what was in that bag. I've never been in trouble with the law.", "en", { rate: S.rateEN, voiceName: S.voiceEN }); };
  $("#kTest").onclick = async () => {
    S.apiKey = $("#kKey").value.trim(); saveSettings();
    $("#kOut").textContent = "Probando…";
    try { const r = await testKey(S); $("#kOut").innerHTML = `<span style="color:var(--good)">✓ Conectado (${esc(r)})</span>`; }
    catch (e) { $("#kOut").innerHTML = `<span style="color:var(--bad)">${esc(e.message)}</span>`; }
  };
  const micTest = async (lang) => {
    primeAudio();
    try { await ensureMic(); } catch (e) { return toast(e.message, 6000); }
    const live = $("#mLive");
    live.style.display = "block";
    live.textContent = "Habla durante unos segundos…";
    const rec = new A.Recorder({ lang: recLang(lang), useAudio: S.useAudio, autoStop: true, silenceSec: 2, maxWaitSec: 8, maxSec: 15, onInterim: (t) => live.textContent = t, onLevel: (v) => $("#mMeter").style.width = `${v * 100}%` });
    const res = await rec.start();
    $("#mMeter").style.width = "0";
    const m = res.metrics;
    live.textContent = `Transcripción: ${res.transcript || "(vacía)"}\nClaridad: ${m.confianza_asr != null ? Math.round(m.confianza_asr * 100) + "%" : "—"} · Ritmo: ${m.palabras_por_minuto ?? "—"} ppm · Detección de pausas: ${m.vad ? "sí" : "no"}${res.recError ? `\nError de reconocimiento: ${res.recError}` : ""}${res.audioError ? `\nError de audio: ${res.audioError}` : ""}`;
    if (res.audio) { const a = document.createElement("audio"); a.controls = true; a.src = URL.createObjectURL(res.audio); a.style.width = "100%"; live.appendChild(document.createElement("br")); live.appendChild(a); }
  };
  $("#mTest").onclick = () => micTest("en");
  $("#mTestEs").onclick = () => micTest("es");
  // --- Uso sin internet ---
  const oTTS = $("#oTTS");
  if (oTTS) {
    const list = speechTexts();
    const chars = list.reduce((a, x) => a + x.text.length, 0);
    Promise.all(list.map((x) => A.isTTSCached(x.text, x.lang))).then((r) => {
      const have = r.filter(Boolean).length;
      const el = $("#oCount"); if (el) el.textContent = `${list.length} frases (~${Math.round(chars / 1000)}k caracteres, dentro del nivel gratis). ya descargadas: ${have}`;
    });
    oTTS.onclick = async () => {
      if (!navigator.onLine) return toast("Conéctate a internet para descargar.");
      oTTS.disabled = true;
      try {
        const r = await A.downloadTTS(list, (d, t, sk, f) => { $("#oBar").style.width = `${(d / t) * 100}%`; $("#oOut").textContent = `${d}/${t} · ${f ? f + " con error" : "sin errores"}`; });
        $("#oOut").textContent = `✓ Listo: ${r.done - r.failed} frases disponibles sin internet${r.failed ? ` (${r.failed} fallaron; vuelve a tocar para reintentar)` : ""}.`;
      } catch (e) { $("#oOut").textContent = "Error de Google: " + e.message; }
      oTTS.disabled = false;
    };
  }
  const aInst = $("#aInst");
  if (aInst) {
    const showStat = async () => { const a = await A.localASRStatus(S.recEN), b = await A.localASRStatus(S.recES); $("#aStat").textContent = `Estado: inglés (${S.recEN}) → ${a}; español (${S.recES}) → ${b}`; };
    showStat();
    aInst.onclick = async () => {
      aInst.disabled = true; $("#aStat").textContent = "Descargando… (puede tardar unos minutos)";
      const r1 = await A.installLocalASR(S.recEN), r2 = await A.installLocalASR(S.recES);
      await showStat();
      if (!r1 || !r2) toast("Algún idioma no se pudo instalar. Prueba con es-US / en-US en «Reconocer como».", 6000);
      aInst.disabled = false;
    };
  }
  $("#pNow").onclick = async () => { $("#pNow").disabled = true; await processPending(); $("#pCount").textContent = pendingCount(); };

  const th = $("#theme");
  th.value = LS.get("theme", "");
  th.onchange = () => { LS.set("theme", th.value); applyTheme(); };
};

// Todas las frases que el app puede decir con el banco (para descargarlas y usarlas sin internet).
function speechTexts() {
  const out = new Map();
  const add = (text, lang) => { text = (text || "").trim(); if (text) out.set(`${lang}|${text}`, { text, lang }); };
  const crit = LS.get("critsets", {});
  for (const d of [...DIALOGOS, ...GENERATED.filter((g) => g.tipo === "consec")]) for (const t of d.turnos || []) add(t.texto, t.idioma);
  for (const d of [...DISCURSOS, ...GENERATED.filter((g) => g.tipo === "simul")]) for (const s of A.splitSentences(d.texto)) add(s, d.idioma);
  for (const p of [...PASAJES, ...(crit.comprension?.pasajes || [])]) for (const s of A.splitSentences(p.texto)) add(s, p.lang);
  for (const arr of [...Object.values(ORALES), ...Object.values(crit).map((x) => x.orales || [])]) for (const o of arr) add(o.t, o.lang);
  for (const [en, es] of [...GLOSARIO, ...MYTERMS]) { add(en.split("|")[0], "en"); add(es.split("|")[0], "es"); }
  for (const [a, b, cat] of MODISMOS) { const [en, es] = cat === "Dominicano" ? [b, a] : [a, b]; add(en.split("|")[0], "en"); add(es.split("|")[0], "es"); }
  for (const l of ["en", "es"]) for (const [w] of PARES_PRON[l]) add(w.replaceAll("/", ","), l);
  return [...out.values()];
}

function applyTheme() {
  const t = LS.get("theme", "");
  if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
}

// ====================== Arranque ======================
initModulos({
  S, LS, $, view, esc, uid, toast, setTitle, go, routes, recordTurn, Session, stageHTML, ensureMic, primeAudio, keepAwake,
  logDaily, voiceOf, rateOf, other, scoreClass, saveSettings, setCurrent: (s) => { current = s; }
});
applyTheme();
// Fijar una sola voz por idioma (inglés americano, español neutro) y recordarla siempre.
A.loadVoices().then(() => setTimeout(() => {
  let changed = false;
  for (const [lang, key] of [["en", "voiceEN"], ["es", "voiceES"]]) {
    if (!S[key] || !A.voicesFor(lang).some((v) => v.name === S[key])) {
      const v = A.pickVoice(lang);
      if (v) { S[key] = v.name; changed = true; }
    }
  }
  if (changed) saveSettings();
}, 1500));
// Limpiar audios viejos (conservar los de los últimos 40 ejercicios).
setTimeout(processPending, 3000);
A.pruneAudio([...HIST.filter((h) => h.pendingEval), ...HIST.slice(-40)].flatMap((h) => (h.segmentos || []).map((s) => s.audioId).filter(Boolean)));
render();

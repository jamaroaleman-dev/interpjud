// Banco 3: integra el material grande (glosario, falsos cognados, modismos, oraciones con versión modelo, quizzes)
// y genera ejercicios automáticos sin internet: integridad (detectar omisiones/adiciones/cambios), comprensión
// auditiva (frases), números y falsos cognados.
import { QUIZ, ORALES, FALSOS_AMIGOS } from "./criterios.js";
import { GLOSARIO, MODISMOS, DIALOGOS } from "./content.js";
import { GLOSARIO3, MODISMOS3, FALSOS3 } from "./banco3a.js";
import { ORACIONES } from "./banco3b.js";
import { QUIZ3 } from "./banco3c.js";
import "./banco3d.js";

// ---------- Fusionar ----------
const key = (s) => s.split("|")[0].toLowerCase().trim();
const seenG = new Set(GLOSARIO.map((g) => key(g[0])));
for (const g of GLOSARIO3) if (!seenG.has(key(g[0]))) { seenG.add(key(g[0])); GLOSARIO.push(g); }
const seenM = new Set(MODISMOS.map((m) => key(m[0])));
for (const m of MODISMOS3) if (!seenM.has(key(m[0]))) { seenM.add(key(m[0])); MODISMOS.push(m); }
const seenF = new Set(FALSOS_AMIGOS.map((f) => key(f[0])));
for (const f of FALSOS3) if (!seenF.has(key(f[0]))) { seenF.add(key(f[0])); FALSOS_AMIGOS.push(f); }
for (const k in QUIZ3) (QUIZ[k] ||= []).push(...QUIZ3[k]);
export { ORACIONES };

// ---------- Utilidades ----------
const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = rnd(i + 1); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const other = (l) => (l === "es" ? "en" : "es");

// ---------- Oraciones para los ejercicios hablados ----------
const TAG = { gramatica: "g", interferencias: "i", modismos_expresiones: "m", estilo_registro: "e", terminologia_juridica: "t" };
const dialogTurns = () => DIALOGOS.flatMap((d) => d.turnos.filter((t) => t.texto && t.texto.split(/\s+/).length >= 6).map((t) => ({ lang: t.idioma, t: t.texto, fuente: d.titulo })));
export function oralExtra(k) {
  const tag = TAG[k];
  const withRef = ORACIONES.map((o) => ({ lang: o.lang, t: o.t, ref: o.ref, tags: o.tags }));
  if (k === "pronunciacion") return ORACIONES.flatMap((o) => [{ lang: o.lang, t: o.t }, { lang: other(o.lang), t: o.ref }]);
  if (k === "fluidez" || k === "integridad_mensaje") return [...withRef, ...dialogTurns()];
  if (tag) { const t = withRef.filter((o) => o.tags.includes(tag)); return [...t, ...t, ...withRef]; } // las etiquetadas salen más seguido
  return withRef;
}

// ---------- Mutaciones (para crear opciones infieles) ----------
const SWAP = {
  es: [["lunes", "martes"], ["miércoles", "jueves"], ["viernes", "sábado"], ["domingo", "lunes"], ["enero", "junio"], ["febrero", "abril"], ["marzo", "mayo"], ["julio", "junio"], ["agosto", "octubre"], ["septiembre", "noviembre"], ["diciembre", "noviembre"],
    ["madre", "tía"], ["mamá", "tía"], ["padre", "tío"], ["hermano", "primo"], ["hermana", "prima"], ["esposa", "hermana"], ["esposo", "hermano"], ["hijo", "sobrino"], ["hija", "sobrina"], ["primo", "hermano"], ["vecino", "amigo"], ["vecina", "amiga"], ["cuñado", "suegro"], ["abuela", "madrina"], ["sobrino", "nieto"],
    ["izquierdo", "derecho"], ["izquierda", "derecha"], ["brazo derecho", "brazo izquierdo"], ["mano derecha", "mano izquierda"], ["roja", "azul"], ["rojo", "azul"], ["blanca", "negra"], ["blanco", "negro"], ["negro", "gris"], ["gris", "negro"], ["verde", "amarillo"],
    ["noche", "mañana"], ["de la mañana", "de la tarde"], ["de la tarde", "de la noche"], ["madrugada", "noche"], ["antes", "después"], ["después", "antes"], ["siempre", "nunca"], ["nunca", "siempre"], ["nadie", "alguien"],
    ["pistola", "escopeta"], ["cuchillo", "machete"], ["carro", "camión"], ["motocicleta", "pasola"], ["motor", "carro"], ["cocina", "sala"], ["galería", "marquesina"], ["ventana", "puerta"], ["cabeza", "cara"], ["brazo", "pierna"], ["pecho", "abdomen"], ["ojo", "oído"],
    ["culpable", "inocente"], ["solicita", "rechaza"], ["prisión preventiva", "garantía económica"], ["impedimento de salida", "arresto domiciliario"], ["imputado", "testigo"], ["víctima", "imputada"], ["fiscal", "defensa"], ["defensa", "fiscalía"],
    ["más", "menos"], ["grande", "pequeño"], ["primera", "última"], ["siguiente", "anterior"]],
  en: [["Monday", "Tuesday"], ["Wednesday", "Thursday"], ["Friday", "Saturday"], ["Sunday", "Monday"], ["January", "June"], ["February", "April"], ["March", "May"], ["July", "June"], ["August", "October"], ["September", "November"], ["December", "November"],
    ["mother", "aunt"], ["mom", "aunt"], ["father", "uncle"], ["brother", "cousin"], ["sister", "cousin"], ["wife", "sister"], ["husband", "brother"], ["son", "nephew"], ["daughter", "niece"], ["cousin", "brother"], ["neighbor", "friend"], ["nephew", "grandson"], ["uncle", "father"], ["grandmother", "godmother"], ["girlfriend", "sister"],
    ["left eye", "right eye"], ["left cheek", "right cheek"], ["right arm", "left arm"], ["right hand", "left hand"], ["red", "blue"], ["white", "black"], ["black", "gray"], ["gray", "black"], ["green", "yellow"],
    ["night", "morning"], ["morning", "afternoon"], ["afternoon", "night"], ["before", "after"], ["after", "before"], ["always", "never"], ["never", "always"], ["everything", "something"], ["nobody", "somebody"],
    ["gun", "rifle"], ["knife", "machete"], ["car", "truck"], ["motorcycle", "scooter"], ["kitchen", "living room"], ["window", "door"], ["head", "face"], ["arm", "leg"], ["chest", "stomach"], ["eye", "ear"],
    ["guilty", "not guilty"], ["requests", "rejects"], ["pretrial detention", "house arrest"], ["travel ban", "house arrest"], ["defendant", "witness"], ["victim", "defendant"], ["prosecution", "defense"], ["defense", "prosecution"],
    ["more", "less"], ["bigger", "smaller"], ["first", "last"], ["next", "previous"]]
};
const NUMW = {
  es: [["dos", "tres"], ["tres", "cuatro"], ["cuatro", "cinco"], ["cinco", "seis"], ["seis", "siete"], ["siete", "ocho"], ["ocho", "nueve"], ["nueve", "diez"], ["diez", "doce"], ["once", "trece"], ["doce", "quince"], ["catorce", "cuarenta"], ["quince", "cincuenta"], ["veinte", "treinta"], ["treinta", "trece"], ["cuarenta", "catorce"], ["cincuenta", "quince"], ["sesenta", "setenta"], ["cien", "mil"], ["mil", "cien"], ["millones", "mil"], ["un año", "dos años"], ["una sola", "dos"]],
  en: [["two", "three"], ["three", "four"], ["four", "five"], ["five", "six"], ["six", "seven"], ["seven", "eight"], ["eight", "nine"], ["nine", "ten"], ["ten", "twelve"], ["eleven", "seven"], ["twelve", "twenty"], ["fourteen", "forty"], ["fifteen", "fifty"], ["eighteen", "eighty"], ["twenty", "thirty"], ["thirty", "thirteen"], ["forty", "fourteen"], ["fifty", "fifteen"], ["sixty", "sixteen"], ["hundred", "thousand"], ["thousand", "hundred"], ["million", "thousand"], ["one year", "two years"], ["a single", "two"]]
};
const ADD = {
  es: [" otra vez", " también", ", según me dijeron", " a propósito", " dos veces", " sin querer", " de inmediato", ", creo yo"],
  en: [" again", " too", ", as I was told", " on purpose", " twice", " by accident", " right away", ", I think"]
};
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wordRe = (w) => new RegExp(`(^|[^\\p{L}])(${esc(w)})(?=[^\\p{L}]|$)`, "iu");
const keepCase = (src, rep) => (src[0] === src[0].toUpperCase() ? rep[0].toUpperCase() + rep.slice(1) : rep);

function swapOnce(s, pairs) {
  for (const [a, b] of shuffle(pairs)) {
    const m = s.match(wordRe(a));
    if (m) return s.replace(wordRe(a), (all, pre, w) => pre + keepCase(w, b));
  }
  return null;
}
function mutDigits(s) {
  const nums = [...s.matchAll(/\d[\d,.:-]*\d|\d/g)];
  if (!nums.length) return null;
  const m = pick(nums), v = m[0];
  const digs = [...v].map((c, i) => (/\d/.test(c) ? i : -1)).filter((i) => i >= 0);
  const i = pick(digs);
  const nd = String((+v[i] + 1 + rnd(8)) % 10);
  let out = v.slice(0, i) + nd + v.slice(i + 1);
  if (out === v || (out[0] === "0" && v[0] !== "0" && digs.length > 1)) out = v.slice(0, i) + String((+v[i] + 1) % 10) + v.slice(i + 1);
  return s.slice(0, m.index) + out + s.slice(m.index + v.length);
}
export function mutNumber(s, lang) { return (Math.random() < 0.7 ? mutDigits(s) || swapOnce(s, NUMW[lang]) : swapOnce(s, NUMW[lang]) || mutDigits(s)); }
function mutOmit(s, lang) {
  const end = s.match(/[.!?»"]+$/)?.[0] || "";
  const body = s.slice(0, s.length - end.length);
  const parts = body.split(/,\s+/);
  if (parts.length >= 2) { const i = 1 + rnd(parts.length - 1); parts.splice(i, 1); return parts.join(", ") + end; }
  const conj = lang === "es" ? / y | pero | porque | cuando / : / and | but | because | when /;
  const m = body.match(conj);
  if (m && m.index > 12) return body.slice(0, m.index) + end;
  const words = body.split(" ");
  if (words.length > 7) { const i = 2 + rnd(words.length - 4); words.splice(i, 2); return words.join(" ") + end; }
  return null;
}
function mutAdd(s, lang) {
  const end = s.match(/[.!?»"]+$/)?.[0] || "";
  const body = s.slice(0, s.length - end.length);
  return body + pick(ADD[lang]) + end;
}
function mutNeg(s, lang) {
  if (lang === "es") { if (/\bno\s/i.test(s)) return s.replace(/\b[Nn]o\s/, ""); return null; }
  if (/n't\b/.test(s)) return s.replace(/(\w+)n't\b/, (a, w) => (w === "wo" ? "will" : w === "ca" ? "can" : w === "do" || w === "does" || w === "did" ? "" : w)).replace(/\s{2,}/g, " ");
  if (/\bnot\b/.test(s)) return s.replace(/\bnot\s/, "");
  if (/\bnever\b/.test(s)) return s.replace(/\bnever\b/, "always");
  return null;
}
const KIND = { num: "cambia una cifra o un número", swap: "cambia un dato (persona, lugar, día, color o término)", omit: "omite información", add: "añade algo que el orador no dijo", neg: "cambia el sentido (negación)" };
function distractors(ref, lang, kinds = ["num", "swap", "omit", "add", "neg", "swap"]) {
  const out = [], seen = new Set([ref.trim()]);
  for (const k of shuffle(kinds)) {
    if (out.length >= 3) break;
    const f = { num: () => mutNumber(ref, lang), swap: () => swapOnce(ref, SWAP[lang]), omit: () => mutOmit(ref, lang), add: () => mutAdd(ref, lang), neg: () => mutNeg(ref, lang) }[k];
    for (let tries = 0; tries < 3 && out.length < 3; tries++) {
      const t = f();
      if (t && !seen.has(t.trim()) && t.length > 8) { seen.add(t.trim()); out.push({ t, k }); break; }
    }
  }
  if (out.length < 3) for (const k of ["swap", "num", "omit"]) { if (out.length >= 3) break; const t = k === "omit" ? mutOmit(ref, lang) : k === "swap" ? swapOnce(ref, SWAP[lang]) : mutNumber(ref, lang); if (t && !seen.has(t.trim())) { seen.add(t.trim()); out.push({ t, k }); } }
  return out.length >= 3 ? out.slice(0, 3) : null;
}

// ---------- Generadores de quiz ----------
const byDir = (dir) => ORACIONES.filter((o) => dir === "mix" || o.lang === dir);
export function quizIntegridad(dir, n) {
  const out = [];
  for (const o of shuffle(byDir(dir))) {
    if (out.length >= n) break;
    const ds = distractors(o.ref, other(o.lang));
    if (!ds) continue;
    out.push({ d: o.lang, k: "int:" + o.t, q: `Original: «${o.t}» — ¿Qué interpretación es FIEL (sin omisiones, adiciones ni cambios)?`, o: [o.ref, ...ds.map((x) => x.t)], c: 0,
      e: `Fiel: «${o.ref}» Las otras opciones: ${[...new Set(ds.map((x) => KIND[x.k]))].join("; ")}.` });
  }
  return out;
}
export function quizAuditivo(dir, n) {
  const out = [];
  for (const o of shuffle(byDir(dir))) {
    if (out.length >= n) break;
    const ds = distractors(o.ref, other(o.lang));
    if (!ds) continue;
    out.push({ d: o.lang, k: "aud:" + o.t, audio: { text: o.t, lang: o.lang }, q: `Escucha la frase (sin leerla) y elige lo que se dijo, en ${o.lang === "en" ? "español" : "inglés"}:`, o: [o.ref, ...ds.map((x) => x.t)], c: 0,
      e: `Se dijo: «${o.t}» → «${o.ref}». Las otras: ${[...new Set(ds.map((x) => KIND[x.k]))].join("; ")}.` });
  }
  return out;
}
export function quizNumeros(dir, n) {
  const out = [];
  const pool = byDir(dir).filter((o) => /\d/.test(o.ref) || NUMW[other(o.lang)].some(([a]) => wordRe(a).test(o.ref)));
  for (const o of shuffle(pool)) {
    if (out.length >= n) break;
    const lang = other(o.lang), seen = new Set([o.ref]), ds = [];
    for (let i = 0; i < 12 && ds.length < 3; i++) { const t = i < 8 ? mutNumber(o.ref, lang) : swapOnce(o.ref, SWAP[lang]); if (t && !seen.has(t)) { seen.add(t); ds.push(t); } }
    if (ds.length < 3) continue;
    out.push({ d: o.lang, k: "num:" + o.t, q: `«${o.t}» — ¿Qué versión conserva exactamente cifras, nombres y fechas?`, o: [o.ref, ...ds], c: 0, e: `Correcta: «${o.ref}»` });
  }
  return out;
}
export function quizFalsos(dir, n) {
  if (dir === "es") return [];
  const rows = FALSOS_AMIGOS.filter((r) => r[2] && !/^—|válido|correcto|aceptable/.test(r[2]));
  return shuffle(rows).slice(0, n).map(([en, ok, trap]) => {
    const trapTxt = trap.replace(/\s*\(.*$/, "").split(/[,/]/)[0].trim();
    const okTxt = ok.split(/[,/]/)[0].trim();
    const others = shuffle(rows.filter((r) => r[0] !== en)).slice(0, 2).map((r) => r[1].split(/[,/]/)[0].trim());
    return { d: "en", k: "fa:" + en, q: `Falso cognado: en un tribunal, «${en}» se traduce como…`, o: [okTxt, trapTxt, ...others], c: 0, e: `«${en}» = ${ok}. Trampa: ${trap}.` };
  }).filter((q) => new Set(q.o).size === 4);
}
export const AUTOQ = {
  integridad_mensaje: quizIntegridad,
  comprension: quizAuditivo,
  numeros_nombres_fechas: quizNumeros,
  interferencias: quizFalsos
};

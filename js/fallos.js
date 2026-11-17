// «Mis fallos»: guarda en el dispositivo lo que fallaste, por criterio, para repasarlo después.
// Un ítem sale de la lista cuando lo aciertas en «Repasar fallos» (o en una práctica normal).
// Tipos: quiz (pregunta de selección múltiple), term (término hablado), num (cifras habladas), oral (frase para interpretar o repetir).
const KEY = "ij_fallos";
const MAX = 200;
let F = {};
try { F = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { F = {}; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(F)); } catch {} };

export function falloKey(e) {
  if (e.type === "quiz") return "q:" + (e.q.k || e.q.q);
  return e.type + ":" + e.t;
}
export function addFallo(k, entry) {
  const list = (F[k] ||= []);
  const id = falloKey(entry);
  const old = list.find((x) => x.id === id);
  if (old) { old.veces = (old.veces || 1) + 1; old.date = Date.now(); Object.assign(old, entry, { id, veces: old.veces, date: old.date }); }
  else list.push({ ...entry, id, veces: 1, date: Date.now() });
  F[k] = list.slice(-MAX);
  save();
}
export function removeFallo(k, entryOrId) {
  const id = typeof entryOrId === "string" ? entryOrId : falloKey(entryOrId);
  if (!F[k]) return false;
  const n = F[k].length;
  F[k] = F[k].filter((x) => x.id !== id);
  if (F[k].length !== n) { save(); return true; }
  return false;
}
export function getFallos(k) { return [...(F[k] || [])].sort((a, b) => (b.veces || 1) - (a.veces || 1) || b.date - a.date); }
export function countFallos(k) { return k ? (F[k] || []).length : Object.values(F).reduce((a, l) => a + l.length, 0); }
export function clearFallos(k) { if (k) delete F[k]; else F = {}; save(); }

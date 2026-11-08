// Generador y corrector de ejercicios de números, nombres y fechas.

const r = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pad = (n, l) => String(n).padStart(l, "0");

const MES_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MES_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const NOMBRES_DO = ["José Ramón Peña Almonte", "María Altagracia Reyes Tavárez", "Luis Manuel Ferreira Batista", "Ana Julia Mejía Rosario", "Rafael Antonio Guzmán Polanco", "Yokasta Mercedes Abreu Liriano", "Juan Carlos Santana Brito", "Rosa Elena Cruz Disla", "Francisco Javier Ovalle Matos", "Carmen Yudelka Familia Pujols"];
const NOMBRES_EN = ["Daniel Joseph Whitaker", "Jennifer Lynn Ashford", "Michael Patrick O'Brien", "Sarah Elizabeth Collins", "Robert Alan Kessler", "Ashley Nicole Thompson", "Kevin Andrew Mills", "Thomas Ray Grayson", "Emily Rose Harrington", "Brandon Lee McCarthy"];
const LUGARES_DO = ["Los Mina, Santo Domingo Este", "el sector Cienfuegos de Santiago", "Villa Juana, Distrito Nacional", "Bávaro, Higüey", "Sosúa, Puerto Plata", "Los Alcarrizos", "Gazcue, Distrito Nacional", "Herrera, Santo Domingo Oeste"];
const CALLES_DO = ["la calle Duarte", "la avenida 27 de Febrero", "la calle Las Mercedes", "la avenida Máximo Gómez", "la calle Restauración", "la avenida San Vicente de Paúl"];
const CIUDADES_EN = ["Newark, New Jersey", "Boston, Massachusetts", "Toronto, Canada", "Miami, Florida", "Kingston, Jamaica", "Providence, Rhode Island", "Manchester, England"];
const CALLES_EN = ["Elm Street", "Washington Avenue", "Maple Drive", "Oak Boulevard", "Sunset Road", "Lincoln Avenue"];

function horaES() {
  const h = r(1, 12), m = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
  const parte = h >= 6 && h <= 11 ? pick(["de la mañana", "de la noche"]) : pick(["de la tarde", "de la madrugada"]);
  return { txt: `${h}:${pad(m, 2)} ${parte}`, nums: m ? [h, m] : [h] };
}
function horaEN() {
  const h = r(1, 12), m = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
  return { txt: `${h}:${pad(m, 2)} ${pick(["a.m.", "p.m."])}`, nums: m ? [h, m] : [h] };
}
const fmtES = (n) => n.toLocaleString("es-DO");
const fmtEN = (n) => n.toLocaleString("en-US");
const surname = (full) => full.split(" ").filter((w) => w.length > 2).slice(-2)[0];

const ES = [
  () => {
    const d = r(1, 28), mi = r(0, 11), y = r(2019, 2026), h = horaES();
    return { text: `Los hechos ocurrieron el ${d} de ${MES_ES[mi]} de ${y}, a las ${h.txt}.`, nums: [d, y, ...h.nums], month: mi };
  },
  () => {
    const n = pick(NOMBRES_DO), c = `${pad(r(1, 402), 3)}-${pad(r(0, 9999999), 7)}-${r(0, 9)}`;
    return { text: `El imputado ${n}, portador de la cédula de identidad número ${c}, quedó a disposición del tribunal.`, nums: c.split("-").map(Number), names: [surname(n)] };
  },
  () => {
    const g = r(1, 20) * 50000;
    return { text: `El tribunal fija una garantía económica de ${fmtES(g)} pesos dominicanos, en efectivo o mediante una compañía aseguradora.`, nums: [g] };
  },
  () => {
    const kg = (r(10, 499) / 10).toFixed(1), p = r(2, 60);
    return { text: `Se ocuparon ${p} paquetes con un peso total de ${kg.replace(".", ",")} kilogramos de una sustancia que resultó ser cocaína.`, nums: [p, Number(kg)] };
  },
  () => {
    const y = r(2023, 2026), n = r(100, 9999);
    return { text: `El expediente número ${y}-${pad(n, 4)} fue remitido al Juzgado de la Instrucción del Distrito Nacional.`, nums: [y, n] };
  },
  () => {
    const num = r(2, 250), l = pick(LUGARES_DO), c = pick(CALLES_DO);
    return { text: `La víctima reside en ${c}, número ${num}, en ${l}.`, nums: [num] };
  },
  () => {
    const n = pick(NOMBRES_DO), e = r(18, 75), dias = r(2, 40);
    return { text: `${n}, de ${e} años de edad, estuvo ingresado ${dias} días en el hospital.`, nums: [e, dias], names: [surname(n)] };
  },
  () => {
    const meses = pick([3, 6, 12, 18]), d = r(1, 28), mi = r(0, 11), h = horaES();
    return { text: `Se impone prisión preventiva por ${meses} meses y se fija la revisión para el ${d} de ${MES_ES[mi]} a las ${h.txt}.`, nums: [meses, d, ...h.nums], month: mi };
  },
  () => {
    const usd = r(2, 95) * 1000 + pick([0, 250, 500, 750]), rd = r(5, 300) * 1000;
    return { text: `En la maleta se encontraron ${fmtES(usd)} dólares estadounidenses y ${fmtES(rd)} pesos en efectivo.`, nums: [usd, rd] };
  },
  () => {
    const v = r(60, 140), lim = pick([40, 60, 80]);
    return { text: `El vehículo transitaba a ${v} kilómetros por hora en una zona con un límite de velocidad de ${lim}.`, nums: [v, lim] };
  }
];

const EN = [
  () => {
    const d = r(1, 28), mi = r(0, 11), y = r(2019, 2026), h = horaEN();
    return { text: `The incident occurred on ${MES_EN[mi]} ${d}, ${y}, at approximately ${h.txt}`, nums: [d, y, ...h.nums], month: mi };
  },
  () => {
    const n = pick(NOMBRES_EN), p = `${r(1, 9)}${pad(r(0, 99999999), 8)}`;
    return { text: `My name is ${n}, and my passport number is ${p.split("").join(" ")}.`, nums: [Number(p)], names: [surname(n)], digitsOnly: p };
  },
  () => {
    const usd = r(1, 250) * 1000 + pick([0, 200, 500, 800]);
    return { text: `I wired a total of ${fmtEN(usd)} dollars to his account between March and October.`, nums: [usd], month: 2 };
  },
  () => {
    const e = r(19, 79), c = pick(CIUDADES_EN);
    return { text: `I'm ${e} years old, and I'm from ${c}.`, nums: [e] };
  },
  () => {
    const num = r(100, 9999), apt = `${r(1, 12)}${pick(["A", "B", "C", "D"])}`, s = pick(CALLES_EN);
    return { text: `I live at ${num} ${s}, apartment ${apt}.`, nums: [num, parseInt(apt)] };
  },
  () => {
    const mph = r(35, 95), lim = pick([25, 35, 45, 55]);
    return { text: `The car was going about ${mph} miles per hour in a ${lim} mile-per-hour zone.`, nums: [mph, lim] };
  },
  () => {
    const bags = r(3, 30), kg = (r(100, 3000) / 100).toFixed(2);
    return { text: `We received ${bags} sealed evidence bags with a total net weight of ${kg} kilograms.`, nums: [bags, Number(kg)] };
  },
  () => {
    const n = pick(NOMBRES_EN), kids = r(1, 4), yrs = r(2, 25);
    return { text: `${n} has been married for ${yrs} years and has ${kids} ${kids === 1 ? "child" : "children"}.`, nums: [yrs, kids], names: [surname(n)] };
  },
  () => {
    const d = r(1, 28), mi = r(0, 11), y = r(1950, 2005);
    return { text: `I was born on ${MES_EN[mi]} ${d}, ${y}, in ${pick(CIUDADES_EN)}.`, nums: [d, y], month: mi };
  },
  () => {
    const pct = r(55, 98), n = r(2, 40);
    return { text: `The ${n} samples tested positive for cocaine hydrochloride, with a purity of ${pct} percent.`, nums: [n, pct] };
  }
];

export function makeItem(lang) {
  const g = pick(lang === "es" ? ES : EN)();
  return { lang, ...g };
}

// ---------- Conversión de palabras a números ----------
const W = {
  en: { zero: 0, oh: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 },
  es: { cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciséis: 16, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20, veintiuno: 21, veintiún: 21, veintidós: 22, veintidos: 22, veintitrés: 23, veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiséis: 26, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29, treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90, cien: 100, ciento: 100, doscientos: 200, doscientas: 200, trescientos: 300, trescientas: 300, cuatrocientos: 400, cuatrocientas: 400, quinientos: 500, quinientas: 500, seiscientos: 600, seiscientas: 600, setecientos: 700, setecientas: 700, ochocientos: 800, ochocientas: 800, novecientos: 900, novecientas: 900 }
};
const MULT = { hundred: 100, thousand: 1000, million: 1e6, mil: 1000, millón: 1e6, millon: 1e6, millones: 1e6 };
const JOIN = new Set(["and", "y", "-"]);

function wordsToNumbers(text, lang) {
  const toks = text.toLowerCase().replace(/-/g, " ").split(/\s+/);
  const out = [];
  let total = 0, cur = 0, active = false;
  const flush = () => { if (active) out.push(total + cur); total = 0; cur = 0; active = false; };
  for (const t0 of toks) {
    const t = t0.replace(/[.,;:!?¿¡]/g, "");
    const dict = W[lang];
    if (t in dict) {
      // "dos" tras "veinte" sin "y" = nueva cifra (p. ej. dígitos dictados uno a uno)
      if (active && cur % 10 !== 0 && dict[t] < 10 && cur < 100) { flush(); }
      cur += dict[t]; active = true;
    } else if (t in MULT && (active || t === "mil" || t === "hundred" || t === "thousand")) {
      const m = MULT[t];
      if (!active) cur = 1;
      if (m === 100) cur *= 100;
      else { total += cur * m; cur = 0; }
      active = true;
    } else if (JOIN.has(t) && active) {
      continue;
    } else flush();
  }
  flush();
  return out;
}

export function extractNumbers(text, lang) {
  const nums = [];
  // cifras: quitar separadores de miles (grupos de 3) y unificar decimal
  let t = text.replace(/(\d)[.,\s](?=\d{3}(?!\d))/g, "$1");
  t = t.replace(/(\d),(\d{1,2})(?!\d)/g, "$1.$2");
  const re = /\d+(?:\.\d+)?/g;
  let m;
  while ((m = re.exec(t))) nums.push(Number(m[0]));
  // dígitos dictados uno por uno ("5 4 8 2 1 3")
  const digitsRun = text.replace(/[^\d]/g, "");
  if (digitsRun.length >= 6) nums.push(Number(digitsRun));
  return nums.concat(wordsToNumbers(text, lang));
}

function monthIn(text) {
  const t = text.toLowerCase();
  for (let i = 0; i < 12; i++) {
    if (t.includes(MES_ES[i]) || t.includes(MES_EN[i].toLowerCase()) || (i === 8 && t.includes("setiembre"))) return i;
  }
  return null;
}

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ\s]/g, " ").replace(/\s+/g, " ").trim();

export function lev(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}

export function checkItem(item, transcript) {
  const targetLang = item.lang === "es" ? "en" : "es";
  const found = extractNumbers(transcript, targetLang).concat(extractNumbers(transcript, item.lang));
  const checks = [];
  for (const n of item.nums) {
    const ok = found.some((f) => Math.abs(f - n) < 1e-6);
    checks.push({ label: String(n), ok });
  }
  if (item.month != null) {
    const mi = monthIn(transcript);
    checks.push({ label: `${MES_ES[item.month]} / ${MES_EN[item.month]}`, ok: mi === item.month });
  }
  for (const nm of item.names || []) {
    const target = norm(nm);
    const words = norm(transcript).split(" ");
    const ok = words.some((w) => w === target || (target.length >= 5 && lev(w, target) <= (target.length >= 7 ? 2 : 1)));
    checks.push({ label: nm, ok });
  }
  const okCount = checks.filter((c) => c.ok).length;
  return { checks, okCount, total: checks.length };
}

// ---------- Corrección de términos ----------
export function termMatch(transcript, answers) {
  const t = norm(transcript);
  if (!t) return { ok: false, best: 0 };
  let best = 0;
  for (const a of answers) {
    const an = norm(a);
    if (!an) continue;
    if (t.includes(an)) return { ok: true, best: 1 };
    const sim = 1 - lev(t, an) / Math.max(t.length, an.length);
    // comparar también con ventanas de la misma cantidad de palabras
    const tw = t.split(" "), aw = an.split(" ").length;
    for (let i = 0; i + aw <= tw.length; i++) {
      const seg = tw.slice(i, i + aw).join(" ");
      best = Math.max(best, 1 - lev(seg, an) / Math.max(seg.length, an.length));
    }
    best = Math.max(best, sim);
  }
  return { ok: best >= 0.8, best };
}

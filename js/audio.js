// Motor de audio: síntesis de voz (TTS), micrófono, grabación, reconocimiento y métricas.

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
export const hasRecognition = !!SR;
export const hasTTS = "speechSynthesis" in window;
export const hasRecorder = "MediaRecorder" in window && !!navigator.mediaDevices?.getUserMedia;

export const isAndroid = /Android/i.test(navigator.userAgent);
export const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

// ---------------- TTS ----------------
let voicesCache = [];
export function loadVoices() {
  return new Promise((resolve) => {
    if (!hasTTS) return resolve([]);
    const v = speechSynthesis.getVoices();
    if (v.length) { voicesCache = v; return resolve(v); }
    const t = setTimeout(() => { voicesCache = speechSynthesis.getVoices(); resolve(voicesCache); }, 1500);
    speechSynthesis.onvoiceschanged = () => {
      clearTimeout(t);
      voicesCache = speechSynthesis.getVoices();
      resolve(voicesCache);
    };
  });
}

const vlang = (v) => (v.lang || "").toLowerCase().replace("_", "-");

export function voicesFor(lang) {
  return voicesCache.filter((v) => vlang(v).startsWith(lang));
}

// Acentos permitidos: inglés americano; español neutro latinoamericano (EE. UU./México/419), España solo como último recurso.
const ACCENTS = { en: ["en-us"], es: ["es-us", "es-mx", "es-419", "es-do", "es-co"] };

function scoreVoice(v, lang) {
  let s = 0;
  const n = (v.name || "").toLowerCase();
  if (/natural|neural|online|premium|enhanced/.test(n)) s += 5;
  if (/google/.test(n)) s += 3;
  const idx = ACCENTS[lang].indexOf(vlang(v));
  if (idx >= 0) s += 20 - idx; // el acento manda sobre la calidad
  return s;
}

// Devuelve SIEMPRE la misma voz para un idioma (estable entre ejercicios y repeticiones).
const locked = {};
export function pickVoice(lang, preferredName) {
  const list = voicesFor(lang);
  if (preferredName) {
    const p = list.find((v) => v.name === preferredName);
    if (p) return p;
  }
  const l = locked[lang] && list.find((v) => v.name === locked[lang]);
  if (l) return l;
  const best = [...list].sort((a, b) => scoreVoice(b, lang) - scoreVoice(a, lang) || a.name.localeCompare(b.name))[0] || null;
  if (best) locked[lang] = best.name;
  return best;
}

// Voces con el acento permitido (para el selector de Ajustes).
export function accentVoices(lang) {
  const ok = voicesFor(lang).filter((v) => ACCENTS[lang].includes(vlang(v)));
  return ok.length ? ok : voicesFor(lang);
}

let keepAlive = null;
export function stopSpeaking() {
  try { player?.pause(); player?.dispatchEvent(new Event("ended")); } catch {}
  if (!hasTTS) return;
  clearInterval(keepAlive);
  speechSynthesis.cancel();
}

// ---------------- Voces naturales: Google Cloud Text-to-Speech ----------------
export const GOOGLE_VOICES = {
  en: [
    ["en-US-Chirp3-HD-Charon", "Charon · hombre (Chirp 3 HD, la más natural)"],
    ["en-US-Chirp3-HD-Kore", "Kore · mujer (Chirp 3 HD, la más natural)"],
    ["en-US-Chirp3-HD-Puck", "Puck · hombre (Chirp 3 HD)"],
    ["en-US-Chirp3-HD-Aoede", "Aoede · mujer (Chirp 3 HD)"],
    ["en-US-Neural2-J", "Neural2-J · hombre"],
    ["en-US-Neural2-F", "Neural2-F · mujer"],
    ["en-US-Neural2-D", "Neural2-D · hombre"]
  ],
  es: [
    ["es-US-Chirp3-HD-Charon", "Charon · hombre (Chirp 3 HD, la más natural)"],
    ["es-US-Chirp3-HD-Kore", "Kore · mujer (Chirp 3 HD, la más natural)"],
    ["es-US-Chirp3-HD-Puck", "Puck · hombre (Chirp 3 HD)"],
    ["es-US-Chirp3-HD-Aoede", "Aoede · mujer (Chirp 3 HD)"],
    ["es-US-Neural2-B", "Neural2-B · hombre"],
    ["es-US-Neural2-A", "Neural2-A · mujer"],
    ["es-US-Neural2-C", "Neural2-C · hombre"]
  ]
};
let tts = { provider: "browser", key: "", en: GOOGLE_VOICES.en[0][0], es: GOOGLE_VOICES.es[0][0], onError: null };
export function configureTTS(cfg) { tts = { ...tts, ...cfg }; }
const useGoogle = () => tts.provider === "google" && !!tts.key;

const memCache = new Map();
async function ttsCacheGet(k) {
  if (memCache.has(k)) return memCache.get(k);
  try {
    const d = await db();
    const blob = await new Promise((res) => { const r = d.transaction("tts").objectStore("tts").get(k); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); });
    if (blob) memCache.set(k, blob);
    return blob;
  } catch { return null; }
}
async function ttsCachePut(k, blob) {
  memCache.set(k, blob);
  try { const d = await db(); d.transaction("tts", "readwrite").objectStore("tts").put(blob, k); } catch {}
}

const inflight = new Map();
// La velocidad se aplica al reproducir (playbackRate), así el mismo audio sirve para cualquier velocidad.
const ttsKey = (text, lang) => `${tts[lang]}|${text}`;
export async function isTTSCached(text, lang) { return !!(await ttsCacheGet(ttsKey(text, lang))); }

function googleAudio(text, lang) {
  const voice = tts[lang];
  const key = ttsKey(text, lang);
  if (inflight.has(key)) return inflight.get(key);
  const p = (async () => {
    const cached = await ttsCacheGet(key);
    if (cached) return cached;
    if (!navigator.onLine) { const e = new Error("sin conexión"); e.offline = true; throw e; }
    const body = { input: { text }, voice: { languageCode: lang === "en" ? "en-US" : "es-US", name: voice }, audioConfig: { audioEncoding: "MP3" } };
    let r;
    try {
      r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(tts.key)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } catch (err) { const e = new Error("sin conexión"); e.offline = true; throw e; }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(j.error?.message || `Google TTS ${r.status}`); e.status = r.status; throw e; }
    const b64 = j.audioContent;
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const blob = new Blob([bytes], { type: "audio/mpeg" });
    await ttsCachePut(key, blob);
    return blob;
  })();
  inflight.set(key, p);
  p.finally(() => inflight.delete(key));
  return p;
}

// Pre-carga una frase (para que no haya silencios entre oraciones).
export function prefetch(text, lang) {
  if (useGoogle() && text) googleAudio(text, lang).catch(() => {});
}

// Descarga por adelantado el audio natural de una lista de frases (para usar sin internet).
export async function downloadTTS(list, onProgress, signal) {
  let done = 0, skipped = 0, failed = 0;
  const queue = [...list];
  const worker = async () => {
    while (queue.length && !signal?.aborted) {
      const { text, lang } = queue.shift();
      try {
        if (await isTTSCached(text, lang)) skipped++;
        else await googleAudio(text, lang);
      } catch (e) {
        failed++;
        if (e.status === 400 || e.status === 403) throw e; // key inválida o API no habilitada
      }
      done++;
      onProgress?.(done, list.length, skipped, failed);
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  return { done, skipped, failed };
}

// ---------------- Reconocimiento de voz en el dispositivo (sin internet) ----------------
export const localASRSupported = !!SR && ("processLocally" in (SR.prototype || {}) || typeof SR.available === "function" || typeof SR.availableOnDevice === "function");
export async function localASRStatus(lang) {
  try {
    if (typeof SR.available === "function") return await SR.available({ langs: [lang], processLocally: true });
    if (typeof SR.availableOnDevice === "function") return await SR.availableOnDevice(lang);
  } catch {}
  return "unknown";
}
const localReady = {};
export async function refreshLocalASR(langs) {
  if (!localASRSupported) return localReady;
  for (const l of langs) localReady[l] = await localASRStatus(l);
  try { localStorage.setItem("ij_localasr", JSON.stringify(localReady)); } catch {}
  return localReady;
}
try { Object.assign(localReady, JSON.parse(localStorage.getItem("ij_localasr") || "{}")); } catch {}

export async function installLocalASR(lang) {
  try {
    if (typeof SR.install === "function") return await SR.install({ langs: [lang], processLocally: true });
    if (typeof SR.installOnDevice === "function") return await SR.installOnDevice(lang);
  } catch { return false; }
  return false;
}

let player = null;
export function unlockAudio() {
  try {
    player ||= new Audio();
    // WAV silencioso generado (desbloquea la reproducción en móviles dentro del gesto del usuario).
    const n = 800, buf = new ArrayBuffer(44 + n), v = new DataView(buf);
    const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    w(0, "RIFF"); v.setUint32(4, 36 + n, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, "data"); v.setUint32(40, n, true);
    for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
    player.src = URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
    player.volume = 0;
    player.play().then(() => { player.pause(); player.volume = 1; }).catch(() => { player.volume = 1; });
  } catch {}
}

function playBlob(blob, signal, rate = 1) {
  return new Promise((resolve) => {
    player ||= new Audio();
    const url = URL.createObjectURL(blob);
    let start = performance.now(), done = false;
    const finish = () => { if (done) return; done = true; player.onended = player.onerror = player.onplaying = null; URL.revokeObjectURL(url); resolve({ start, end: performance.now() }); };
    player.onplaying = () => { start = performance.now(); };
    player.onended = finish;
    player.onerror = finish;
    player.addEventListener("ended", finish, { once: true });
    if (signal) signal.addEventListener("abort", () => { player.pause(); finish(); }, { once: true });
    player.src = url;
    player.volume = 1;
    player.preservesPitch = true;
    player.playbackRate = rate;
    player.play().catch(finish);
  });
}

// Habla un texto. Devuelve {start, end} en ms (performance.now()).
export async function speak(text, lang, opts = {}) {
  if (useGoogle()) {
    try {
      const blob = await googleAudio(text, lang);
      if (opts.signal?.aborted) return { start: performance.now(), end: performance.now() };
      return await playBlob(blob, opts.signal, opts.rate || 1);
    } catch (e) {
      if (!e.offline) tts.onError?.(e); // sin internet y sin audio guardado: voz del teléfono, sin aviso
      // Respaldo: voz del navegador.
    }
  }
  // Si las voces aún no cargaron (común en Android), esperarlas: si no, el sistema usa una voz al azar.
  if (hasTTS && !voicesCache.length) await loadVoices();
  return speakNow(text, lang, opts);
}

function speakNow(text, lang, { rate = 1, voiceName, onBoundary, signal } = {}) {
  return new Promise((resolve) => {
    if (!hasTTS) return resolve({ start: performance.now(), end: performance.now(), skipped: true });
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(lang, voiceName);
    if (v) u.voice = v;
    u.lang = v?.lang || (lang === "es" ? "es-US" : "en-US");
    u.rate = rate;
    let start = performance.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(keepAlive);
      resolve({ start, end: performance.now() });
    };
    u.onstart = () => { start = performance.now(); };
    u.onend = finish;
    u.onerror = finish;
    if (onBoundary) u.onboundary = onBoundary;
    if (signal) signal.addEventListener("abort", () => { speechSynthesis.cancel(); finish(); }, { once: true });
    speechSynthesis.speak(u);
    // Chrome corta frases largas tras ~15 s: mantenerlo vivo.
    clearInterval(keepAlive);
    keepAlive = setInterval(() => {
      if (!speechSynthesis.speaking) return;
      if (!isAndroid && !isIOS) { speechSynthesis.pause(); speechSynthesis.resume(); }
    }, 10000);
    // Salvaguarda: si nunca llega onend.
    const words = text.split(/\s+/).length;
    setTimeout(finish, Math.max(8000, (words / (2.3 * rate)) * 1000 + 6000));
  });
}

// Divide un texto en oraciones para reproducir de corrido.
export function splitSentences(text) {
  return text
    .replace(/\s+/g, " ")
    .match(/[^.!?;:]+[.!?;:]+["”’)]*|[^.!?;:]+$/g)
    ?.map((s) => s.trim())
    .filter(Boolean) || [text];
}

// ---------------- Beep ----------------
let actx = null;
function audioCtx() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === "suspended") actx.resume();
  return actx;
}
export function beep(freq = 880, ms = 140, vol = 0.15) {
  try {
    const ctx = audioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g).connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
    o.stop(ctx.currentTime + ms / 1000 + 0.02);
  } catch {}
}

// ---------------- Micrófono ----------------
let stream = null;
export async function openMic() {
  if (stream && stream.getTracks().every((t) => t.readyState === "live")) return stream;
  stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
  });
  return stream;
}
export function closeMic() {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
}

// ---------------- Sesión de grabación ----------------
// Graba una respuesta. Combina:
//  - MediaRecorder (audio para volver a escucharte)
//  - Analizador de volumen (pausas, inicio de habla, auto-stop por silencio)
//  - SpeechRecognition (transcripción + confianza)
export class Recorder {
  constructor({ lang, useAudio = true, autoStop = true, silenceSec = 3, maxWaitSec = 15, maxSec = 180, onInterim, onLevel, onState } = {}) {
    Object.assign(this, { lang, useAudio, autoStop, silenceSec, maxWaitSec, maxSec, onInterim, onLevel, onState });
    this.finals = [];
    this.interim = "";
    this.events = [];
    this.stopped = false;
    this.recError = null;
  }

  async start() {
    this.t0 = performance.now();
    this.lastSoundAt = null;
    this.firstSpeechAt = null;
    this.speechSegs = [];
    this.curSeg = null;
    this.levels = [];

    // Audio + VAD
    if (this.useAudio && hasRecorder) {
      try {
        const s = await openMic();
        const ctx = audioCtx();
        const src = ctx.createMediaStreamSource(s);
        this.analyser = ctx.createAnalyser();
        this.analyser.fftSize = 1024;
        src.connect(this.analyser);
        this.buf = new Float32Array(this.analyser.fftSize);
        this.noise = 0.008;
        this.calibUntil = performance.now() + 350;
        const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((m) => MediaRecorder.isTypeSupported?.(m)) || "";
        this.chunks = [];
        this.mr = new MediaRecorder(s, mime ? { mimeType: mime } : undefined);
        this.mime = this.mr.mimeType || mime || "audio/webm";
        this.mr.ondataavailable = (e) => e.data.size && this.chunks.push(e.data);
        this.mr.start(500);
      } catch (e) {
        this.audioError = e.message || String(e);
        this.analyser = null;
        this.mr = null;
      }
    }

    // Reconocimiento
    if (hasRecognition) this.startRecognition();

    this.tick = setInterval(() => this.loop(), 60);
    this.onState?.("recording");
    return new Promise((resolve) => { this.resolve = resolve; });
  }

  startRecognition() {
    const r = new SR();
    r.lang = this.lang;
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;
    // Sin internet: usar el reconocimiento en el dispositivo si el navegador lo permite.
    if (!navigator.onLine && "processLocally" in r && localReady[this.lang] === "available") { try { r.processLocally = true; } catch {} }
    r.onresult = (e) => {
      const now = performance.now();
      this.lastResultAt = now;
      if (!this.firstResultAt) this.firstResultAt = now;
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) {
          const txt = res[0].transcript.trim();
          if (txt) this.finals.push({ t: now - this.t0, text: txt, conf: res[0].confidence });
        } else {
          interim += res[0].transcript;
        }
      }
      this.interim = interim.trim();
      this.onInterim?.(this.transcript(true));
    };
    r.onerror = (e) => {
      this.recError = e.error;
      if (e.error === "not-allowed" || e.error === "service-not-allowed") this.recFatal = true;
    };
    r.onend = () => {
      this.recEnded = true;
      if (!this.stopped && !this.recFatal) {
        try { this.recEnded = false; r.start(); } catch {}
      }
    };
    this.rec = r;
    try { r.start(); } catch (e) { this.recError = e.message; }
  }

  level() {
    if (!this.analyser) return 0;
    this.analyser.getFloatTimeDomainData(this.buf);
    let sum = 0;
    for (let i = 0; i < this.buf.length; i++) sum += this.buf[i] * this.buf[i];
    return Math.sqrt(sum / this.buf.length);
  }

  loop() {
    const now = performance.now();
    const el = now - this.t0;
    let speaking = false;
    if (this.analyser) {
      const lv = this.level();
      // Piso de ruido: el MÍNIMO observado al inicio (si la persona habla de inmediato, no se toma su voz como ruido).
      if (now < this.calibUntil) this.calMin = Math.min(this.calMin ?? 1, lv);
      else if (this.calMin != null) { this.noise = Math.min(0.03, Math.max(0.004, this.calMin * 1.2)); this.calMin = null; }
      const thr = Math.max(0.015, this.noise * 2.2);
      speaking = lv > thr;
      this.onLevel?.(Math.min(1, lv / 0.15));
      if (speaking) {
        this.lastSoundAt = now;
        if (!this.firstSpeechAt) this.firstSpeechAt = now;
        if (!this.curSeg) this.curSeg = { s: el, e: el };
        this.curSeg.e = el;
      } else if (this.curSeg && el - this.curSeg.e > 250) {
        this.speechSegs.push(this.curSeg);
        this.curSeg = null;
      }
    } else if (this.lastResultAt) {
      // Sin analizador: aproximar con eventos de reconocimiento.
      this.lastSoundAt = this.lastResultAt;
    }
    // El reconocimiento también es evidencia de que la persona empezó a hablar.
    if (!this.firstSpeechAt && this.firstResultAt) this.firstSpeechAt = Math.max(this.t0, this.firstResultAt - 600);

    if (this.autoStop) {
      const started = !!this.firstSpeechAt;
      const lastActivity = Math.max(this.lastSoundAt || 0, this.lastResultAt || 0);
      if (started && now - lastActivity > this.silenceSec * 1000) return this.stop("silencio");
      if (!started && el > this.maxWaitSec * 1000) return this.stop("sin-respuesta");
    }
    if (el > this.maxSec * 1000) return this.stop("tiempo-max");
  }

  transcript(withInterim = false) {
    const f = this.finals.map((x) => x.text).join(" ");
    return (withInterim && this.interim ? `${f} ${this.interim}` : f).trim();
  }

  async stop(reason = "manual") {
    if (this.stopped) return;
    this.stopped = true;
    clearInterval(this.tick);
    if (this.curSeg) { this.speechSegs.push(this.curSeg); this.curSeg = null; }
    const endAt = performance.now();

    // Cerrar reconocimiento y esperar resultados finales.
    if (this.rec) {
      await new Promise((res) => {
        const to = setTimeout(res, 1800);
        this.rec.onend = () => { clearTimeout(to); res(); };
        try { this.rec.stop(); } catch { clearTimeout(to); res(); }
      });
    }
    let blob = null;
    if (this.mr && this.mr.state !== "inactive") {
      blob = await new Promise((res) => {
        this.mr.onstop = () => res(new Blob(this.chunks, { type: this.mime }));
        try { this.mr.stop(); } catch { res(null); }
      });
    }
    this.onState?.("stopped");

    let text = this.transcript(false);
    if (!text && this.interim) text = this.interim; // a veces el último resultado no se finaliza
    const result = {
      reason,
      transcript: text,
      finals: this.finals,
      metrics: computeMetrics(this, endAt, text),
      audio: blob,
      mime: this.mime,
      recError: this.recError,
      audioError: this.audioError
    };
    this.resolve?.(result);
    return result;
  }
}

const FILLERS = {
  es: ["eh", "ehh", "em", "emm", "mm", "mmm", "este", "o sea", "bueno", "pues", "digamos", "verdad"],
  en: ["uh", "uhh", "um", "umm", "er", "erm", "like", "you know", "i mean", "so", "well", "kind of", "sort of"]
};
const SELF_CORR = {
  es: ["perdón", "digo", "o sea", "mejor dicho", "corrijo", "disculpe"],
  en: ["sorry", "i mean", "i'm sorry", "correction", "let me rephrase", "rather"]
};

export function countMatches(text, list) {
  const t = ` ${text.toLowerCase().replace(/[.,;:!?¿¡"]/g, " ").replace(/\s+/g, " ")} `;
  let n = 0;
  const hits = [];
  for (const f of list) {
    const re = new RegExp(`\\s${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s`, "g");
    const m = t.match(re);
    if (m) { n += m.length; hits.push(`${f}×${m.length}`); }
  }
  return { n, hits };
}

function computeMetrics(r, endAt, text) {
  const total = (endAt - r.t0) / 1000;
  const lang2 = r.lang.slice(0, 2);
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const latency = r.firstSpeechAt ? (r.firstSpeechAt - r.t0) / 1000 : null;
  let speechSec = null, pauses = [], longest = 0;
  if (r.speechSegs.length) {
    // fusionar segmentos separados por < 400 ms (respiraciones cortas)
    const segs = [];
    for (const s of r.speechSegs) {
      const last = segs[segs.length - 1];
      if (last && s.s - last.e < 400) last.e = s.e;
      else segs.push({ ...s });
    }
    speechSec = segs.reduce((a, s) => a + (s.e - s.s), 0) / 1000;
    for (let i = 1; i < segs.length; i++) {
      const gap = (segs[i].s - segs[i - 1].e) / 1000;
      if (gap >= 1) pauses.push(+gap.toFixed(1));
    }
    longest = pauses.length ? Math.max(...pauses) : 0;
  } else if (r.finals.length > 1) {
    for (let i = 1; i < r.finals.length; i++) {
      const gap = (r.finals[i].t - r.finals[i - 1].t) / 1000;
      if (gap > 2.5) pauses.push(+gap.toFixed(1));
    }
    longest = pauses.length ? Math.max(...pauses) : 0;
  }
  // Si el detector de volumen captó muy poco (micrófono bajo), usar el tiempo desde que empezó a hablar.
  const fallbackSec = latency != null ? total - latency : total;
  const activeSec = speechSec && speechSec > words * 0.25 ? speechSec : fallbackSec;
  const wpm = activeSec > 1 && words ? Math.round((words / activeSec) * 60) : null;
  const confs = r.finals.map((f) => f.conf).filter((c) => c > 0);
  const conf = confs.length ? +(confs.reduce((a, b) => a + b, 0) / confs.length).toFixed(2) : null;
  const fill = countMatches(text, FILLERS[lang2] || []);
  const corr = countMatches(text, SELF_CORR[lang2] || []);
  return {
    duracion_total_s: +total.toFixed(1),
    latencia_inicio_s: latency != null ? +latency.toFixed(1) : null,
    tiempo_hablando_s: speechSec != null ? +speechSec.toFixed(1) : null,
    palabras: words,
    palabras_por_minuto: wpm,
    pausas_mayores_1s: pauses.length,
    pausa_mas_larga_s: +longest.toFixed(1),
    muletillas_detectadas: fill.n,
    muletillas: fill.hits,
    autocorrecciones: corr.n,
    confianza_asr: conf,
    vad: !!r.analyser
  };
}

// ---------------- IndexedDB para audios ----------------
let dbp = null;
function db() {
  if (dbp) return dbp;
  dbp = new Promise((res, rej) => {
    const req = indexedDB.open("interpjud", 2);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains("audio")) d.createObjectStore("audio");
      if (!d.objectStoreNames.contains("tts")) d.createObjectStore("tts");
    };
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
  return dbp;
}
export async function saveAudio(id, blob) {
  if (!blob) return null;
  try {
    const d = await db();
    await new Promise((res, rej) => {
      const tx = d.transaction("audio", "readwrite");
      tx.objectStore("audio").put(blob, id);
      tx.oncomplete = res;
      tx.onerror = () => rej(tx.error);
    });
    return id;
  } catch { return null; }
}
export async function getAudio(id) {
  try {
    const d = await db();
    return await new Promise((res) => {
      const r = d.transaction("audio").objectStore("audio").get(id);
      r.onsuccess = () => res(r.result || null);
      r.onerror = () => res(null);
    });
  } catch { return null; }
}
export async function pruneAudio(keepIds) {
  try {
    const d = await db();
    const keys = await new Promise((res) => {
      const r = d.transaction("audio").objectStore("audio").getAllKeys();
      r.onsuccess = () => res(r.result || []);
      r.onerror = () => res([]);
    });
    const keep = new Set(keepIds);
    const tx = d.transaction("audio", "readwrite");
    for (const k of keys) if (!keep.has(k)) tx.objectStore("audio").delete(k);
  } catch {}
}

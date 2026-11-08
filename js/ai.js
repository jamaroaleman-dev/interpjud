// Integración con Claude (Anthropic SDK oficial, cargado en el navegador).
import { ESCENARIOS } from "./content.js";

const SDK_URL = "https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.2.0/+esm";
let AnthropicCls = null;
let client = null;
let clientKey = null;

export const MODELS = [
  { id: "claude-opus-5-5", label: "Claude Opus 5.5 (más preciso)" },
  { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5 (más barato y rápido)" }
];

export const CRITERIOS = [
  ["gramatica", "Gramática", "Estructura gramatical correcta: artículos, pronombres, tiempos verbales, concordancia de género y número."],
  ["vocabulario_general", "Vocabulario general", "Vocabulario amplio, preciso y adecuado al contexto, sin afectar la fidelidad."],
  ["fluidez", "Fluidez", "Producción continua, sin pausas largas, titubeos, muletillas, falsos comienzos ni autocorrecciones excesivas; ritmo adecuado."],
  ["pronunciacion", "Pronunciación", "Pronunciación clara e inteligible en el idioma de destino (acentuación, sonidos, entonación)."],
  ["comprension", "Comprensión", "Comprende íntegramente el mensaje original: transmite todo el contenido sin omisiones, adiciones ni distorsiones."],
  ["terminologia_juridica", "Terminología jurídica", "Traslada con precisión términos y expresiones legales al idioma de destino, con equivalentes del sistema dominicano."],
  ["interferencias", "Interferencias idiomáticas", "Evita falsos cognados, calcos y estructuras impropias del otro idioma."],
  ["numeros_nombres_fechas", "Números, nombres y fechas", "Preserva con exactitud cifras, montos, fechas, horas, nombres propios, direcciones y demás datos."],
  ["modismos_expresiones", "Modismos y expresiones", "Interpreta modismos y expresiones coloquiales por su sentido, sin traducciones literales incorrectas."],
  ["estilo_registro", "Estilo/registro", "Conserva el registro (formal, técnico, coloquial) y la primera persona del hablante, sin alterar el tono."]
];

async function loadSDK() {
  if (AnthropicCls) return AnthropicCls;
  const mod = await import(SDK_URL);
  AnthropicCls = mod.default || mod.Anthropic;
  return AnthropicCls;
}

export async function getClient(apiKey) {
  if (!apiKey) throw new Error("Falta la API key. Ve a Ajustes y pégala.");
  if (client && clientKey === apiKey) return client;
  const A = await loadSDK();
  client = new A({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 2 });
  clientKey = apiKey;
  return client;
}

function friendlyError(e) {
  const s = e?.status;
  if (s === 401) return "API key inválida. Revísala en Ajustes.";
  if (s === 403) return "La API key no tiene permiso para este modelo.";
  if (s === 429) return "Límite de uso alcanzado. Espera un minuto e intenta de nuevo.";
  if (s === 400 && /credit|balance/i.test(e.message)) return "Tu cuenta de Anthropic no tiene crédito. Recárgala en console.anthropic.com.";
  if (s >= 500) return "El servicio de Claude está ocupado. Intenta de nuevo en unos segundos.";
  if (e?.name === "TypeError" || /fetch|network/i.test(e?.message || "")) return "Sin conexión a internet.";
  return e?.message || String(e);
}

// Llamada con salida JSON estructurada y progreso por streaming.
const offlineErr = () => Object.assign(new Error("Sin conexión a internet."), { offline: true });
const isNetErr = (e) => !e?.status && (e?.name === "TypeError" || /connection|fetch|network|load failed|dynamically imported/i.test(`${e?.name} ${e?.message}`));

async function callJSON({ settings, system, user, schema, maxTokens = 16000, effort = "medium", onProgress }) {
  if (!navigator.onLine) throw offlineErr();
  let c;
  try { c = await getClient(settings.apiKey); } catch (e) { if (isNetErr(e)) throw offlineErr(); throw e; }
  try {
    const stream = c.beta.messages.stream({
      model: settings.model || "claude-opus-5-5",
      max_tokens: maxTokens,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort, format: { type: "json_schema", schema } },
      system,
      messages: [{ role: "user", content: user }]
    });
    let chars = 0;
    stream.on("text", (delta) => { chars += delta.length; onProgress?.(chars); });
    const msg = await stream.finalMessage();
    if (msg.stop_reason === "refusal") throw new Error("Claude no pudo procesar esta solicitud. Intenta con otro texto.");
    if (msg.stop_reason === "max_tokens") throw new Error("La respuesta quedó incompleta. Intenta con un ejercicio más corto.");
    const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    return JSON.parse(text);
  } catch (e) {
    if (e instanceof SyntaxError) throw new Error("Respuesta inválida de Claude. Intenta de nuevo.");
    if (isNetErr(e)) throw offlineErr();
    throw new Error(friendlyError(e));
  }
}

const obj = (props, req = Object.keys(props)) => ({ type: "object", properties: props, required: req, additionalProperties: false });
const str = { type: "string" };
const int = { type: "integer" };
const arr = (items) => ({ type: "array", items });

// ---------------- Evaluación ----------------
const EVAL_SCHEMA = obj({
  puntuaciones: obj(Object.fromEntries(CRITERIOS.map(([k]) => [k, obj({ nota: int, comentario: str })]))),
  resumen: str,
  fortalezas: arr(str),
  prioridades: arr(str),
  segmentos: arr(obj({
    indice: int,
    fidelidad: str,
    errores: arr(obj({ tipo: str, original: str, dijiste: str, sugerido: str, explicacion: str })),
    version_modelo: str
  })),
  terminos_a_estudiar: arr(obj({ termino: str, traduccion: str })),
  consejo_proxima_practica: str
});

const EVAL_SYSTEM = `Eres examinador(a) del Concurso para la Designación de Intérpretes Judiciales del Poder Judicial de la República Dominicana (Escuela Nacional de la Judicatura, convocatoria 2026). Evalúas la prueba ORAL (interpretación consecutiva, simultánea y traducción a la vista, español ↔ inglés).

El/la aspirante necesita al menos 90/100 en el oral para alcanzar el promedio global de 80. Tu trabajo es prepararle con una evaluación HONESTA y EXIGENTE: no infles notas. Un 5 significa nivel profesional de intérprete judicial certificado en ese criterio.

Escala por criterio (igual a la rúbrica oficial de la ENJ):
5 – Cumplimiento total. 4 – Cumplimiento parcial alto. 3 – Cumplimiento parcial bajo. 2 – Presenta oportunidades de mejora. 1 – Deficiencias significativas. 0 – No cumple.

Criterios (Bases, art. 6.2, párrafo II):
${CRITERIOS.map(([k, n, d]) => `- ${k} (${n}): ${d}`).join("\n")}

Cómo leer los datos que recibes:
- La versión del/la aspirante es una TRANSCRIPCIÓN AUTOMÁTICA (reconocimiento de voz del navegador). La puntuación, las mayúsculas y la ortografía NO son del/la aspirante: no las evalúes. Los números pueden aparecer en cifras o en letras indistintamente.
- El reconocimiento de voz suele omitir muletillas ("eh", "um"); por eso la fluidez se evalúa principalmente con las métricas medidas del audio: latencia de inicio, pausas mayores de 1 s, pausa más larga, palabras por minuto y tiempo hablando frente a la duración del original.
- La pronunciación es una ESTIMACIÓN: no escuchas el audio. Infiérela de la confianza del reconocimiento (confianza_asr; < 0.80 es preocupante) y de palabras transcritas que no tienen sentido en contexto pero suenan parecido a la palabra correcta (p. ej. "sheet" por "seat"), señal de que el reconocedor no entendió. Si no hay suficiente evidencia, no bajes de 4 por pronunciación y dilo en el comentario.
- Si una transcripción está vacía o muy corta, probablemente no hubo respuesta o falló el micrófono: refléjalo en comprensión y fluidez, y dilo.
- En consecutiva el/la intérprete debe hablar en primera persona (como el hablante), sin "dice que".
- Usa terminología jurídica dominicana (Código Procesal Penal, Ley 76-02 modificada por la Ley 10-15): medida de coerción, imputado, Ministerio Público, garantía económica, impedimento de salida, etc.

En "segmentos", analiza CADA segmento (usa su índice). En "errores", lista concretamente omisiones, adiciones, distorsiones, términos mal traducidos, interferencias, números/nombres alterados (tipo: omision | adicion | distorsion | terminologia | interferencia | numero_nombre_fecha | modismo | registro | gramatica). "version_modelo" es una interpretación modelo profesional del segmento al idioma de destino.
Escribe todo en español (las versiones modelo en el idioma de destino). Sé concreto/a y breve en los comentarios. "prioridades": máximo 3, accionables.`;

export async function evaluate({ settings, ejercicio, segmentos, onProgress }) {
  const payload = {
    tipo_de_ejercicio: ejercicio.tipoLabel,
    titulo: ejercicio.titulo,
    contexto: ejercicio.contexto || "",
    segmentos: segmentos.map((s, i) => ({
      indice: i,
      modalidad: s.modalidad,
      hablante: s.hablante || "",
      idioma_origen: s.idiomaOrigen === "es" ? "español" : "inglés",
      idioma_destino: s.idiomaOrigen === "es" ? "inglés" : "español",
      texto_original: s.texto,
      duracion_original_s: s.duracionOriginal ?? null,
      transcripcion_del_aspirante: s.transcripcion || "(vacío)",
      metricas: s.metricas
    }))
  };
  const user = `Evalúa este ejercicio de práctica del examen oral.\n\n${JSON.stringify(payload, null, 1)}`;
  const r = await callJSON({ settings, system: EVAL_SYSTEM, user, schema: EVAL_SCHEMA, effort: "medium", onProgress });
  // Normalizar notas 0–5
  for (const [k] of CRITERIOS) {
    const p = r.puntuaciones?.[k];
    if (p) p.nota = Math.max(0, Math.min(5, Math.round(Number(p.nota) || 0)));
  }
  return r;
}

// ---------------- Generación de ejercicios ----------------
const GEN_SYSTEM = `Eres un/a formador/a experto/a de intérpretes judiciales en la República Dominicana. Creas material de práctica REALISTA para el examen oral de intérpretes judiciales (español ↔ inglés) del Poder Judicial dominicano.
Requisitos del material:
- Contextos de tribunales dominicanos reales: Oficina de Atención Permanente, Juzgado de la Instrucción, Tribunal Colegiado, Corte de Apelación, Juzgado de Paz, Fiscalía. Actores: juez/jueza, fiscal (Ministerio Público), defensa (abogado privado o defensor público), querellante, imputado/a, víctima, testigo, perito.
- Los hispanohablantes son dominicanos; los anglohablantes son extranjeros (EE. UU., Canadá, Reino Unido, Jamaica, Bahamas, etc.) con registro natural (coloquial si son testigos o imputados, técnico si son peritos).
- Incluye SIEMPRE: cifras, montos (RD$ y US$), fechas, horas, nombres propios completos, direcciones o lugares dominicanos, números de expediente/cédula/pasaporte, terminología procesal (CPP Ley 76-02 y Ley 10-15) y al menos 2 modismos o expresiones coloquiales.
- El texto debe sonar natural al leerse en voz alta (sin viñetas, sin abreviaturas raras, sin marcas de formato).
- No repitas los títulos ya usados que se te indiquen.`;

const CONSEC_SCHEMA = obj({ titulo: str, contexto: str, turnos: arr(obj({ hablante: str, idioma: { type: "string", enum: ["es", "en"] }, texto: str })) });
const SIMUL_SCHEMA = obj({ titulo: str, contexto: str, idioma: { type: "string", enum: ["es", "en"] }, texto: str });
const VISTA_SCHEMA = obj({ titulo: str, idioma: { type: "string", enum: ["es", "en"] }, texto: str });

const NIVEL = { 1: "básico (frases cortas y claras)", 2: "intermedio (como un examen típico)", 3: "avanzado (frases largas, densas, más cifras y tecnicismos; más difícil que el examen)" };

export async function generate({ settings, tipo, nivel = 2, escenario, idioma, enfoque, usados = [], onProgress }) {
  const esc = escenario || ESCENARIOS[Math.floor(Math.random() * ESCENARIOS.length)];
  let user, schema;
  const extra = `${enfoque ? `\nEnfócate especialmente en practicar: ${enfoque}.` : ""}\nTítulos ya usados (no repetir): ${usados.slice(-15).join(" | ") || "ninguno"}.`;
  if (tipo === "consec") {
    schema = CONSEC_SCHEMA;
    user = `Crea un diálogo de audiencia para practicar interpretación CONSECUTIVA bidireccional.
Escenario: ${esc}. Nivel: ${NIVEL[nivel]}.
Entre 9 y 12 turnos, alternando actores hispanohablantes (idioma "es") y un actor anglohablante (idioma "en"). Cada turno entre ${nivel === 1 ? "15 y 35" : nivel === 2 ? "25 y 60" : "45 y 90"} palabras, con algunos turnos cortos de respuesta. "hablante" es el rol (Juez, Fiscal, Defensa, Imputado, Testigo, Víctima, Perito...). "contexto" describe el tribunal y la situación en 1-2 oraciones.${extra}`;
  } else if (tipo === "simul") {
    schema = SIMUL_SCHEMA;
    const lang = idioma || (Math.random() < 0.5 ? "es" : "en");
    user = `Crea un discurso continuo para practicar interpretación SIMULTÁNEA, en idioma "${lang}" (${lang === "es" ? "español dominicano formal de tribunal: alegato del fiscal, de la defensa, lectura de una decisión, etc." : "inglés: relato de testigo/víctima, testimonio de perito, declaración de imputado, etc."}).
Escenario: ${esc}. Nivel: ${NIVEL[nivel]}. Longitud: ${nivel === 1 ? "170 a 220" : nivel === 2 ? "250 a 320" : "330 a 420"} palabras, un solo bloque de texto en párrafo corrido.${extra}`;
  } else {
    schema = VISTA_SCHEMA;
    const lang = idioma || (Math.random() < 0.5 ? "es" : "en");
    user = `Crea un documento breve para practicar TRADUCCIÓN A LA VISTA (el/la intérprete lo lee y lo dice en voz alta en el otro idioma). Idioma del documento: "${lang}". Tipo: ${lang === "es" ? "acta de arresto, acta de allanamiento, dispositivo de sentencia, auto, citación, certificado médico legal, etc." : "police report, affidavit, court order, medical report, lab report, letter from an embassy, etc."}
Escenario: ${esc}. Nivel: ${NIVEL[nivel]}. Entre ${nivel === 1 ? "90 y 130" : nivel === 2 ? "130 y 190" : "190 y 260"} palabras, redacción jurídica auténtica.${extra}`;
  }
  return callJSON({ settings, system: GEN_SYSTEM, user, schema, maxTokens: 8000, effort: "low", onProgress });
}

// ---------------- Módulos por criterio ----------------
const CRIT_EVAL_SCHEMA = obj({
  nota: int,
  comentario: str,
  items: arr(obj({ indice: int, nota: int, problema: str, sugerido: str })),
  consejos: arr(str)
});

export async function evaluateCriterion({ settings, criterio, items, onProgress }) {
  const c = CRITERIOS.find(([k]) => k === criterio);
  const system = `Eres examinador(a) del examen oral de intérpretes judiciales del Poder Judicial dominicano (ENJ, 2026), español ↔ inglés. En esta prueba evalúas UN SOLO criterio: «${c[1]}» — ${c[2]}
Califica cada ítem de 0 a 5 SOLO en ese criterio (5 = nivel de intérprete judicial certificado; 4 = parcial alto; 3 = parcial bajo; 2 = oportunidades de mejora; 1 = deficiencias significativas; 0 = no cumple o no respondió). Sé exigente y honesto/a: el aspirante necesita 90/100.
La versión del aspirante es una transcripción automática: ignora puntuación, mayúsculas y ortografía. ${criterio === "fluidez" ? "Para fluidez, básate sobre todo en las métricas medidas: latencia de inicio (ideal < 2 s), pausas > 1 s, pausa más larga, palabras por minuto (ideal 110–150) y si completó el mensaje." : ""}
En «problema» describe brevemente el fallo relacionado con este criterio (vacío si no hay). En «sugerido» da una versión correcta del fragmento problemático o de todo el ítem. «nota» global = tu calificación del criterio de 0 a 5 para el conjunto. «consejos»: máximo 3, concretos. Responde en español.`;
  const user = JSON.stringify({ criterio: c[1], items: items.map((it, i) => ({ indice: i, idioma_origen: it.lang === "es" ? "español" : "inglés", idioma_destino: it.lang === "es" ? "inglés" : "español", original: it.t, transcripcion_aspirante: it.transcripcion || "(vacío)", metricas: it.metricas })) }, null, 1);
  const r = await callJSON({ settings, system, user, schema: CRIT_EVAL_SCHEMA, maxTokens: 8000, effort: "low", onProgress });
  r.nota = Math.max(0, Math.min(5, Math.round(Number(r.nota) || 0)));
  for (const it of r.items || []) it.nota = Math.max(0, Math.min(5, Math.round(Number(it.nota) || 0)));
  return r;
}

const SET_SCHEMA = obj({
  quiz: arr(obj({ pregunta: str, opciones: arr(str), correcta: int, explicacion: str })),
  orales: arr(obj({ texto: str }))
});
const PASAJE_SCHEMA = obj({
  titulo: str, texto: str,
  preguntas: arr(obj({ pregunta: str, opciones: arr(str), correcta: int }))
});

export async function generateCriterionSet({ settings, criterio, lang, onProgress }) {
  const c = CRITERIOS.find(([k]) => k === criterio);
  const origen = lang === "es" ? "español" : "inglés", destino = lang === "es" ? "inglés" : "español";
  if (criterio === "comprension") {
    const user = `Crea un pasaje para practicar COMPRENSIÓN AUDITIVA en ${origen} (120–170 palabras), contexto judicial dominicano (testimonio, relato de agente, decisión del tribunal, peritaje), con cifras, horas, nombres y matices (negaciones, condiciones). Luego 4 preguntas de selección múltiple escritas en ${destino}, de 4 opciones cada una, con distractores plausibles (cifras parecidas, matices invertidos). «correcta» es el índice (0–3).`;
    return callJSON({ settings, system: GEN_SYSTEM, user, schema: PASAJE_SCHEMA, maxTokens: 6000, effort: "low", onProgress });
  }
  const user = `Crea material para practicar el criterio «${c[1]}» (${c[2]}) del examen oral de intérpretes judiciales, dirección ${origen} → ${destino}.
1) "quiz": 8 preguntas de selección múltiple. Cada "pregunta" presenta un fragmento en ${origen} (entre comillas, de contexto judicial) o una situación, y las 4 "opciones" son posibles versiones en ${destino}; solo una es correcta respecto a este criterio, y los distractores contienen errores típicos de ese criterio. "correcta" = índice 0–3 (varía la posición). "explicacion" breve en español.
2) "orales": 6 frases en ${origen} (15–40 palabras) para interpretar oralmente al ${destino}, cargadas de dificultades de este criterio, en contexto de audiencias dominicanas.`;
  return callJSON({ settings, system: GEN_SYSTEM, user, schema: SET_SCHEMA, maxTokens: 8000, effort: "low", onProgress });
}

// Prueba rápida de la key.
export async function testKey(settings) {
  const c = await getClient(settings.apiKey);
  try {
    const m = await c.messages.create({
      model: settings.model || "claude-opus-5-5",
      max_tokens: 50,
      output_config: { effort: "low" },
      messages: [{ role: "user", content: "Responde solo: OK" }]
    });
    return m.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  } catch (e) {
    throw new Error(friendlyError(e));
  }
}

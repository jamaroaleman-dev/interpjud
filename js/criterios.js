// Contenido de los módulos por criterio (Bases, art. 6.2, párrafo II).
// Quiz: d = idioma del original ("en" = de inglés a español, "es" = de español a inglés).
// Orales: lang = idioma del original que se interpreta (o que se repite en pronunciación).

export const FALSOS_AMIGOS = [
  ["actually", "en realidad / de hecho", "actualmente (= currently)"],
  ["currently", "actualmente", "corrientemente"],
  ["eventually", "con el tiempo / finalmente", "eventualmente (= possibly)"],
  ["to realize", "darse cuenta", "realizar (= to carry out)"],
  ["to assist", "ayudar", "asistir (= to attend)"],
  ["to attend", "asistir / acudir", "atender (= to take care of)"],
  ["to arrest", "arrestar / detener", "—"],
  ["to sentence", "condenar / imponer una pena", "sentenciar (aceptable, pero condenar es más preciso)"],
  ["conviction", "condena (penal) / convicción (creencia)", "convicción en contexto penal"],
  ["evidence", "pruebas / elementos de prueba", "evidencia (calco frecuente; en derecho dominicano: prueba)"],
  ["to commit (a crime)", "cometer", "comprometer"],
  ["to be committed (to a facility)", "ser internado", "estar comprometido"],
  ["sensible", "sensato", "sensible (= sensitive)"],
  ["sensitive", "sensible / delicado", "sensitivo"],
  ["embarrassed", "avergonzado", "embarazada (= pregnant)"],
  ["constipated", "estreñido", "constipado (= resfriado)"],
  ["exit", "salida", "éxito (= success)"],
  ["success", "éxito", "suceso (= event)"],
  ["event / incident", "suceso / hecho / incidente", "evento (para hechos delictivos suena calco)"],
  ["library", "biblioteca", "librería (= bookstore)"],
  ["record", "registro / expediente / antecedentes", "récord"],
  ["file (a complaint)", "presentar / interponer", "filear / archivar"],
  ["to charge (with a crime)", "acusar / imputar", "cargar / cobrar"],
  ["charges", "cargos / acusación", "cargas"],
  ["attorney", "abogado", "atorrante"],
  ["advice", "consejo / asesoría", "aviso (= notice)"],
  ["notice", "aviso / notificación", "noticia (= news)"],
  ["to introduce (evidence)", "presentar / aportar", "introducir"],
  ["to support", "respaldar / apoyar / mantener", "soportar (= to tolerate)"],
  ["fabric", "tela", "fábrica (= factory)"],
  ["parents", "padres", "parientes (= relatives)"],
  ["relatives", "parientes / familiares", "relativos"],
  ["carpet", "alfombra", "carpeta (= folder)"],
  ["discussion", "conversación / debate", "discusión (= argument)"],
  ["argument", "discusión / pelea / alegato", "argumento (solo cuando es razonamiento)"],
  ["injury", "lesión / herida", "injuria (= insult, defamation)"],
  ["offense", "infracción / delito", "ofensa (= insult)"],
  ["jury", "jurado", "—"],
  ["to sustain an injury", "sufrir una lesión", "sostener una lesión"],
  ["deception", "engaño", "decepción (= disappointment)"],
  ["molest", "abusar sexualmente", "molestar (= to bother)"],
  ["to resume", "reanudar", "resumir (= to summarize)"],
  ["Your Honor", "Su Señoría / Honorable / Magistrado(a)", "Su Honor"],
  ["in the event that", "en caso de que", "en el evento de que"],
  ["to apply for", "solicitar", "aplicar para"],
  ["to make a decision", "tomar una decisión", "hacer una decisión (inglés: make)"]
];

export const PARES_PRON = {
  en: [
    ["sheet / seat / sit", "Vocal larga /iː/ vs. corta /ɪ/: «leave» ≠ «live», «feel» ≠ «fill»."],
    ["three / tree / free", "«th» sorda /θ/: la lengua entre los dientes. No es «t» ni «f»."],
    ["they / day / those", "«th» sonora /ð/: «the», «that», «there». No es «d»."],
    ["walked / wanted / robbed", "Terminación -ed: /t/ (walked), /ɪd/ (wanted), /d/ (robbed). No pronuncies la «e»."],
    ["Spanish / estate / Stanley", "Nunca pongas «e» delante de s + consonante: «Spain», no «Espain»."],
    ["very / berry", "/v/ con labio inferior y dientes; /b/ con ambos labios."],
    ["judge / jury / George", "/dʒ/ como «ch» sonora; «judge» no es «yod»."],
    ["fifteen / fifty", "Acento: fifTEEN vs. FIFty. Crucial con números."],
    ["can / can't", "«can» débil /kən/; «can't» fuerte /kænt/. Cambia el sentido."],
    ["hearing / heroin / hair", "«h» aspirada suave, no la «j» fuerte del español."],
    ["world / word / work", "La «r» inglesa no vibra; la lengua no toca el paladar."],
    ["months / clothes / sixths", "Grupos de consonantes finales: pronúncialos todos."]
  ],
  es: [
    ["ustedes / después / mismo", "Pronuncia la «s» final y antes de consonante; en el tribunal evita la aspiración («uhtede»)."],
    ["comer / mujer / Señor", "La «r» final es «r», no «l» ni «i» («comel», «mujei»)."],
    ["perro / pero / carro / caro", "Distingue la «rr» múltiple de la «r» simple."],
    ["acusado / cansado / pasado", "Pronuncia la «d» intervocálica: «acusado», no «acusao»."],
    ["usted / verdad / libertad", "La «d» final suave pero presente."],
    ["para / está / vamos a", "Evita reducciones informales: «pa'», «'tá», «vamo'»."],
    ["ciudad / ocasión / zapato", "Seseo es correcto en RD; solo cuida la claridad de la «s»."],
    ["imputado / ministerio / audiencia", "Articula cada sílaba de los términos jurídicos."]
  ]
};

export const GUIAS = {
  gramatica: [
    "Concordancia: el sujeto y el verbo, el sustantivo y el adjetivo (la víctima fue trasladada, aunque sea hombre).",
    "Subjuntivo en español tras verbos de petición, duda o mandato: «el tribunal ordena que se presente», «solicito que sea liberado».",
    "Inglés: no omitas el sujeto («he said», no «said»); usa el auxiliar en preguntas y negaciones («Did you see him?»).",
    "Pasado simple vs. presente perfecto: «I have lived here for 5 years» = «vivo aquí desde hace 5 años».",
    "Estilo directo: en consecutiva hablas en primera persona («I was scared», no «she says she was scared»).",
    "Preposiciones: «depend on» = depender de; «consist of» = consistir en; «on Monday» = el lunes."
  ],
  vocabulario_general: [
    "Domina el vocabulario cotidiano de los relatos: partes del cuerpo, lesiones, ropa, vehículos, armas, drogas, dinero, parentesco.",
    "Busca la palabra exacta, no la aproximada: «bruise» = moretón/hematoma (no «golpe»); «purse» = cartera; «wallet» = billetera.",
    "Usa registro neutro y comprensible para todos en el tribunal; evita regionalismos innecesarios.",
    "Si no conoces una palabra, describe con precisión antes que inventar; en el examen es mejor que omitir."
  ],
  fluidez: [
    "Arranca en menos de 2 segundos tras el original en consecutiva; en simultánea mantén 2–4 s de desfase.",
    "Evita muletillas («eh», «este», «um», «like») y falsos comienzos. Una pausa breve en silencio es mejor que «eeeh».",
    "Ritmo objetivo: 110–150 palabras por minuto, constante, sin acelerar al final.",
    "Si te equivocas, corrige una sola vez y sigue («…el martes, perdón, el miércoles…»).",
    "Practica shadowing: repetir en voz alta, al mismo tiempo, lo que escuchas en el mismo idioma."
  ],
  pronunciacion: [
    "La pronunciación se evalúa por inteligibilidad: que el juez entienda cada palabra a la primera.",
    "En inglés: vocales largas/cortas, «th», terminación -ed, acento de las palabras (fifTEEN/FIFty).",
    "En español: pronuncia «s», «r» y «d» finales; en el tribunal, español estándar, sin aspiración ni lambdacismo.",
    "En este módulo el app te dice la frase y tú la repites; el reconocimiento de voz mide qué tan claro te entiende."
  ],
  comprension: [
    "Escucha ideas, no palabras: quién, qué, cuándo, dónde, cómo, por qué.",
    "Anota cifras, nombres y fechas de inmediato; son lo primero que se olvida.",
    "Atento a negaciones, condiciones y matices («I didn't say I saw him» ≠ «I said I didn't see him»).",
    "Si no entendiste, en un tribunal real pides repetición; en el examen, cuenta como pérdida de comprensión."
  ],
  terminologia_juridica: [
    "Usa el término del sistema dominicano (Código Procesal Penal): «bail» → garantía económica; «prosecutor» → Ministerio Público/fiscal.",
    "No traduzcas literal: «order to stand trial» → auto de apertura a juicio; «plea bargain» → procedimiento penal abreviado.",
    "Conoce las fórmulas: «sustained» → ha lugar; «overruled» → no ha lugar; «all rise» → de pie.",
    "Repasa el glosario a diario: 15 términos por ronda, en ambas direcciones."
  ],
  interferencias: [
    "Falsos amigos: «actually» ≠ actualmente; «evidence» → pruebas; «injury» ≠ injuria.",
    "Calcos de estructura: «hacer una decisión» (make a decision) → tomar una decisión; «aplicar para» → solicitar.",
    "Orden de adjetivos y uso de artículos: «the defendant» → el imputado; «justice» → la justicia.",
    "Pasiva inglesa abusiva: «was arrested by the police» → «la policía lo arrestó» o «fue arrestado»."
  ],
  numeros_nombres_fechas: [
    "«Billion» (EE. UU.) = mil millones, no «billón» (que en español es un millón de millones).",
    "Fechas: «March 3rd, 2025» → «el 3 de marzo de 2025». «03/04/2025» en EE. UU. es 4 de marzo... al revés que en RD.",
    "Separadores: 1,500.50 (inglés) = 1.500,50 o 1,500.50 en RD; al hablar di «mil quinientos con cincuenta».",
    "Conserva las unidades del original (millas, libras); no conviertas salvo que te lo pidan.",
    "Nombres propios: no los traduzcas (John no es Juan); deletrea mentalmente los apellidos difíciles."
  ],
  modismos_expresiones: [
    "Traduce el sentido, no las palabras: «drunk as a skunk» → borracho perdido; «I had no clue» → no tenía ni idea.",
    "Mantén el nivel coloquial: si el testigo es coloquial, tu versión también (sin vulgarizar ni elevar).",
    "Dominicanismos comunes en audiencias: motoconcho, colmado, pela, tíguere, jumao, vaina.",
    "Si no existe equivalente, usa una paráfrasis fiel y breve."
  ],
  estilo_registro: [
    "Conserva el registro: el juez es formal, el testigo puede ser coloquial; no «mejores» ni «empeores» el lenguaje.",
    "Primera persona siempre: «I didn't do it» → «Yo no lo hice», nunca «dice que no lo hizo».",
    "Mantén titubeos relevantes, tono y cortesía («Your Honor» → Su Señoría/Honorable), y groserías con un equivalente de la misma fuerza.",
    "No agregues explicaciones, no resumas, no suavices."
  ]
};

// ---------------- QUIZ ----------------
export const QUIZ = {
  gramatica: [
    { d: "es", q: "«El juez ordenó que el imputado fuera trasladado.»", o: ["The judge ordered that the defendant was transferred.", "The judge ordered the defendant to be transferred.", "The judge ordered that the defendant transfer.", "The judge order the defendant be transferred."], c: 1, e: "«Ordered + objeto + to be + participio» es la estructura natural; «order» sin -ed no está en pasado." },
    { d: "en", q: "«If I had known, I would have called the police.»", o: ["Si yo sabía, hubiera llamado a la policía.", "Si hubiera sabido, habría llamado a la policía.", "Si sabría, habría llamado a la policía.", "Si he sabido, llamaría a la policía."], c: 1, e: "Condicional irreal del pasado: «si hubiera/hubiese + participio, habría/hubiera + participio»." },
    { d: "en", q: "«The victim, a 45-year-old man, was taken to the hospital.»", o: ["La víctima, un hombre de 45 años, fue llevado al hospital.", "La víctima, un hombre de 45 años, fue llevada al hospital.", "El víctima, un hombre de 45 años, fue llevado al hospital.", "La víctima, hombre de 45 años, fueron llevados al hospital."], c: 1, e: "«Víctima» es femenino gramatical: el participio concuerda con ella (llevada), aunque sea un hombre." },
    { d: "es", q: "«¿Usted vio quién disparó?»", o: ["You saw who shot?", "Did you see who fired?", "Did you saw who fired?", "You did see who did fire?"], c: 1, e: "Pregunta con auxiliar «did» + verbo en base (see)." },
    { d: "en", q: "«I have been living in Santo Domingo for three years.»", o: ["He estado viviendo en Santo Domingo por tres años.", "Vivo en Santo Domingo desde hace tres años.", "Viví en Santo Domingo por tres años.", "Estuve viviendo en Santo Domingo tres años."], c: 1, e: "El presente perfecto continuo con «for» indica que la acción continúa: en español, presente + «desde hace»." },
    { d: "es", q: "«Le dije que no se acercara a mi casa.»", o: ["I told him not to come near my house.", "I said him to not approach to my house.", "I told him that he doesn't come near my house.", "I said to him don't come near my house."], c: 0, e: "«Tell + objeto + (not) to + verbo»; «approach» no lleva «to»." },
    { d: "es", q: "«Los documentos que la defensa presentó no fueron admitidos.»", o: ["The documents what the defense presented were not admitted.", "The documents that the defense submitted were not admitted.", "The documents that the defense submitted was not admitted.", "The documents the defense submitted they were not admitted."], c: 1, e: "Relativo «that/which», concordancia plural (were) y sin pronombre redundante." },
    { d: "en", q: "«Neither the driver nor the passengers were injured.»", o: ["Ni el conductor ni los pasajeros resultaron heridos.", "Ni el conductor o los pasajeros fue herido.", "Ni el conductor ni los pasajeros no resultaron heridos.", "El conductor ni los pasajeros resultaron heridos."], c: 0, e: "«Ni… ni…» con verbo en plural y sin doble negación añadida." }
  ],
  vocabulario_general: [
    { d: "en", q: "«She had a bruise on her left cheek.»", o: ["Tenía un golpe en la mejilla izquierda.", "Tenía un moretón en la mejilla izquierda.", "Tenía una herida en la mejilla izquierda.", "Tenía una cicatriz en la mejilla izquierda."], c: 1, e: "«Bruise» = moretón/hematoma. «Golpe» es la causa; «scar» = cicatriz; «wound» = herida." },
    { d: "en", q: "«He grabbed my purse.»", o: ["Agarró mi billetera.", "Agarró mi cartera.", "Agarró mi bolsillo.", "Agarró mi mochila."], c: 1, e: "«Purse» = cartera (de mujer); «wallet» = billetera; «backpack» = mochila." },
    { d: "es", q: "«Tenía una cortada en la ceja y le dieron tres puntos.»", o: ["He had a cut on his eyebrow and they gave him three points.", "He had a cut on his eyebrow and got three stitches.", "He had a cut in his eyelash and got three stitches.", "He had a wound in his eyebrow and they gave him three dots."], c: 1, e: "Puntos de sutura = stitches. Ceja = eyebrow; pestaña = eyelash." },
    { d: "en", q: "«The car swerved and hit the curb.»", o: ["El carro frenó y chocó la acera.", "El carro dio un viraje brusco y chocó con el contén.", "El carro se volcó y chocó la curva.", "El carro aceleró y le dio a la cuneta."], c: 1, e: "«Swerve» = dar un viraje/volantazo; «curb» = contén/bordillo (en RD, contén)." },
    { d: "es", q: "«El arma estaba debajo del asiento del conductor.»", o: ["The weapon was under the driver's seat.", "The gun was below of the driver chair.", "The arm was under the driver's seat.", "The weapon was under the conductor's seat."], c: 0, e: "«Arma» = weapon/gun (nunca «arm»); «conductor» = driver." },
    { d: "en", q: "«My stepfather used to beat my mother.»", o: ["Mi padrastro solía golpear a mi madre.", "Mi suegro le ganaba a mi madre.", "Mi padrino solía pegarle a mi madre.", "Mi medio padre golpeaba a mi madre."], c: 0, e: "«Stepfather» = padrastro; «father-in-law» = suegro; «godfather» = padrino; «beat» aquí = golpear." },
    { d: "es", q: "«Me robaron el celular en la parada de la guagua.»", o: ["They robbed my cellular at the bus stop.", "My cell phone was stolen at the bus stop.", "They stole my cell at the bus parade.", "My phone was robbed at the bus station."], c: 1, e: "Se roba a una persona (rob someone) pero se hurta un objeto (steal something). Parada = bus stop." }
  ],
  terminologia_juridica: [], // se genera automáticamente desde el glosario
  interferencias: [
    { d: "en", q: "«Actually, I wasn't there that night.»", o: ["Actualmente, yo no estaba allí esa noche.", "En realidad, yo no estaba allí esa noche.", "Actualmente, no estuve allí esa noche.", "Realmente actual, no estaba allí."], c: 1, e: "«Actually» = en realidad / de hecho. «Actualmente» = currently." },
    { d: "en", q: "«The police found no evidence of forced entry.»", o: ["La policía no encontró evidencia de entrada forzada.", "La policía no encontró indicios de que se forzara la entrada.", "La policía no encontró evidencias de entrada forzosa.", "La policía no halló evidencia forzada."], c: 1, e: "«Evidence» en español jurídico: pruebas/indicios. «Entrada forzada» es calco; mejor «que se forzara la entrada»." },
    { d: "en", q: "«He sustained serious injuries.»", o: ["Sostuvo injurias serias.", "Sufrió lesiones graves.", "Mantuvo heridas serias.", "Sostuvo lesiones serias."], c: 1, e: "«Sustain an injury» = sufrir una lesión. «Injuria» = insulto/difamación." },
    { d: "es", q: "«Me di cuenta de que me estaban siguiendo.»", o: ["I realized they were following me.", "I gave myself account they were following me.", "I noticed me they were following.", "I realized me that they followed me."], c: 0, e: "«Darse cuenta» = to realize. «Realizar» en español = to carry out." },
    { d: "es", q: "«El abogado va a aplicar para la libertad condicional.»", o: ["The lawyer will apply for parole.", "The lawyer will apply to the conditional liberty.", "The lawyer is going to apply the parole.", "The lawyer will make application to the conditional freedom."], c: 0, e: "Aquí el original contiene el calco («aplicar para»); en inglés «apply for parole» es correcto. En español, lo correcto sería «solicitar»." },
    { d: "en", q: "«She was very embarrassed.»", o: ["Estaba muy embarazada.", "Estaba muy avergonzada.", "Estaba muy apenada de embarazo.", "Estaba muy molesta."], c: 1, e: "«Embarrassed» = avergonzada. «Embarazada» = pregnant." },
    { d: "es", q: "«Asistí a la audiencia del lunes.»", o: ["I assisted the hearing on Monday.", "I attended the hearing on Monday.", "I assisted to the audience on Monday.", "I attended to the audience Monday."], c: 1, e: "«Asistir a» = to attend. «Audiencia» judicial = hearing (no «audience»)." },
    { d: "en", q: "«We had a discussion about the payment.»", o: ["Tuvimos una discusión sobre el pago.", "Hablamos sobre el pago.", "Discutimos fuertemente sobre el pago.", "Tuvimos un argumento sobre el pago."], c: 1, e: "«Discussion» = conversación; «discusión» en español sugiere pelea (argument)." },
    { d: "es", q: "«Su Señoría, quiero hacer una pregunta.»", o: ["Your Lordship, I want to make a question.", "Your Honor, I'd like to ask a question.", "Your Honor, I want to do a question.", "Sir Honor, I want to make a question."], c: 1, e: "«Hacer una pregunta» = ask a question (no «make»). Fórmula: Your Honor." }
  ],
  numeros_nombres_fechas: [
    { d: "en", q: "«The fraud totaled 2.3 billion dollars.»", o: ["El fraude ascendió a 2.3 billones de dólares.", "El fraude ascendió a 2,300 millones de dólares.", "El fraude ascendió a 23 mil millones de dólares.", "El fraude ascendió a 2.3 millones de dólares."], c: 1, e: "«Billion» (EE. UU.) = mil millones. 2.3 billion = 2,300 millones." },
    { d: "en", q: "«The incident occurred on 04/07/2025» (documento de EE. UU.)", o: ["El 4 de julio de 2025", "El 7 de abril de 2025", "El 4 de julio o el 7 de abril, da igual", "El 47 de 2025"], c: 1, e: "En EE. UU. el formato es mes/día/año: 04/07 = 7 de abril." },
    { d: "es", q: "«Se ocuparon un millón quinientos mil pesos.»", o: ["One million five hundred pesos were seized.", "1.5 million pesos were seized.", "One billion five hundred thousand pesos were seized.", "Fifteen hundred thousand pesos were seized."], c: 1, e: "1,500,000 = one million five hundred thousand = 1.5 million." },
    { d: "en", q: "«He's six foot two and weighs 210 pounds.»", o: ["Mide 1.88 metros y pesa 95 kilos.", "Mide seis pies dos pulgadas y pesa 210 libras.", "Mide seis dos y pesa 210 kilos.", "Mide 6.2 pies y pesa 210 libras."], c: 1, e: "Conserva las unidades del original. No conviertas salvo instrucción del tribunal." },
    { d: "es", q: "«El hecho ocurrió a las 9:45 de la noche.»", o: ["It happened at 9:45 p.m.", "It happened at 21:45 a.m.", "It happened at quarter to nine at night.", "It happened at 9:45 in the morning."], c: 0, e: "9:45 de la noche = 9:45 p.m. (también «quarter to ten»)." },
    { d: "en", q: "«Officer John Wright testified.»", o: ["El agente Juan Derecho declaró.", "El agente John Wright declaró.", "El oficial Juan Wright testificó.", "El agente John Right declaró."], c: 1, e: "Los nombres propios no se traducen." },
    { d: "es", q: "«Cédula núm. 001-0458721-3»", o: ["ID number zero zero one, zero four five eight seven two one, three", "ID number one, four hundred fifty-eight thousand, three", "ID number one million four hundred...", "Passport number 001"], c: 0, e: "Los números de identificación se leen dígito por dígito, respetando los grupos." },
    { d: "en", q: "«Fifteen» vs. «fifty»: «He paid fifty dollars.»", o: ["Pagó quince dólares.", "Pagó cincuenta dólares.", "Pagó cinco dólares.", "Pagó quinientos dólares."], c: 1, e: "FIFty (50) lleva el acento al inicio; fifTEEN (15) al final." }
  ],
  modismos_expresiones: [], // se complementa desde la lista de modismos
  estilo_registro: [
    { d: "en", q: "Testigo: «Yeah, the dude was totally wasted, like, he couldn't even stand up.»", o: ["Sí, el sujeto se encontraba en estado de embriaguez y no podía mantenerse de pie.", "Sí, el tipo estaba borracho perdido, o sea, ni siquiera podía pararse.", "Dice que el señor estaba muy borracho y no podía pararse.", "Afirmativo, el individuo estaba ebrio."], c: 1, e: "Conserva el registro coloquial y la primera persona; no lo eleves ni resumas." },
    { d: "es", q: "Juez: «Se le advierte que debe conducirse con respeto en esta sala.»", o: ["Hey, you gotta behave in here.", "You are hereby warned that you must conduct yourself respectfully in this courtroom.", "The judge says you have to be respectful.", "Please be nice in the room."], c: 1, e: "Registro formal judicial y sin estilo indirecto." },
    { d: "en", q: "Imputado: «I didn't do nothing, man. I swear to God.»", o: ["Yo no hice nada, hombre. Te lo juro por Dios.", "El imputado alega no haber hecho nada.", "No realicé ninguna acción, lo juro.", "Dice que no hizo nada y que lo jura."], c: 0, e: "Primera persona, mismo tono emocional y coloquial." },
    { d: "es", q: "Testigo: «Ese tíguere me cayó a pela por na'.»", o: ["That guy beat me up for no reason.", "That tiger hit me with a pail.", "The witness says the man assaulted him.", "That individual physically assaulted me without cause."], c: 0, e: "Equivalente coloquial con la misma fuerza; ni literal ni elevado." },
    { d: "en", q: "Abogada: «Objection, Your Honor. Counsel is leading the witness.»", o: ["Objeción, Su Señoría. El abogado está guiando al testigo.", "Objeción, Honorable. El colega está formulando preguntas sugestivas al testigo.", "Ella objeta porque el abogado está ayudando al testigo.", "Protesto, juez, el licenciado está diciéndole qué decir."], c: 1, e: "Registro técnico-formal y terminología: pregunta sugestiva = leading question." },
    { d: "en", q: "Víctima, llorando: «He… he said he'd kill me. I… I was so scared.»", o: ["Él… él dijo que me iba a matar. Yo… yo tenía tanto miedo.", "Él manifestó que la iba a matar y ella sintió miedo.", "Dijo que me mataría. Tenía miedo.", "Ella dice que tenía mucho miedo."], c: 0, e: "Conserva titubeos relevantes, la primera persona y la carga emocional." },
    { d: "es", q: "Fiscal: «Honorable, el Ministerio Público no tiene más preguntas.»", o: ["Your Honor, the prosecution has no further questions.", "Judge, we're done.", "Your Honor, the Public Ministry don't have more questions.", "Honorable, the Ministry is finished asking."], c: 0, e: "Fórmula equivalente y natural: the prosecution has no further questions." }
  ],
  comprension: [] // ver PASAJES
};

// Pasajes de comprensión auditiva: se escuchan (sin texto) y luego se responden preguntas.
export const PASAJES = [
  {
    lang: "en",
    titulo: "Declaración sobre un asalto en un parqueo",
    texto: "It was around eight fifteen on a Friday night. I had just left the supermarket on Lincoln Avenue and was loading groceries into my trunk when a man in a gray hoodie came up behind me. He didn't say a word at first. He just pressed something hard against my back and told me to hand over my keys. I gave him the keys, but I didn't give him my purse, because he never asked for it. He drove off in my car, a white 2019 Toyota Corolla, heading north. The whole thing lasted maybe thirty seconds. I didn't see a gun, and to be honest, I'm not sure it was a gun at all.",
    preguntas: [
      { q: "¿A qué hora ocurrió?", o: ["8:50 p.m.", "8:15 p.m.", "Las 5:15 p.m.", "Al mediodía"], c: 1 },
      { q: "¿Qué le entregó la víctima al asaltante?", o: ["La cartera y las llaves", "Solo la cartera", "Solo las llaves", "Nada"], c: 2 },
      { q: "¿Qué afirma sobre el arma?", o: ["Vio claramente una pistola", "No vio un arma y no está segura de que lo fuera", "Era un cuchillo", "El asaltante le mostró el arma"], c: 1 },
      { q: "¿Qué vehículo se llevó?", o: ["Toyota Corolla gris 2009", "Toyota Corolla blanco 2019", "Honda Civic blanco 2019", "Toyota Camry blanco 2019"], c: 1 }
    ]
  },
  {
    lang: "es",
    titulo: "Relato de un agente sobre un allanamiento",
    texto: "El allanamiento se realizó el día doce de marzo, a las seis de la mañana, en una vivienda de dos niveles ubicada en la calle Primera del sector Villa Mella. Participaron ocho agentes de la Dirección Nacional de Control de Drogas y un representante del Ministerio Público. Al tocar la puerta, nadie respondió, por lo que se procedió a abrirla con un ariete. En el segundo nivel encontramos a dos hombres y una mujer. Debajo de un colchón ocupamos tres paquetes envueltos en cinta adhesiva color marrón y la suma de ochenta y cuatro mil pesos en efectivo. La mujer manifestó que ella solo era inquilina y que no sabía nada de los paquetes.",
    preguntas: [
      { q: "When was the search carried out?", o: ["March 2nd at 6 a.m.", "March 12th at 6 a.m.", "May 12th at 6 p.m.", "March 12th at 7 a.m."], c: 1 },
      { q: "How many DNCD agents took part?", o: ["Six", "Eight", "Eighteen", "Two"], c: 1 },
      { q: "Where were the packages found?", o: ["In a closet on the first floor", "Under a mattress", "Inside the front door", "In a car"], c: 1 },
      { q: "What did the woman say?", o: ["That the packages were hers", "That she was only a tenant and knew nothing about the packages", "That the money belonged to her husband", "Nothing"], c: 1 }
    ]
  },
  {
    lang: "en",
    titulo: "Testimonio de un gerente de banco",
    texto: "Mr. Valdez opened the account on June 3rd, 2022. Over the next fourteen months, the account received seventeen international wire transfers, mostly from Canada and the United States, for a total of just over four hundred and twelve thousand dollars. What caught our attention was that the money never stayed in the account for more than forty-eight hours. It was withdrawn in cash, always in amounts just under ten thousand dollars, which is the reporting threshold. We filed a suspicious activity report in August 2023.",
    preguntas: [
      { q: "¿Cuántas transferencias recibió la cuenta?", o: ["Siete", "Diecisiete", "Setenta", "Catorce"], c: 1 },
      { q: "¿Qué llamó la atención del banco?", o: ["Que el dinero venía de Europa", "Que el dinero salía en efectivo en menos de 48 horas, en montos justo por debajo de 10,000", "Que el titular no tenía cédula", "Que las transferencias eran de más de 10,000"], c: 1 },
      { q: "¿Cuál fue el total aproximado?", o: ["US$412,000", "US$4,120,000", "US$41,200", "US$420,000"], c: 0 },
      { q: "¿Cuándo se reportó la actividad sospechosa?", o: ["Junio de 2022", "Agosto de 2023", "Agosto de 2022", "Junio de 2023"], c: 1 }
    ]
  },
  {
    lang: "es",
    titulo: "Decisión sobre una solicitud de aplazamiento",
    texto: "El tribunal, luego de escuchar a las partes, rechaza la solicitud de aplazamiento formulada por la defensa, toda vez que el testigo a cargo fue debidamente citado en dos ocasiones y no ha justificado su incomparecencia. En consecuencia, se ordena la conducencia del testigo por medio de la fuerza pública y se fija la continuación del juicio para el próximo jueves veinte, a las diez de la mañana. Quedan citadas las partes presentes y representadas.",
    preguntas: [
      { q: "What did the court decide about the postponement?", o: ["It granted it", "It denied it", "It postponed the decision", "It referred it to the Court of Appeals"], c: 1 },
      { q: "Why?", o: ["Because the defense filed it late", "Because the witness was duly summoned twice and didn't justify his absence", "Because the defendant was absent", "Because the prosecutor objected"], c: 1 },
      { q: "What was ordered regarding the witness?", o: ["That he be fined", "That he be brought in by the police", "That his testimony be excluded", "That he be arrested for perjury"], c: 1 },
      { q: "When will the trial continue?", o: ["Tuesday the 20th at 10 a.m.", "Thursday the 20th at 10 a.m.", "Thursday the 12th at 10 a.m.", "Thursday the 20th at 2 p.m."], c: 1 }
    ]
  }
];

// ---------------- ORALES ----------------
export const ORALES = {
  gramatica: [
    { lang: "en", t: "If he had stopped at the light, none of this would have happened." },
    { lang: "en", t: "I've been working at that hotel since 2019, but I was fired two weeks before the incident." },
    { lang: "en", t: "The officer asked me whether I had been drinking, and I told him I hadn't." },
    { lang: "en", t: "Neither my wife nor my children were home when they broke in." },
    { lang: "es", t: "El tribunal ordena que el imputado sea puesto en libertad, siempre que deposite la garantía económica." },
    { lang: "es", t: "Si yo hubiera sabido lo que había en la maleta, nunca la habría aceptado." },
    { lang: "es", t: "Le pedí que no se fuera, pero ya se había montado en la motocicleta." },
    { lang: "es", t: "Es necesario que la víctima sea examinada nuevamente por un médico legista." }
  ],
  vocabulario_general: [
    { lang: "en", t: "He had a black eye, a split lip, and bruises all over his ribs." },
    { lang: "en", t: "I left my wallet and my car keys on the kitchen counter, next to the microwave." },
    { lang: "en", t: "My brother-in-law borrowed my pickup truck and returned it with a dent in the bumper." },
    { lang: "en", t: "She was wearing flip-flops, cutoff jeans, and a yellow tank top." },
    { lang: "es", t: "Tenía una cortada en la frente y le dieron cinco puntos en la clínica." },
    { lang: "es", t: "El ladrón saltó la verja, rompió el candado y se llevó la bombona de gas." },
    { lang: "es", t: "Mi cuñado estaba sentado en la galería cuando escuchó los disparos." },
    { lang: "es", t: "La guagua frenó de golpe y una señora se cayó en el pasillo." }
  ],
  fluidez: [
    { lang: "en", t: "I got off work at around eleven, stopped at the gas station to buy a soda, and when I came back out, two guys were standing next to my car. One of them asked me for a cigarette, and when I said I didn't smoke, the other one pulled out a knife and told me to give him everything I had." },
    { lang: "en", t: "We had been arguing for weeks about money. That night he came home late, he'd been drinking, and he started yelling at me in front of the kids. I told him to leave, and that's when he grabbed my arm and pushed me against the wall." },
    { lang: "en", t: "The shipment arrived at the Port of Caucedo on the fourteenth. The container was supposed to carry plantains, but when customs ran it through the scanner, they noticed irregular shapes in the back. That's when they called us." },
    { lang: "es", t: "El día de los hechos, el imputado llegó al colmado alrededor de las nueve de la noche, pidió una cerveza y empezó a discutir con la víctima por una deuda. Varios testigos vieron cuando salió del lugar y regresó minutos después con un arma de fuego en la mano." },
    { lang: "es", t: "Honorables, la defensa solicita que se rechace la medida de coerción solicitada por el Ministerio Público, toda vez que nuestro representado tiene un domicilio fijo, un empleo estable y nunca ha sido sometido a la justicia." },
    { lang: "es", t: "Yo estaba en mi casa con mis hijos cuando escuché que estaban rompiendo la puerta. Agarré a los niños y nos escondimos en el baño. Llamé al novecientos once, pero tardaron casi media hora en llegar." }
  ],
  pronunciacion: [
    { lang: "en", t: "The three witnesses thought the thief left through the back door." },
    { lang: "en", t: "He walked to the bank, wanted to withdraw cash, and was robbed at the entrance." },
    { lang: "en", t: "Your Honor, the jury heard the judge's instructions this morning." },
    { lang: "en", t: "She was sixteen, not sixty, when she first visited the Dominican Republic." },
    { lang: "en", t: "I can't remember whether it was fifteen or fifty dollars." },
    { lang: "en", t: "The sheriff's deputy searched the vehicle and seized the weapon." },
    { lang: "en", t: "This is the third time the defendant has violated the restraining order." },
    { lang: "es", t: "Ustedes deben presentarse ante el tribunal el próximo martes a las nueve de la mañana." },
    { lang: "es", t: "El acusado declaró que no recordaba a qué hora había llegado a su casa." },
    { lang: "es", t: "El perro corrió detrás del carro hasta la carretera principal." },
    { lang: "es", t: "La señora Mercedes Rodríguez es la querellante y actora civil en este proceso." },
    { lang: "es", t: "Se impone la prisión preventiva como medida de coerción por un período de tres meses." },
    { lang: "es", t: "Después de la audiencia, los abogados de la defensa conversaron con el fiscal." }
  ],
  terminologia_juridica: [
    { lang: "en", t: "The judge denied bail because the defendant was considered a flight risk." },
    { lang: "en", t: "Counsel, your objection is overruled. The witness may answer the question." },
    { lang: "en", t: "The prosecution offered a plea agreement in exchange for a guilty plea." },
    { lang: "es", t: "El Ministerio Público presentó acto conclusivo de acusación y solicitó auto de apertura a juicio." },
    { lang: "es", t: "El tribunal impuso impedimento de salida del país y presentación periódica cada quince días." },
    { lang: "es", t: "La defensa interpuso un recurso de apelación contra la sentencia condenatoria." }
  ],
  interferencias: [
    { lang: "en", t: "Actually, I didn't realize he was injured until I saw the blood." },
    { lang: "en", t: "Eventually, the police found enough evidence to charge him with the offense." },
    { lang: "en", t: "I was so embarrassed that I didn't attend the hearing." },
    { lang: "en", t: "We had a discussion and then the argument got out of hand." },
    { lang: "es", t: "Actualmente, el imputado asiste a terapia y se dio cuenta de su error." },
    { lang: "es", t: "La defensa solicitó que se excluyan las pruebas obtenidas sin orden judicial." },
    { lang: "es", t: "El testigo sufrió lesiones leves y tomó la decisión de presentar una querella." },
    { lang: "es", t: "Mis parientes me apoyaron cuando estuve detenido." }
  ],
  numeros_nombres_fechas: [], // usa el generador de cifras (drills)
  modismos_expresiones: [
    { lang: "en", t: "I had no clue what was going on. He just went off on me out of nowhere." },
    { lang: "en", t: "When the cops showed up, he took off running and they never caught him." },
    { lang: "en", t: "He was drunk as a skunk and kept running his mouth all night." },
    { lang: "en", t: "I know I messed up, Your Honor. I just want to come clean and get this over with." },
    { lang: "es", t: "Ese tíguere andaba jumao y me cayó a pela sin ningún motivo." },
    { lang: "es", t: "Yo estaba en olla, por eso acepté llevar la vaina sin preguntar." },
    { lang: "es", t: "El motoconcho me dio una bola hasta el colmado de la esquina." },
    { lang: "es", t: "Él siempre se hace el chivo loco cuando le preguntan por el dinero." }
  ],
  estilo_registro: [
    { lang: "en", t: "Look, man, I don't know nothing about no drugs. I was just chilling with my boys." },
    { lang: "en", t: "Your Honor, the defense respectfully requests a brief recess to confer with our client." },
    { lang: "en", t: "He… he grabbed me and… I'm sorry… I just froze. I couldn't scream." },
    { lang: "es", t: "Se le advierte al testigo que está bajo juramento y que el falso testimonio constituye una infracción penal." },
    { lang: "es", t: "Mire, licenciado, yo no sé de qué me está hablando, yo soy un hombre trabajador." },
    { lang: "es", t: "Con el debido respeto, Honorable, el Ministerio Público se opone a la solicitud de la defensa." }
  ],
  comprension: []
};

// Cómo se practica/evalúa cada criterio.
//  quiz: "propio" (preguntas escritas), "glosario" (auto desde glosario), "modismos" (auto), "pasajes" (comprensión auditiva), null
//  oral: "interp" (interpretar y evaluar con IA), "terminos" (tarjetas habladas), "numeros" (cifras), "shadow" (repetir), null
export const MODO = {
  gramatica: { quiz: "propio", oral: "interp" },
  vocabulario_general: { quiz: "propio", oral: "interp" },
  fluidez: { quiz: null, oral: "interp" },
  pronunciacion: { quiz: null, oral: "shadow" },
  comprension: { quiz: "pasajes", oral: null },
  terminologia_juridica: { quiz: "glosario", oral: "terminos" },
  interferencias: { quiz: "propio", oral: "interp" },
  numeros_nombres_fechas: { quiz: "propio", oral: "numeros" },
  modismos_expresiones: { quiz: "modismos", oral: "interp" },
  estilo_registro: { quiz: "propio", oral: "interp" }
};

export const ICONOS = {
  gramatica: "📐", vocabulario_general: "📚", fluidez: "🌊", pronunciacion: "👄", comprension: "👂",
  terminologia_juridica: "⚖️", interferencias: "🔀", numeros_nombres_fechas: "🔢", modismos_expresiones: "💬", estilo_registro: "🎩"
};

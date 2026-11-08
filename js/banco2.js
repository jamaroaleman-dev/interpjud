// Banco ampliado (escrito sin usar la API). Se fusiona con los bancos base al cargar.
import { QUIZ, ORALES, PASAJES } from "./criterios.js";
import { DIALOGOS, DISCURSOS, VISTAS, GLOSARIO, MODISMOS } from "./content.js";

const QUIZ2 = {
  gramatica: [
    { d: "en", q: "«The defendant claims he was never told about his rights.»", o: ["El imputado alega que nunca le informaron de sus derechos.", "El imputado alega que nunca fue dicho sobre sus derechos.", "El imputado reclama que nunca se le dijo de sus derechos.", "El imputado alega que nunca le informaban sus derechos."], c: 0, e: "La pasiva inglesa «was told» se traduce mejor con impersonal activa («le informaron»); «claim» = alegar, no «reclamar»." },
    { d: "en", q: "«By the time the police arrived, the suspect had already left.»", o: ["Cuando la policía llegó, el sospechoso ya se fue.", "Para cuando llegó la policía, el sospechoso ya se había ido.", "Por el tiempo que la policía llegó, el sospechoso ya había dejado.", "Cuando la policía llegaba, el sospechoso ya se iba."], c: 1, e: "Pluscuamperfecto: «had left» = se había ido. «By the time» = para cuando." },
    { d: "en", q: "«I want you to tell the court exactly what you saw.»", o: ["Quiero que usted le diga al tribunal exactamente lo que vio.", "Quiero usted decir al tribunal exactamente qué vio.", "Quiero que usted le dice al tribunal exactamente lo que vio.", "Yo quiero a usted decirle al tribunal lo que vio exacto."], c: 0, e: "«Want + objeto + to» exige subjuntivo en español: «quiero que usted diga»." },
    { d: "en", q: "«There were three men in the car, one of whom was armed.»", o: ["Había tres hombres en el carro, uno de quien estaba armado.", "Habían tres hombres en el carro, uno de los cuales estaba armado.", "Había tres hombres en el carro, uno de los cuales estaba armado.", "Hubieron tres hombres en el carro, uno estaba armado."], c: 2, e: "«Haber» impersonal no se pluraliza (había, no «habían»); «one of whom» = uno de los cuales." },
    { d: "en", q: "«Had the witness not called 911, the victim would have died.»", o: ["Si el testigo no hubiera llamado al 911, la víctima habría muerto.", "Si el testigo no había llamado al 911, la víctima se moría.", "Tenía el testigo no llamado al 911, la víctima habría muerto.", "Si el testigo no llamaba al 911, la víctima moriría."], c: 0, e: "Inversión condicional «Had… not» = «si no hubiera…»." },
    { d: "en", q: "«She's been crying since she got here.»", o: ["Ella ha estado llorando desde que llegó.", "Ella está llorando desde que llegó aquí.", "Ella ha estado llorando desde que llega.", "Ella estuvo llorando desde que llegó."], c: 0, e: "Presente perfecto continuo: ha estado llorando (o «no ha parado de llorar»)." },
    { d: "es", q: "«Si me hubieran avisado, habría venido antes.»", o: ["If they would have told me, I would have come earlier.", "If they had told me, I would have come earlier.", "If they told me, I will come earlier.", "If they had told me, I would came earlier."], c: 1, e: "Condicional tipo 3: if + past perfect, would have + participio." },
    { d: "es", q: "«Hace dos años que no veo a mi hijo.»", o: ["It makes two years that I don't see my son.", "I haven't seen my son for two years.", "I don't see my son since two years.", "Two years ago I didn't see my son."], c: 1, e: "«Hace X que no…» = present perfect negativo + «for» / «in»." },
    { d: "es", q: "«Es posible que el imputado no entienda español.»", o: ["It's possible that the defendant doesn't understand Spanish.", "It's possible the defendant don't understand Spanish.", "Is possible that the defendant not understands Spanish.", "It's possible that the defendant doesn't understands Spanish."], c: 0, e: "Sujeto explícito «it», concordancia «doesn't understand»." },
    { d: "es", q: "«A mí me robaron la cartera y a mi esposo, el reloj.»", o: ["They stole me the purse and my husband the watch.", "My purse was stolen, and so was my husband's watch.", "To me they robbed the purse and to my husband the watch.", "They robbed my purse and my husband's watch."], c: 1, e: "Pasiva natural en inglés; «steal» un objeto, no «rob»." },
    { d: "es", q: "«Le pregunté dónde estaba la noche del crimen.»", o: ["I asked him where was he the night of the crime.", "I asked him where he was on the night of the crime.", "I asked to him where he was in the night of the crime.", "I asked him where he were the night of the crime."], c: 1, e: "Pregunta indirecta: sin inversión (where he was). «On the night of»." },
    { d: "es", q: "«Ninguno de los testigos vio el arma.»", o: ["None of the witnesses saw the weapon.", "Any of the witnesses didn't see the weapon.", "No one of the witnesses didn't see the gun.", "None of the witnesses didn't see the weapon."], c: 0, e: "«None of» sin doble negación." }
  ],
  vocabulario_general: [
    { d: "en", q: "«He was wearing a hoodie and sweatpants.»", o: ["Llevaba una sudadera con capucha y pantalones deportivos.", "Llevaba un gorro y pantalones de sudor.", "Llevaba una chaqueta y unos jeans.", "Llevaba un abrigo y pantalones cortos."], c: 0, e: "Hoodie = sudadera con capucha (en RD también «hoodie»); sweatpants = pantalón deportivo/mono." },
    { d: "en", q: "«My nephew was babysitting my daughter.»", o: ["Mi sobrino estaba cuidando a mi hija.", "Mi nieto estaba cuidando a mi hija.", "Mi primo estaba bañando a mi hija.", "Mi sobrino estaba sentado con mi hija."], c: 0, e: "Nephew = sobrino; grandson = nieto; babysit = cuidar niños." },
    { d: "en", q: "«The bullet grazed his shoulder.»", o: ["La bala le atravesó el hombro.", "La bala le rozó el hombro.", "La bala le quebró el hombro.", "La bala se le alojó en el hombro."], c: 1, e: "Graze = rozar. Go through = atravesar; lodge = alojarse." },
    { d: "en", q: "«She tripped over the hose and sprained her ankle.»", o: ["Se tropezó con la manguera y se torció el tobillo.", "Se cayó por la escalera y se rompió la rodilla.", "Se tropezó con la media y se torció el pie.", "Se resbaló en la manguera y se quebró el tobillo."], c: 0, e: "Trip over = tropezar con; hose = manguera; sprain = torcerse/esguince." },
    { d: "en", q: "«I heard a loud bang and saw smoke coming from the hood.»", o: ["Oí un golpe fuerte y vi humo saliendo del bonete.", "Oí un estruendo y vi humo saliendo del capó.", "Oí un disparo y vi humo saliendo del techo.", "Oí un ruido y vi humo saliendo de la capucha."], c: 1, e: "Hood (de carro) = capó (en RD «bonete» es coloquial; «capó» es neutro). Bang = estruendo/estallido." },
    { d: "en", q: "«They found a stash of cash in the attic.»", o: ["Encontraron un escondite de dinero en el ático.", "Encontraron dinero escondido en el sótano.", "Encontraron una bolsa de monedas en el techo.", "Encontraron un cheque en el ático."], c: 0, e: "Stash = alijo/escondite; attic = ático/desván; basement = sótano." },
    { d: "es", q: "«Le dieron una puñalada en el abdomen.»", o: ["They punched him in the abdomen.", "He was stabbed in the abdomen.", "He was kicked in the stomach.", "They gave him a punch in the belly."], c: 1, e: "Puñalada = stab wound (stabbed). Puñetazo = punch." },
    { d: "es", q: "«El vehículo tenía los cristales tintados.»", o: ["The vehicle had tinted windows.", "The vehicle had painted crystals.", "The vehicle had broken glasses.", "The vehicle had dark mirrors."], c: 0, e: "Cristales tintados = tinted windows." },
    { d: "es", q: "«Mi suegra vive en el segundo piso.»", o: ["My stepmother lives on the second floor.", "My mother-in-law lives on the second floor.", "My mother-in-law lives in the second flat.", "My sister-in-law lives on the second floor."], c: 1, e: "Suegra = mother-in-law; madrastra = stepmother; cuñada = sister-in-law." },
    { d: "es", q: "«Encontraron una funda con hierba seca.»", o: ["They found a cover with dry grass.", "They found a bag containing dried plant material.", "They found a pillowcase with dry herbs.", "They found a holster with dry weed."], c: 1, e: "En RD «funda» = bolsa plástica. «Hierba seca» en contexto de drogas: dried plant material / marijuana-like substance." },
    { d: "es", q: "«Se escapó por el patio y brincó la verja.»", o: ["He escaped through the backyard and jumped the fence.", "He escaped through the patio and jumped the gate.", "He escaped by the yard and skipped the wall.", "He ran through the porch and climbed the roof."], c: 0, e: "Brincar la verja = jump the fence." },
    { d: "es", q: "«Tenía un tatuaje en el antebrazo y una cicatriz en la barbilla.»", o: ["He had a tattoo on his forearm and a scar on his chin.", "He had a tattoo in his arm and a scratch on his cheek.", "He had a tattoo on his wrist and a scar on his jaw.", "He had a tattoo on his elbow and a mark in his chin."], c: 0, e: "Antebrazo = forearm; barbilla = chin; mejilla = cheek; mandíbula = jaw." }
  ],
  interferencias: [
    { d: "en", q: "«The suspect was eventually arrested in Puerto Plata.»", o: ["El sospechoso fue eventualmente arrestado en Puerto Plata.", "Finalmente, el sospechoso fue arrestado en Puerto Plata.", "El sospechoso fue posiblemente arrestado en Puerto Plata.", "El sospechoso fue arrestado ocasionalmente en Puerto Plata."], c: 1, e: "«Eventually» = finalmente/con el tiempo. «Eventualmente» significa posiblemente." },
    { d: "en", q: "«He was charged with fraud.»", o: ["Fue cargado con fraude.", "Se le acusó de estafa.", "Le cobraron por fraude.", "Fue cargado de estafa."], c: 1, e: "«Charge with» = acusar de / imputar." },
    { d: "en", q: "«I'm not sure if I'm making sense.»", o: ["No estoy seguro de si estoy haciendo sentido.", "No sé si me estoy explicando bien.", "No estoy seguro si hago sentido.", "No estoy seguro de que tenga sentido común."], c: 1, e: "«Make sense» = tener sentido / explicarse; «hacer sentido» es calco." },
    { d: "en", q: "«My attorney advised me not to talk.»", o: ["Mi abogado me avisó que no hablara.", "Mi abogado me aconsejó no hablar.", "Mi atorrante me avisó no hablar.", "Mi abogado me advirtió de no hablar."], c: 1, e: "«Advise» = aconsejar; «avisar» = notify." },
    { d: "en", q: "«She's very sensible; she wouldn't lie.»", o: ["Es muy sensible; no mentiría.", "Es muy sensata; no mentiría.", "Es muy sentimental; no mentiría.", "Es muy sensitiva; no mentiría."], c: 1, e: "«Sensible» = sensata." },
    { d: "es", q: "«El imputado está muy molesto con su abogado.»", o: ["The defendant is very molested by his lawyer.", "The defendant is very upset with his lawyer.", "The defendant is very bothered of his lawyer.", "The defendant is very annoying with his lawyer."], c: 1, e: "«Molesto» = upset/annoyed; «molested» = abusado sexualmente." },
    { d: "es", q: "«La fiscal introdujo nuevas pruebas.»", o: ["The prosecutor introduced new proofs.", "The prosecutor submitted new evidence.", "The prosecutor introduced new tests.", "The prosecutor entered new probes."], c: 1, e: "«Pruebas» = evidence (incontable). «Introducir pruebas» = submit/introduce evidence." },
    { d: "es", q: "«El testigo realizó una llamada al 911.»", o: ["The witness realized a call to 911.", "The witness made a call to 911.", "The witness did a 911 call realization.", "The witness performed a call at 911."], c: 1, e: "«Realizar» = make/carry out; «realize» = darse cuenta." },
    { d: "es", q: "«Estoy constipado desde ayer, por eso no vine.»", o: ["I've been constipated since yesterday, that's why I didn't come.", "I've had a cold since yesterday, that's why I didn't come.", "I'm constipated from yesterday, for that I didn't come.", "I've been sick of the stomach since yesterday."], c: 1, e: "«Constipado» = resfriado (a cold); «constipated» = estreñido. Falso amigo clásico." },
    { d: "es", q: "«Solicito que se libre acta de la incomparecencia del testigo.»", o: ["I request that the absence of the witness be noted for the record.", "I solicit that a free act be made of the witness.", "I request a free record of the witness incomparecence.", "I ask to liberate an act of the witness."], c: 0, e: "«Librar acta» = dejar constancia / note for the record." }
  ],
  numeros_nombres_fechas: [
    { d: "en", q: "«He owes me three grand.»", o: ["Me debe tres grandes.", "Me debe tres mil dólares.", "Me debe trescientos dólares.", "Me debe treinta mil."], c: 1, e: "«Grand» = mil (dólares)." },
    { d: "en", q: "«It happened in the early nineties.»", o: ["Ocurrió a principios de los noventa.", "Ocurrió a los noventa años.", "Ocurrió temprano a las nueve.", "Ocurrió a finales de los noventa."], c: 0, e: "«Early nineties» = a principios de la década de 1990." },
    { d: "en", q: "«The car was doing about 80 in a 55.»", o: ["El carro iba a unas 80 millas por hora en una zona de 55.", "El carro iba a 80 kilómetros por hora en una zona de 55.", "El carro tenía 80 años y 55 millas.", "El carro hacía 80 en 55 minutos."], c: 0, e: "En EE. UU., velocidad en millas por hora; conserva la unidad." },
    { d: "en", q: "«A quarter past seven.»", o: ["Las siete menos cuarto.", "Las siete y cuarto.", "Las siete y quince de la noche.", "Un cuarto para las siete."], c: 1, e: "«Quarter past seven» = 7:15. «Quarter to seven» = 6:45." },
    { d: "en", q: "«Born on the 4th of July, 1976.»", o: ["Nacido el 4 de julio de 1976.", "Nacido el 7 de abril de 1976.", "Nacido el 4 de junio de 1976.", "Nacido el 14 de julio de 1976."], c: 0, e: "«The 4th of July» = 4 de julio." },
    { d: "en", q: "«The sentence was 15 to 25 years.»", o: ["La pena fue de 15 años más 25.", "La pena fue de entre 15 y 25 años.", "La pena fue de 15 años a las 25.", "La pena fue de 40 años."], c: 1, e: "«15 to 25» = condena indeterminada de entre 15 y 25 años." },
    { d: "es", q: "«Una pena de cinco años de reclusión mayor y multa de doscientos mil pesos.»", o: ["A sentence of five years in prison and a fine of 200,000 pesos.", "A sentence of fifty years and a fine of 2,000 pesos.", "Five years of major reclusion and a 20,000 peso fine.", "A sentence of five years and a fine of 200 pesos."], c: 0, e: "Doscientos mil = 200,000." },
    { d: "es", q: "«El pasado martes 3, a eso de las once y media de la noche.»", o: ["Last Tuesday the 3rd, at around 11:30 p.m.", "Last Thursday the 3rd, at 11:30 a.m.", "Last Tuesday the 13th, at around 11:30 p.m.", "Next Tuesday the 3rd, at 10:30 p.m."], c: 0, e: "Martes = Tuesday (jueves = Thursday); «a eso de» = at around." },
    { d: "es", q: "«Expediente núm. 034-2025-EPEN-00187»", o: ["Case number zero three four, two thousand twenty-five, EPEN, zero zero one eight seven.", "Case number thirty-four thousand...", "Case 34, 2025.", "File EPEN 187."], c: 0, e: "Los números de expediente se leen completos, en su orden y con sus letras." },
    { d: "es", q: "«Mil millones de pesos»", o: ["One million pesos", "One billion pesos", "One thousand million dollars", "One trillion pesos"], c: 1, e: "Mil millones = one billion (EE. UU.)." }
  ],
  estilo_registro: [
    { d: "en", q: "Testigo: «I'm like, what the heck, dude? And he just bolts.»", o: ["Y yo como que: ¿qué rayos, tipo? Y él sale corriendo.", "Le pregunté qué ocurría y él huyó del lugar.", "El testigo dice que le preguntó qué pasaba y el hombre se fue.", "Entonces manifesté mi sorpresa y el individuo se retiró."], c: 0, e: "Registro coloquial y primera persona conservados." },
    { d: "en", q: "Juez: «You may step down. Thank you for your testimony.»", o: ["Ya puede retirarse. Gracias por su testimonio.", "Bájate. Gracias por hablar.", "El juez dice que se puede bajar.", "Usted puede descender. Gracias por su testimonio."], c: 0, e: "Registro formal y fórmula natural del tribunal." },
    { d: "en", q: "Imputado: «With all due respect, ma'am, I never touched her.»", o: ["Con todo respeto, señora, yo nunca la toqué.", "Con el debido respeto, Su Señoría, yo nunca la toqué.", "Dice que con respeto, nunca la tocó.", "Oiga, yo nunca la toqué."], c: 0, e: "Conserva la cortesía y el tratamiento exactamente como fue dicho («ma'am» = señora)." },
    { d: "en", q: "Perito: «The deceased exhibited multiple contusions consistent with blunt force trauma.»", o: ["El fallecido tenía muchos golpes.", "El occiso presentaba múltiples contusiones compatibles con traumatismo por objeto contundente.", "El muerto estaba todo golpeado con algo duro.", "Dice que el señor tenía contusiones."], c: 1, e: "Registro técnico: no simplificar." },
    { d: "en", q: "Víctima: «He called me a stupid b— and slapped me.»", o: ["Me dijo una mala palabra y me pegó.", "Me dijo «estúpida, perra» y me dio una bofetada.", "Me insultó y me agredió físicamente.", "La insultó y le dio una cachetada."], c: 1, e: "Las groserías se interpretan con un equivalente de la misma fuerza; no se suavizan ni se omiten." },
    { d: "es", q: "Testigo: «Yo no sé na' de eso, mi amor. Yo taba en mi casa.»", o: ["I don't know nothin' about that, honey. I was at my house.", "I have no knowledge of that matter. I was at my residence.", "She says she doesn't know anything and was at home.", "I don't know about that, my love. I was at my home, Your Honor."], c: 0, e: "Registro coloquial; «mi amor» como apelativo = honey. No agregar «Your Honor»." },
    { d: "es", q: "Defensa: «Honorables, con el debido respeto, solicitamos la exclusión de dicho elemento probatorio.»", o: ["Your Honors, with all due respect, we move to exclude that piece of evidence.", "Judges, we want that evidence out.", "Honorable ones, with respect, we solicit the exclusion of said probatory element.", "The defense wants the evidence excluded."], c: 0, e: "Formal y natural: «move to exclude»." },
    { d: "es", q: "Imputado, nervioso: «Yo… yo no… yo nunca he estado preso, señor juez.»", o: ["I… I don't… I've never been in jail, Your Honor.", "I have never been incarcerated, Your Honor.", "He says he's never been in jail.", "I never was in jail, sir judge."], c: 0, e: "Conserva los titubeos y el tratamiento («señor juez» = Your Honor)." },
    { d: "es", q: "Fiscal: «Que conste en acta que el testigo ha señalado al imputado.»", o: ["Let the record reflect that the witness has identified the defendant.", "Put in the paper that he pointed at him.", "The prosecutor asks that it be recorded that the witness pointed.", "Let it consist in act that the witness signaled the accused."], c: 0, e: "Fórmula: «Let the record reflect that…»." },
    { d: "es", q: "Víctima: «Me dio una trompada que me dejó viendo estrellitas.»", o: ["He punched me so hard I was seeing stars.", "He struck me causing a brief loss of vision.", "He gave me a trumpet and I saw little stars.", "She says he hit her very hard."], c: 0, e: "Equivalente idiomático con la misma fuerza coloquial." }
  ],
  modismos_expresiones: [
    { d: "en", q: "«I was beating around the bush because I was scared.»", o: ["Le estaba dando vueltas al asunto porque tenía miedo.", "Estaba golpeando los arbustos porque tenía miedo.", "Me estaba escondiendo detrás de un arbusto.", "Estaba peleando por miedo."], c: 0, e: "«Beat around the bush» = andarse con rodeos / darle vueltas al asunto." },
    { d: "en", q: "«He threw me under the bus.»", o: ["Me tiró debajo de la guagua.", "Me echó la culpa para salvarse.", "Me atropelló con el autobús.", "Me dejó en la parada."], c: 1, e: "«Throw someone under the bus» = culpar a alguien para salvarse." },
    { d: "en", q: "«I was out like a light.»", o: ["Estaba fuera con una luz.", "Me quedé profundamente dormido.", "Se fue la luz.", "Salí rápido."], c: 1, e: "«Out like a light» = dormido profundamente al instante." },
    { d: "en", q: "«He's been on the run for two years.»", o: ["Lleva dos años prófugo.", "Lleva dos años corriendo.", "Lleva dos años en carreras.", "Lleva dos años trabajando."], c: 0, e: "«On the run» = prófugo / huyendo de la justicia." },
    { d: "en", q: "«She spilled the beans to the cops.»", o: ["Le regó los frijoles a la policía.", "Le contó todo a la policía.", "Le cocinó a la policía.", "Le mintió a la policía."], c: 1, e: "«Spill the beans» = soltar la sopa / contarlo todo." },
    { d: "es", q: "«Él se hizo el loco cuando le preguntaron por el dinero.»", o: ["He went crazy when they asked about the money.", "He played dumb when they asked about the money.", "He made himself crazy about the money.", "He got angry about the money."], c: 1, e: "«Hacerse el loco / el chivo loco» = play dumb." },
    { d: "es", q: "«Ese muchacho es un tíguere, se las sabe todas.»", o: ["That boy is a tiger, he knows everything.", "That kid is street-smart; he knows every trick in the book.", "That guy is dangerous and violent.", "That boy is a student who studies a lot."], c: 1, e: "«Tíguere» = astuto/vivo de la calle." },
    { d: "es", q: "«Le dieron una pela y lo dejaron tirado.»", o: ["They gave him a peel and left him thrown.", "They beat him up and left him lying there.", "They gave him a ball and left.", "They fought and he fell."], c: 1, e: "«Pela» = paliza; «dejar tirado» = dejar abandonado en el suelo." }
  ],
  terminologia_juridica: [
    { d: "en", q: "«The judge granted the motion to suppress.»", o: ["El juez acogió la solicitud de exclusión de prueba.", "El juez otorgó la moción de suprimir.", "El juez concedió el movimiento de supresión.", "El juez rechazó la solicitud."], c: 0, e: "Motion to suppress = solicitud de exclusión probatoria; grant = acoger/conceder." },
    { d: "en", q: "«The case was dismissed with prejudice.»", o: ["El caso fue despedido con prejuicio.", "Se archivó definitivamente el caso (no puede volver a presentarse).", "El caso fue desestimado provisionalmente.", "El caso fue suspendido por prejuicio del juez."], c: 1, e: "«With prejudice» = de forma definitiva. «Without prejudice» = sin perjuicio de volver a presentarlo." },
    { d: "en", q: "«He was released on his own recognizance.»", o: ["Fue liberado bajo su propio reconocimiento, sin garantía económica.", "Fue liberado porque lo reconocieron.", "Fue puesto en libertad con fianza.", "Fue liberado por falta de pruebas."], c: 0, e: "«Own recognizance» = libertad sin fianza, bajo promesa de comparecer." },
    { d: "es", q: "«Se declara la extinción de la acción penal por prescripción.»", o: ["The criminal action is extinguished because the statute of limitations has run.", "The penal action is extinct by prescription.", "The criminal case is closed by doctor's prescription.", "The accusation is dismissed for lack of evidence."], c: 0, e: "Prescripción = statute of limitations." },
    { d: "es", q: "«El tribunal acoge el recurso y ordena un nuevo juicio.»", o: ["The court welcomes the resource and orders a new trial.", "The court grants the appeal and orders a new trial.", "The court accepts the recourse and orders a new judgment.", "The court denies the appeal."], c: 1, e: "Acoger el recurso = grant the appeal." },
    { d: "es", q: "«El querellante se constituyó en actor civil.»", o: ["The complainant became a civil actor.", "The complainant joined the proceedings as a civil party.", "The plaintiff constituted himself in civil actor.", "The victim filed for divorce."], c: 1, e: "Actor civil = civil party (seeking damages within the criminal case)." },
    { d: "es", q: "«Se dicta auto de no ha lugar.»", o: ["An order of dismissal is issued (no grounds to proceed to trial).", "There is no place for the order.", "The order was not issued.", "The motion is sustained."], c: 0, e: "Auto de no ha lugar = resolución que pone fin al proceso por falta de fundamento para juicio." },
    { d: "es", q: "«El imputado fue condenado en contumacia.»", o: ["The defendant was convicted in absentia.", "The defendant was convicted for contumacy.", "The defendant was sentenced to community service.", "The defendant was acquitted."], c: 0, e: "En contumacia / en rebeldía = in absentia." }
  ]
};

const ORALES2 = {
  gramatica: [
    { lang: "en", t: "I wish I had listened to my mother when she told me not to go out with him." },
    { lang: "en", t: "The money that was found in the car belonged to my uncle, not to me." },
    { lang: "en", t: "If you hadn't asked me, I wouldn't have remembered that detail." },
    { lang: "en", t: "Nobody told me that I needed a permit to carry the gun." },
    { lang: "en", t: "Had I known he was armed, I would never have opened the door." },
    { lang: "es", t: "Ojalá que el tribunal tome en cuenta que mi representado colaboró desde el primer momento." },
    { lang: "es", t: "Aunque la víctima haya retirado la querella, el Ministerio Público continuará con la acción penal." },
    { lang: "es", t: "Cuando llegó la policía, los asaltantes ya se habían marchado con todo lo que encontraron." },
    { lang: "es", t: "No creo que el testigo haya visto el rostro del agresor desde esa distancia." }
  ],
  vocabulario_general: [
    { lang: "en", t: "He pulled into the driveway, popped the trunk, and took out a duffel bag." },
    { lang: "en", t: "My grandmother tripped on the stairs and broke her hip." },
    { lang: "en", t: "The kids were playing on the sidewalk when the van ran over the curb." },
    { lang: "en", t: "I noticed a scratch on the door handle and the lock had been pried open." },
    { lang: "es", t: "La señora tenía un moretón en el brazo y le faltaba un diente." },
    { lang: "es", t: "El ladrón usaba gorra, lentes oscuros y una camiseta de rayas." },
    { lang: "es", t: "Se le pinchó una goma en la autopista y se detuvo en el paseo." },
    { lang: "es", t: "Mi sobrina estaba tendiendo la ropa en el patio cuando escuchó los gritos." }
  ],
  fluidez: [
    { lang: "en", t: "When I got to the house, the front door was wide open and the lights were off. I called out my sister's name, but nobody answered. I went into the kitchen and that's when I saw her on the floor, next to the refrigerator, with blood on her face." },
    { lang: "en", t: "Your Honor, my client has been in pretrial detention for eleven months. He has a job waiting for him, his wife is pregnant with their second child, and he has never missed a single court date. We respectfully ask the court to consider alternative measures." },
    { lang: "es", t: "Honorable, el Ministerio Público ha presentado elementos de prueba suficientes que vinculan al imputado con el hecho. Contamos con el testimonio de dos agentes actuantes, el acta de registro de personas y el certificado del Instituto Nacional de Ciencias Forenses." },
    { lang: "es", t: "Yo venía bajando por la avenida Duarte en mi motor cuando un carro negro se me atravesó sin poner luces. Traté de frenar, pero el pavimento estaba mojado y terminé debajo del carro. Cuando desperté, estaba en el hospital." }
  ],
  pronunciacion: [
    { lang: "en", t: "The witness was thirty-three years old when the theft occurred." },
    { lang: "en", t: "He watched the vehicle as it turned right on Third Street." },
    { lang: "en", t: "The defendant pleaded not guilty to both charges." },
    { lang: "en", t: "I asked the officer whether I was under arrest." },
    { lang: "en", t: "The evidence was stored in a locked cabinet at the station." },
    { lang: "en", t: "She thanked the judge and left the courtroom with her lawyer." },
    { lang: "es", t: "El tribunal rechaza la solicitud y ordena la continuación del juicio." },
    { lang: "es", t: "Los agentes ocuparon dos celulares y un arma de reglamento." },
    { lang: "es", t: "Usted tiene derecho a guardar silencio y a ser asistido por un abogado." },
    { lang: "es", t: "Las partes disponen de diez días para recurrir la decisión." },
    { lang: "es", t: "El perito explicó detalladamente los resultados del análisis." },
    { lang: "es", t: "Señor imputado, ¿desea declarar algo antes de que el tribunal decida?" }
  ],
  terminologia_juridica: [
    { lang: "en", t: "The defense filed a motion to dismiss on the grounds that the search warrant was invalid." },
    { lang: "en", t: "The witness was impeached with a prior inconsistent statement." },
    { lang: "en", t: "He was sentenced to five years of probation and ordered to pay restitution." },
    { lang: "en", t: "The chain of custody was broken when the evidence bag was left unsealed overnight." },
    { lang: "en", t: "Your Honor, we'd like to enter this document into evidence as Exhibit B." },
    { lang: "es", t: "Se declara la nulidad del acta de allanamiento por no contar con la orden judicial correspondiente." },
    { lang: "es", t: "El juez de la instrucción dictó auto de apertura a juicio contra los tres coimputados." },
    { lang: "es", t: "La víctima se constituyó en querellante y actor civil, y reclama una indemnización de un millón de pesos." },
    { lang: "es", t: "El tribunal varía la medida de coerción por una garantía económica y presentación periódica." }
  ],
  interferencias: [
    { lang: "en", t: "I actually assisted him with the paperwork, but I didn't realize it was a fraud." },
    { lang: "en", t: "He was very embarrassed when they read the charges in front of his parents." },
    { lang: "en", t: "The injury was severe, so eventually he had to resign from his job." },
    { lang: "es", t: "Actualmente trabajo en una librería y asisto a clases los sábados." },
    { lang: "es", t: "Mis parientes me apoyaron, pero mi esposa estaba muy molesta conmigo." },
    { lang: "es", t: "El abogado realizó una discusión con el fiscal sobre las pruebas." }
  ],
  modismos_expresiones: [
    { lang: "en", t: "He tried to sweet-talk me, but I could tell he was up to no good." },
    { lang: "en", t: "I'm telling you, he was beating around the bush the whole time." },
    { lang: "en", t: "She spilled the beans the minute the detectives started asking questions." },
    { lang: "es", t: "Ese hombre es un chivo, siempre anda pendiente de lo que uno hace." },
    { lang: "es", t: "Me cogieron de pendejo, me vendieron un carro robado." },
    { lang: "es", t: "Ella se fue a la vela y no volvió hasta el otro día." }
  ],
  estilo_registro: [
    { lang: "en", t: "Ma'am, I'm sorry, I just get nervous in these places. I've never been in a courtroom before." },
    { lang: "en", t: "Objection, Your Honor. Asked and answered." },
    { lang: "en", t: "Dude, I swear, I don't even know the guy. I just met him that night." },
    { lang: "es", t: "Que conste en acta que el testigo ha reconocido al imputado sin ninguna duda." },
    { lang: "es", t: "Diga, señor, ¿y usted qué estaba haciendo a esa hora en la calle?" },
    { lang: "es", t: "Yo nunca le he faltado el respeto a nadie, Honorable, se lo juro por mi madre." }
  ]
};

const PASAJES2 = [
  {
    lang: "en", titulo: "Llamada al 911 (transcripción leída)",
    texto: "Nine-one-one, what's your emergency? Yes, hi, there's a man lying on the sidewalk outside the pharmacy on Fifth and Maple. He's not moving. I think he got hit by a car, a red pickup, it didn't stop. It was going toward the highway. No, I didn't get the plate, it happened too fast. He's breathing, but there's a lot of blood coming from his head. My name is Carla, Carla Benson. I'm calling from my cell.",
    preguntas: [
      { q: "¿Dónde está la persona herida?", o: ["Dentro de la farmacia", "En la acera frente a la farmacia, en la Quinta con Maple", "En la autopista", "En el estacionamiento de un hospital"], c: 1 },
      { q: "¿Qué vehículo la atropelló?", o: ["Un carro rojo que se detuvo", "Una camioneta roja que no se detuvo", "Una camioneta blanca", "Una motocicleta roja"], c: 1 },
      { q: "¿La persona que llama anotó la placa?", o: ["Sí, completa", "Solo una parte", "No", "No se menciona"], c: 2 },
      { q: "¿En qué estado está el herido?", o: ["Muerto", "Respira, pero sangra mucho de la cabeza", "Está consciente y habla", "Tiene una pierna rota"], c: 1 }
    ]
  },
  {
    lang: "es", titulo: "Declaración de una vecina",
    texto: "Yo vivo al lado, en la casa amarilla. Esa noche, como a las diez y cuarenta, oí una discusión fuerte. Era la voz de él, del imputado, que le gritaba que si no le daba el dinero se iba a arrepentir. Después escuché un golpe seco, como si algo se hubiera caído, y luego silencio. No llamé a la policía en ese momento porque ellos siempre peleaban. Fue a la mañana siguiente, cuando vi la puerta abierta y a la niña llorando en la galería, que llamé al 911.",
    preguntas: [
      { q: "At what time did she hear the argument?", o: ["Around 10:40 p.m.", "Around 11:40 p.m.", "Around 10:14 p.m.", "In the morning"], c: 0 },
      { q: "What did the defendant shout?", o: ["That he would leave", "That she would regret it if she didn't give him the money", "That he was calling the police", "That he loved her"], c: 1 },
      { q: "Why didn't she call the police that night?", o: ["She had no phone", "Because they always fought", "She was afraid of him", "She was asleep"], c: 1 },
      { q: "What made her call the next morning?", o: ["She heard gunshots", "She saw the door open and the girl crying on the porch", "The police knocked on her door", "The victim called her"], c: 1 }
    ]
  },
  {
    lang: "en", titulo: "Informe de un agente de inmigración",
    texto: "The subject was intercepted at Terminal B at approximately 2:40 p.m. He presented a Canadian passport in the name of Michael Grant. The photo was a reasonable match, but the passport number did not appear in the database, and the lamination on the data page showed signs of tampering. When questioned, the subject stated that he had purchased the passport for three thousand dollars from a man in Santo Domingo. He was cooperative throughout and did not resist.",
    preguntas: [
      { q: "¿A qué hora fue interceptado?", o: ["2:40 a.m.", "Aproximadamente a las 2:40 p.m.", "4:20 p.m.", "12:40 p.m."], c: 1 },
      { q: "¿Qué indicaba que el pasaporte era falso?", o: ["La foto no coincidía", "El número no aparecía en la base de datos y la laminación mostraba manipulación", "Estaba vencido", "No tenía sellos"], c: 1 },
      { q: "¿Cuánto dijo que pagó?", o: ["US$300", "US$3,000", "US$30,000", "US$13,000"], c: 1 },
      { q: "¿Cómo fue su actitud?", o: ["Se resistió", "Intentó huir", "Cooperó en todo momento", "Se negó a declarar"], c: 2 }
    ]
  },
  {
    lang: "es", titulo: "Lectura de derechos y advertencia",
    texto: "Señor, usted ha sido arrestado por la presunta comisión del delito de robo. Usted tiene derecho a conocer el motivo de su arresto, a guardar silencio y a que ese silencio no sea usado en su contra. Tiene derecho a ser asistido por un abogado de su elección y, si no puede pagarlo, se le asignará un defensor público. Debe ser presentado ante un juez dentro de las cuarenta y ocho horas siguientes a su arresto. También tiene derecho a comunicarse con un familiar y, por ser extranjero, con el consulado de su país.",
    preguntas: [
      { q: "What is he being arrested for?", o: ["Fraud", "Robbery", "Drug trafficking", "Assault"], c: 1 },
      { q: "What happens if he can't afford a lawyer?", o: ["He must defend himself", "A public defender will be assigned", "The trial is postponed", "His consulate pays"], c: 1 },
      { q: "Within how many hours must he be brought before a judge?", o: ["24", "48", "72", "12"], c: 1 },
      { q: "Whom can he contact because he is a foreigner?", o: ["His employer", "His country's consulate", "The press", "The prosecutor"], c: 1 }
    ]
  },
  {
    lang: "en", titulo: "Declaración de un turista sobre un fraude",
    texto: "We booked the villa through a website that looked completely legit. The guy, who said his name was Roberto, asked for a fifty percent deposit, which came to eighteen hundred dollars, by wire transfer. He said the rest could be paid at check-in. When we landed in La Romana and took a taxi to the address, there was no villa. It was a construction site. We called Roberto five or six times; the number had been disconnected. The website was taken down two days later.",
    preguntas: [
      { q: "¿Qué porcentaje pidió de depósito?", o: ["15%", "50%", "100%", "25%"], c: 1 },
      { q: "¿Cuánto pagaron?", o: ["US$1,800", "US$18,000", "US$800", "US$3,600"], c: 0 },
      { q: "¿Qué encontraron en la dirección?", o: ["Una villa ocupada", "Una construcción", "Un hotel", "Un solar vacío con cerca"], c: 1 },
      { q: "¿Qué pasó con la página web?", o: ["Sigue activa", "La eliminaron dos días después", "La bloqueó la policía ese día", "No se menciona"], c: 1 }
    ]
  },
  {
    lang: "es", titulo: "Testimonio de un agente de tránsito (DIGESETT)",
    texto: "Yo me encontraba de servicio en la intersección de la avenida Charles de Gaulle con la autopista de San Isidro, alrededor de las cinco y veinte de la tarde. Observé un vehículo tipo jeepeta, color gris, que se desplazaba a alta velocidad y que cruzó en luz roja. Impactó a una motocicleta en la que viajaban dos personas. El conductor de la jeepeta no se detuvo. Logré anotar los últimos cuatro dígitos de la placa: tres, nueve, cero, siete.",
    preguntas: [
      { q: "What time did the incident occur?", o: ["Around 5:20 p.m.", "Around 5:20 a.m.", "Around 2:50 p.m.", "Around 7:20 p.m."], c: 0 },
      { q: "What kind of vehicle caused the crash?", o: ["A gray SUV", "A gray motorcycle", "A white car", "A bus"], c: 0 },
      { q: "How many people were on the motorcycle?", o: ["One", "Two", "Three", "Not mentioned"], c: 1 },
      { q: "What did the officer write down?", o: ["The full plate", "The last four digits: 3907", "The last four digits: 3970", "The driver's name"], c: 1 }
    ]
  }
];

const DIALOGOS2 = [
  {
    id: "d7", titulo: "Lavado de activos – gerente de remesas", nivel: 3,
    contexto: "Tribunal Colegiado del Distrito Nacional. Testimonio de una ex gerente estadounidense de una agencia de remesas.",
    turnos: [
      { hablante: "Fiscal", idioma: "es", texto: "Señora Morrison, explíquele al tribunal cuál era su función en la agencia de remesas y desde cuándo trabajaba allí." },
      { hablante: "Testigo", idioma: "en", texto: "I was the branch manager at the Naco office from February 2021 until I resigned in October 2023. I supervised four cashiers and I was responsible for compliance reports." },
      { hablante: "Fiscal", idioma: "es", texto: "¿Notó usted algún patrón irregular en las operaciones del imputado?" },
      { hablante: "Testigo", idioma: "en", texto: "Yes. He'd come in two or three times a week with different people, and each of them would send just under ten thousand dollars to the same account in Miami. It was textbook structuring." },
      { hablante: "Fiscal", idioma: "es", texto: "¿Reportó usted esas operaciones a sus superiores o a la Unidad de Análisis Financiero?" },
      { hablante: "Testigo", idioma: "en", texto: "I flagged it to my regional manager in writing, at least three times. He told me to mind my own business, that the client brought in a lot of revenue. That's when I decided to quit." },
      { hablante: "Defensa", idioma: "es", texto: "Señora, usted renunció porque la iban a despedir por bajo rendimiento, ¿no es así?" },
      { hablante: "Testigo", idioma: "en", texto: "That's absolutely not true. I had the best performance reviews in the region. I have the emails to prove it." }
    ]
  },
  {
    id: "d8", titulo: "Audiencia preliminar – abuso de confianza en un hotel", nivel: 2,
    contexto: "Juzgado de la Instrucción de La Altagracia. El querellante es el gerente canadiense de un hotel en Bávaro.",
    turnos: [
      { hablante: "Juez", idioma: "es", texto: "Señor Leblanc, usted es el querellante en este proceso. Indique brevemente qué le reclama al imputado." },
      { hablante: "Querellante", idioma: "en", texto: "Mr. Peña was our night auditor for almost four years. Between January and June, he voided more than two hundred cash transactions and pocketed the money. We estimate the loss at around sixty-two thousand dollars." },
      { hablante: "Defensa", idioma: "es", texto: "¿Cómo puede usted afirmar que fue mi representado y no otro empleado con acceso al sistema?" },
      { hablante: "Querellante", idioma: "en", texto: "Every void requires a personal password, and all of them were made with his credentials, always between two and five in the morning, when he was the only auditor on duty." },
      { hablante: "Juez", idioma: "es", texto: "¿La empresa ha recuperado alguna parte del dinero?" },
      { hablante: "Querellante", idioma: "en", texto: "Not a single peso. He offered to pay back five thousand dollars in installments, but that's not even ten percent of what he took." },
      { hablante: "Juez", idioma: "es", texto: "El tribunal se retira a deliberar. Se reanuda la audiencia en treinta minutos." }
    ]
  },
  {
    id: "d9", titulo: "Interrogatorio a imputada – maleta con dinero", nivel: 2,
    contexto: "Oficina de Atención Permanente de Punta Cana. Imputada británica detenida con dinero no declarado.",
    turnos: [
      { hablante: "Fiscal", idioma: "es", texto: "Señora, usted fue detenida con ciento cuarenta mil dólares en efectivo que no declaró en Aduanas. ¿Puede explicar de dónde provenía ese dinero?" },
      { hablante: "Imputada", idioma: "en", texto: "It's from the sale of my flat in Manchester. I was going to buy a small property here. I didn't know I had to declare it. Nobody told me." },
      { hablante: "Fiscal", idioma: "es", texto: "¿Tiene algún documento que demuestre esa venta?" },
      { hablante: "Imputada", idioma: "en", texto: "Not with me, no. But my solicitor in England can send the contract and the bank statements by email today, if you let me make a call." },
      { hablante: "Defensa", idioma: "es", texto: "Magistrado, mi representada no tiene antecedentes, ha cooperado desde el primer momento y solicitamos que se le permita aportar la documentación." },
      { hablante: "Juez", idioma: "es", texto: "Se le concede un plazo de cinco días a la defensa para depositar la documentación, debidamente traducida y apostillada." },
      { hablante: "Imputada", idioma: "en", texto: "Thank you, Your Honor. Where exactly do I have to submit the papers, and do they have to be originals?" }
    ]
  },
  {
    id: "d10", titulo: "Guarda de menor – padre estadounidense", nivel: 2,
    contexto: "Tribunal de Niños, Niñas y Adolescentes de Santiago. Audiencia sobre la guarda de un menor.",
    turnos: [
      { hablante: "Jueza", idioma: "es", texto: "Señor Davis, usted solicita la guarda de su hijo. Explíquele al tribunal por qué considera que debe vivir con usted en los Estados Unidos." },
      { hablante: "Padre", idioma: "en", texto: "Your Honor, Ethan is eight. Since his mother moved in with her new partner, he's been missing school, and his teacher told me he shows up hungry. I can give him a stable home in Orlando and he'd be enrolled at a school two blocks from my house." },
      { hablante: "Jueza", idioma: "es", texto: "¿Usted ha cumplido con la pensión alimentaria fijada por este tribunal?" },
      { hablante: "Padre", idioma: "en", texto: "Every single month, three hundred and fifty dollars, by bank transfer. I have all the receipts right here." },
      { hablante: "Abogada de la madre", idioma: "es", texto: "Honorable, el niño ha vivido toda su vida en Santiago, aquí están sus abuelos y sus amigos. Sacarlo del país sería perjudicial para su desarrollo." },
      { hablante: "Padre", idioma: "en", texto: "I'm not trying to take him away from his family. He can spend every summer and Christmas here. I just want what's best for him." }
    ]
  }
];

const DISCURSOS2 = [
  {
    id: "s5", titulo: "Alegato de clausura de la defensa", idioma: "es",
    contexto: "Juicio por tráfico de drogas en el Tribunal Colegiado de La Romana.",
    texto: "Honorables jueces, durante este juicio el Ministerio Público no ha logrado destruir la presunción de inocencia de nuestro representado. Recordemos que el agente actuante admitió, bajo juramento, que no encontró la sustancia en poder del imputado, sino en un compartimiento de un vehículo que no le pertenece y que había sido utilizado por al menos cuatro personas durante esa semana. Recordemos también que la cadena de custodia presenta una laguna de casi treinta horas entre la ocupación y la llegada de la muestra al Instituto Nacional de Ciencias Forenses. Ninguno de los testigos a cargo vio a nuestro representado manipular los paquetes. Lo que existe en este expediente son sospechas, y las sospechas no bastan para condenar a un ser humano a diez años de prisión. Por todo lo anterior, la defensa solicita que se declare la absolución del imputado, que se ordene el cese de la medida de coerción que pesa en su contra y su inmediata puesta en libertad. Bajo reservas."
  },
  {
    id: "s6", titulo: "Testimonio de una víctima de trata", idioma: "en",
    contexto: "Declaración de una mujer venezolana-estadounidense, víctima de trata, en un juicio en Santo Domingo.",
    texto: "I met her online in 2022. She said she ran a modeling agency in Santo Domingo and that she could get me work in hotels and at events. She paid for my plane ticket, and when I arrived, she picked me up at the airport herself. That same night she took my passport, she said, for safekeeping. The next day she told me I owed her four thousand dollars for the ticket, the apartment and the clothes, and that I would have to pay it off by going out with clients. I said no, and she told me that if I didn't, she would send photos of me to my family. There were five other girls in the apartment. We weren't allowed to leave without one of her drivers. I finally escaped in March of last year, when one of the drivers left the door unlocked, and I ran to a police station two blocks away."
  },
  {
    id: "s7", titulo: "Instrucciones del juez a las partes", idioma: "es",
    contexto: "Apertura de un juicio de fondo con imputado extranjero.",
    texto: "Buenos días. Se declara abierta la audiencia del día de hoy, correspondiente al expediente número dos mil veinticinco, guion, cero cero cuatro ocho nueve. Antes de iniciar, el tribunal advierte al imputado que tiene derecho a contar con un intérprete durante todo el proceso, a comunicarse libremente con su defensor y a declarar en cualquier momento, sin que su silencio pueda ser valorado en su contra. Se advierte igualmente a las partes que el tribunal no permitirá interrupciones, que las objeciones deberán ser breves y fundamentadas, y que los teléfonos celulares deben permanecer apagados. Se recuerda a los testigos que deben permanecer fuera de la sala hasta que sean llamados a declarar y que no podrán comunicarse entre sí. Finalmente, se informa que la audiencia está siendo grabada. Ministerio Público, puede presentar su teoría del caso."
  },
  {
    id: "s8", titulo: "Perito médico – lesiones", idioma: "en",
    contexto: "Médico forense estadounidense declara sobre las lesiones de la víctima.",
    texto: "I examined the patient on the morning of August ninth, approximately ten hours after the reported assault. She presented with a two-centimeter laceration above the left eyebrow, which had already been sutured at the emergency room, extensive bruising on both forearms, and a fracture of the fifth metacarpal of the right hand. In my professional opinion, the bruising on the forearms is consistent with defensive injuries, meaning the patient raised her arms to protect her face. The fracture of the hand is what we commonly call a boxer's fracture, but in this case it is more likely the result of the hand being struck against a hard surface. The injuries required twenty-one days of medical leave, and I don't anticipate any permanent damage, with the possible exception of a small scar above the eyebrow."
  }
];

const VISTAS2 = [
  { id: "v5", titulo: "Citación a testigo", idioma: "es", texto: "Por medio del presente acto, el Tribunal Colegiado de la Cámara Penal del Juzgado de Primera Instancia del Distrito Judicial de Santiago cita y emplaza al señor Brian Keith Lawson, de nacionalidad estadounidense, portador del pasaporte núm. 671204338, para que comparezca el día jueves veintiséis de febrero de dos mil veintiséis, a las nueve horas de la mañana, en la sala número tres del Palacio de Justicia de Santiago, a fin de prestar declaración como testigo en el proceso seguido contra Ramón Antonio Almonte Cruz. Se le advierte que su incomparecencia injustificada podrá dar lugar a su conducencia por medio de la fuerza pública." },
  { id: "v6", titulo: "Certificado médico legal", idioma: "es", texto: "El suscrito, médico legista del Instituto Nacional de Ciencias Forenses, certifica haber examinado a la señora Kimberly Ann Foster, de treinta y ocho años de edad, quien presenta: herida contusa de tres centímetros en región frontal izquierda, suturada; equimosis violácea en ambos antebrazos; y escoriaciones en rodilla derecha. Lesiones curables en un período de diez a quince días, salvo complicaciones. Pronóstico: reservado. Dado en Santo Domingo, a los catorce días del mes de enero de dos mil veintiséis." },
  { id: "v7", titulo: "Lab report (excerpt)", idioma: "en", texto: "Laboratory Case No. 2026-DR-0112. Submitted by: Special Agent Laura Chen. Date received: February 2, 2026. Item 1: one heat-sealed plastic bag containing white powder, gross weight 1,046.2 grams. Item 2: one digital scale with white residue. Results: Item 1 was found to contain cocaine hydrochloride, a Schedule II controlled substance; net weight 998.7 grams; purity 81 percent, plus or minus 3 percent. Item 2: residue tested positive for cocaine. The remaining evidence has been resealed and returned to the submitting agency. Analyst: Dr. Samuel Ortiz, Forensic Chemist." },
  { id: "v8", titulo: "Letter from the U.S. Embassy (excerpt)", idioma: "en", texto: "The Embassy of the United States of America presents its compliments to the Ministry of Foreign Affairs of the Dominican Republic and has the honor to request information regarding the detention of U.S. citizen Jason Michael Reyes, date of birth June 2, 1991, who was reportedly arrested on or about March 10, 2026, in Sosúa, Puerto Plata Province. The Embassy respectfully requests consular access to Mr. Reyes at the earliest opportunity, pursuant to Article 36 of the Vienna Convention on Consular Relations, as well as information on the charges against him and the date of his next court appearance." }
];

const GLOSARIO2 = [
  ["motion to suppress", "solicitud de exclusión probatoria|exclusión de prueba", "Proceso"],
  ["motion to dismiss", "solicitud de desestimación|solicitud de archivo", "Proceso"],
  ["with prejudice", "de manera definitiva", "Proceso"],
  ["in absentia", "en contumacia|en rebeldía", "Proceso"],
  ["own recognizance", "libertad sin garantía económica|bajo palabra", "Proceso"],
  ["grand jury", "gran jurado", "Proceso"],
  ["arraignment", "lectura de cargos|conocimiento de la acusación", "Proceso"],
  ["deposition", "declaración anticipada|declaración jurada", "Prueba"],
  ["impeachment of a witness", "impugnación del testigo|desacreditar al testigo", "Prueba"],
  ["prior inconsistent statement", "declaración previa contradictoria", "Prueba"],
  ["let the record reflect", "que conste en acta", "Prueba"],
  ["asked and answered", "pregunta ya respondida|ya fue contestada", "Prueba"],
  ["speculation", "especulación|conjetura", "Prueba"],
  ["relevance", "pertinencia", "Prueba"],
  ["probable cause", "causa probable|indicios suficientes", "Conceptos"],
  ["reasonable suspicion", "sospecha razonable", "Conceptos"],
  ["mens rea", "intención delictiva|dolo", "Conceptos"],
  ["intent", "intención|dolo", "Conceptos"],
  ["negligence", "negligencia|imprudencia", "Conceptos"],
  ["statutory", "legal|establecido por la ley", "Conceptos"],
  ["structuring", "fraccionamiento de operaciones", "Infracciones"],
  ["suspicious activity report", "reporte de operación sospechosa", "Infracciones"],
  ["possession with intent to distribute", "posesión con fines de distribución|tráfico", "Infracciones"],
  ["drug courier|mule", "mula|correo de drogas", "Infracciones"],
  ["false imprisonment", "secuestro|privación ilegal de libertad", "Infracciones"],
  ["stalking", "acoso|hostigamiento", "Infracciones"],
  ["harassment", "acoso", "Infracciones"],
  ["trespassing", "violación de propiedad|violación de domicilio", "Infracciones"],
  ["vandalism", "daño a la propiedad", "Infracciones"],
  ["arson", "incendio intencional", "Infracciones"],
  ["concealed weapon", "arma oculta", "Infracciones"],
  ["deceased", "occiso|fallecido", "Prueba"],
  ["blunt force trauma", "traumatismo por objeto contundente", "Prueba"],
  ["defensive wounds", "lesiones de defensa", "Prueba"],
  ["gunshot residue", "residuos de pólvora|residuos de disparo", "Prueba"],
  ["sentencing hearing", "audiencia de imposición de pena", "Proceso"],
  ["time served", "tiempo cumplido|pena cumplida", "Ejecución"],
  ["parole officer", "oficial de libertad condicional", "Ejecución"],
  ["community service", "trabajo comunitario|servicio comunitario", "Ejecución"],
  ["consular access", "asistencia consular|acceso consular", "Migración"],
  ["apostille", "apostilla", "Documentos"],
  ["certified translation", "traducción certificada|traducción oficial", "Documentos"],
  ["visitation rights", "derecho de visita|régimen de visitas", "Familia"],
  ["alimony", "pensión compensatoria|pensión alimenticia al cónyuge", "Familia"]
];

const MODISMOS2 = [
  ["to beat around the bush", "andarse con rodeos|darle vueltas al asunto", "Inglés"],
  ["to throw someone under the bus", "echarle la culpa a alguien|sacrificar a alguien", "Inglés"],
  ["to spill the beans", "soltar la sopa|contarlo todo", "Inglés"],
  ["on the run", "prófugo|huyendo", "Inglés"],
  ["out like a light", "dormido profundamente|rendido", "Inglés"],
  ["to play dumb", "hacerse el tonto|hacerse el loco", "Inglés"],
  ["to sweet-talk someone", "endulzarle el oído a alguien|engatusar", "Inglés"],
  ["up to no good", "tramando algo malo|en malos pasos", "Inglés"],
  ["to lose it", "perder los estribos|perder el control", "Inglés"],
  ["to set someone up", "tenderle una trampa a alguien|incriminar", "Inglés"],
  ["a rap sheet", "un historial delictivo|antecedentes penales", "Inglés"],
  ["to do time", "cumplir condena|estar preso", "Inglés"],
  ["grand", "mil dólares", "Inglés"],
  ["a bum", "un vago|un vagabundo", "Inglés"],
  ["coger de pendejo", "to take someone for a fool|to play someone", "Dominicano"],
  ["irse a la vela", "to go to a wake", "Dominicano"],
  ["un pique", "an angry fit|a grudge", "Dominicano"],
  ["dar una trompada", "to punch someone", "Dominicano"],
  ["estar en bola", "to be naked|to have nothing", "Dominicano"],
  ["un bulto", "a backpack|a bag", "Dominicano"],
  ["janguear", "to hang out", "Dominicano"],
  ["un fiao", "a purchase on credit|an IOU", "Dominicano"],
  ["una yipeta", "an SUV", "Dominicano"],
  ["la ñapa", "a little extra|a freebie", "Dominicano"]
];

// ---------- Fusión ----------
for (const [k, arr] of Object.entries(QUIZ2)) (QUIZ[k] ||= []).push(...arr);
for (const [k, arr] of Object.entries(ORALES2)) (ORALES[k] ||= []).push(...arr);
PASAJES.push(...PASAJES2);
DIALOGOS.push(...DIALOGOS2);
DISCURSOS.push(...DISCURSOS2);
VISTAS.push(...VISTAS2);
const seenG = new Set(GLOSARIO.map((g) => g[0]));
for (const g of GLOSARIO2) if (!seenG.has(g[0])) GLOSARIO.push(g);
const seenM = new Set(MODISMOS.map((m) => m[0]));
for (const m of MODISMOS2) if (!seenM.has(m[0])) MODISMOS.push(m);

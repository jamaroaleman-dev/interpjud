// Banco 3 (parte A): glosario jurídico ampliado, falsos cognados y modismos. Sin API, todo offline.
// Formato de cada línea:  inglés|alternativas = español|alternativas @Categoría
const G = `
judge presiding|presiding judge = juez presidente|presidente del tribunal @Partes
panel of judges|three-judge panel = tribunal colegiado @Partes
trial court = tribunal de primera instancia|tribunal de juicio @Partes
pretrial judge|judge of the preliminary hearing = juez de la instrucción|juez de la audiencia preliminar @Partes
magistrate = magistrado|magistrada @Partes
justice of the peace = juez de paz @Partes
attorney general = procurador general de la República @Partes
assistant district attorney|assistant prosecutor = fiscal adjunto|fiscalizador @Partes
private prosecutor = querellante|acusador privado @Partes
counsel for the victim = abogado de la víctima|abogado del querellante @Partes
legal aid = asistencia legal gratuita|defensa pública @Partes
interpreter = intérprete @Partes
court interpreter = intérprete judicial @Partes
translator = traductor @Partes
police officer = agente policial|oficial de policía @Partes
arresting officer = agente actuante|agente que realizó el arresto @Partes
detective = detective|investigador @Partes
informant|confidential informant = informante|confidente @Partes
undercover agent = agente encubierto @Partes
juvenile offender = adolescente en conflicto con la ley penal @Partes
next of kin = familiar más cercano|pariente más cercano @Partes
guardian ad litem = tutor ad litem|curador especial @Partes
heir = heredero @Partes
creditor = acreedor @Partes
debtor = deudor @Partes
landlord = propietario|arrendador|casero @Partes
tenant = inquilino|arrendatario @Partes
employer = empleador|patrono @Partes
employee = empleado|trabajador @Partes
legal representative = representante legal @Partes
third party = tercero @Partes
bystander = transeúnte|testigo circunstancial @Partes
suspect = sospechoso @Partes
perpetrator = autor|perpetrador @Partes
accessory after the fact = encubridor @Partes
ringleader = cabecilla @Partes
gang = banda|pandilla @Partes
inmate = recluso|interno|privado de libertad @Partes
probation officer = oficial de libertad condicional|agente de supervisión @Partes
court reporter|stenographer = taquígrafo judicial|secretario de actas @Partes
jury = jurado @Partes
foreperson = presidente del jurado @Partes
arraignment hearing = audiencia de conocimiento de medida de coerción|primera comparecencia @Proceso
coercive measure hearing = audiencia de medida de coerción @Proceso
investigation stage = etapa preparatoria|fase de investigación @Proceso
intermediate stage = etapa intermedia @Proceso
trial stage = juicio de fondo|etapa de juicio @Proceso
formal charges|accusation = acusación @Proceso
charging document = escrito de acusación|acta de acusación @Proceso
to file charges|to press charges = presentar acusación|presentar cargos|interponer querella @Proceso
complaint = denuncia|querella @Proceso
criminal complaint = querella @Proceso
to report a crime = denunciar|presentar una denuncia @Proceso
to drop the charges = retirar la acusación|desistir de la querella @Proceso
withdrawal of complaint = desistimiento|retiro de la querella @Proceso
plea = declaración de culpabilidad o inocencia|alegación @Proceso
plea agreement hearing = audiencia de acuerdo pleno|juicio abreviado @Proceso
abbreviated trial = procedimiento abreviado|juicio abreviado @Proceso
conditional suspension of proceedings = suspensión condicional del procedimiento @Proceso
mediation = mediación @Proceso
conciliation = conciliación @Proceso
alternative dispute resolution = resolución alternativa de conflictos @Proceso
discovery|disclosure of evidence = descubrimiento de pruebas|intercambio de pruebas @Proceso
pretrial motion = incidente|moción previa @Proceso
motion = moción|solicitud|instancia @Proceso
to file a motion = presentar una moción|depositar una instancia @Proceso
brief = escrito|memorial @Proceso
closing argument = conclusiones|alegatos finales @Proceso
opening statement = alegatos iniciales|alegato de apertura @Proceso
rebuttal = réplica @Proceso
surrebuttal = contrarréplica|dúplica @Proceso
redirect examination = reinterrogatorio|interrogatorio redirecto @Proceso
recross-examination = recontrainterrogatorio @Proceso
sidebar = conferencia en estrado|consulta con el juez @Proceso
the court will now hear = el tribunal procede a escuchar @Proceso
please be seated = pueden sentarse|tomen asiento @Proceso
the hearing is postponed = se aplaza la audiencia|se pospone la audiencia @Proceso
the hearing is resumed = se reanuda la audiencia @Proceso
to postpone|to adjourn = aplazar|posponer @Proceso
deliberation = deliberación @Proceso
the court will deliberate = el tribunal se retira a deliberar @Proceso
judgment = sentencia|fallo @Proceso
final judgment = sentencia definitiva|sentencia firme @Proceso
res judicata = cosa juzgada @Proceso
default judgment = sentencia en defecto|sentencia en rebeldía @Proceso
bench warrant = orden de arresto por incomparecencia|declaración de rebeldía @Proceso
failure to appear = incomparecencia @Proceso
fugitive|absconder = prófugo|evadido @Proceso
writ of habeas corpus = acción de hábeas corpus|mandamiento de hábeas corpus @Proceso
amparo action|constitutional protection action = acción de amparo @Proceso
remand = devolución del caso|envío a nuevo juicio @Proceso
new trial = nuevo juicio @Proceso
mistrial = juicio nulo|nulidad del juicio @Proceso
nullity = nulidad @Proceso
jurisdiction = jurisdicción|competencia @Proceso
venue = competencia territorial|sede @Proceso
judicial district = distrito judicial|departamento judicial @Proceso
standing = calidad para actuar|legitimación @Proceso
time limit|deadline = plazo @Proceso
maximum duration of the proceedings = duración máxima del proceso @Proceso
expiration of the proceedings = extinción de la acción penal @Proceso
pretrial detention review = revisión de la medida de coerción @Proceso
to revoke = revocar @Proceso
to grant = acoger|conceder|otorgar @Proceso
to deny|to reject = rechazar|denegar @Proceso
to uphold = confirmar|ratificar @Proceso
to overturn|to reverse = revocar|anular @Proceso
to rule = fallar|decidir|dictaminar @Proceso
the court finds = el tribunal declara|el tribunal estima @Proceso
granted in part = acogido parcialmente @Proceso
to stay|stay of execution = suspender|suspensión de la ejecución @Proceso
injunction = medida cautelar|orden de no hacer @Proceso
precautionary measure = medida cautelar @Proceso
economic guarantee = garantía económica @Proceso
bail bond = contrato de fianza|fianza @Proceso
bondsman|bail bond company = compañía de fianzas|afianzadora @Proceso
to post bail = prestar fianza|depositar la garantía económica @Proceso
to be released on bail = quedar en libertad bajo fianza @Proceso
to be remanded in custody = quedar en prisión preventiva @Proceso
three months of pretrial detention = tres meses de prisión preventiva @Proceso
to report periodically = presentarse periódicamente|presentación periódica @Proceso
to be held without bail = quedar detenido sin fianza @Proceso
to appear in court = comparecer @Proceso
appearance = comparecencia @Proceso
summons to appear = citación @Proceso
to serve (a document) = notificar|emplazar @Proceso
service of process = notificación|emplazamiento @Proceso
bailiff's notice|process server = alguacil|acto de alguacil @Proceso
hearing record|minutes = acta de audiencia @Proceso
transcript = transcripción|acta taquigráfica @Proceso
docket = rol|agenda de audiencias @Proceso
pro se|self-represented = sin abogado|en representación propia @Proceso
on the record = para que conste en acta @Proceso
off the record = extraoficialmente|fuera de acta @Proceso
strike from the record = que se elimine del acta|eliminar del registro @Proceso
the witness is excused = el testigo puede retirarse @Proceso
no further questions = no más preguntas @Proceso
the defense rests = la defensa concluye|la defensa no tiene más pruebas @Proceso
the prosecution rests = el Ministerio Público concluye su presentación de pruebas @Proceso
I object = objeción|me opongo @Proceso
argumentative = capcioso|argumentativo @Proceso
badgering the witness = acosar al testigo @Proceso
calls for a conclusion = pide una conclusión @Proceso
compound question = pregunta compuesta @Proceso
lack of foundation = falta de fundamento|falta de base @Proceso
beyond the scope = fuera del alcance del interrogatorio directo @Proceso
non-responsive|nonresponsive|unresponsive|not responsive|the answer is non-responsive|the answer is not responsive = la respuesta no corresponde a la pregunta|la respuesta no responde a la pregunta|respuesta no pertinente @Proceso
withdrawn = retiro la pregunta @Proceso
counsel, approach the bench = abogados, acérquense al estrado @Proceso
may I approach the witness? = ¿puedo acercarme al testigo? @Proceso
take the stand = suba al estrado|tome asiento en el estrado @Proceso
witness stand = estrado de los testigos @Proceso
do you swear to tell the truth = ¿jura decir la verdad? @Proceso
I swear = lo juro @Proceso
oath = juramento @Proceso
affirmation = promesa|afirmación solemne @Proceso
state your name for the record = diga su nombre para que conste en acta @Proceso
spell your last name = deletree su apellido @Proceso
please answer yes or no = responda sí o no, por favor @Proceso
please speak up = hable más alto, por favor @Proceso
interrogation = interrogatorio @Prueba
questioning = interrogatorio|preguntas @Prueba
confession = confesión @Prueba
statement = declaración @Prueba
written statement = declaración escrita @Prueba
documentary evidence = prueba documental @Prueba
physical evidence|material evidence = prueba material|evidencia física @Prueba
testimonial evidence = prueba testimonial @Prueba
expert evidence = prueba pericial @Prueba
expert report = informe pericial|peritaje @Prueba
expert = perito @Prueba
ballistics report = informe balístico|experticia balística @Prueba
toxicology report = informe toxicológico @Prueba
DNA test = prueba de ADN @Prueba
paternity test = prueba de paternidad @Prueba
blood alcohol content = nivel de alcohol en la sangre|alcoholemia @Prueba
breathalyzer = alcoholímetro|prueba de aliento @Prueba
crime scene = escena del crimen|lugar de los hechos @Prueba
crime scene report = acta de inspección del lugar @Prueba
search and seizure record = acta de registro y secuestro|acta de allanamiento @Prueba
body search|pat-down = registro de persona|cacheo @Prueba
vehicle search = registro de vehículo @Prueba
raid = allanamiento|operativo @Prueba
seized items = objetos ocupados|objetos incautados @Prueba
to seize = ocupar|incautar|decomisar @Prueba
arrest record = acta de arresto @Prueba
flagrante delicto|caught in the act = flagrante delito|in fraganti @Prueba
wiretap = intervención telefónica|escucha telefónica @Prueba
phone records = registros telefónicos|historial de llamadas @Prueba
text messages = mensajes de texto @Prueba
screenshot = captura de pantalla @Prueba
bank statements = estados de cuenta bancarios @Prueba
photo lineup = rueda de fotografías @Prueba
identification = reconocimiento|identificación @Prueba
composite sketch = retrato hablado @Prueba
medical certificate = certificado médico legal @Prueba
forensic doctor = médico legista @Prueba
National Institute of Forensic Sciences = Instituto Nacional de Ciencias Forenses (INACIF) @Prueba
psychological evaluation = evaluación psicológica @Prueba
admissible = admisible @Prueba
inadmissible = inadmisible @Prueba
illegally obtained evidence = prueba obtenida ilegalmente @Prueba
fruit of the poisonous tree = fruto del árbol envenenado @Prueba
corroborating evidence = prueba corroborante @Prueba
circumstantial evidence = prueba circunstancial|prueba indiciaria @Prueba
direct evidence = prueba directa @Prueba
exculpatory evidence = prueba exculpatoria|prueba de descargo @Prueba
incriminating evidence = prueba de cargo|prueba incriminatoria @Prueba
witness for the prosecution = testigo a cargo @Prueba
witness for the defense = testigo a descargo @Prueba
credibility = credibilidad @Prueba
to impeach = impugnar|desacreditar @Prueba
to refresh recollection = refrescar la memoria @Prueba
exhibit A = prueba A|elemento de prueba A @Prueba
marked for identification = marcado para identificación @Prueba
stipulation = estipulación|acuerdo probatorio @Prueba
evidence log = registro de evidencias @Prueba
evidence bag = funda de evidencia|bolsa de evidencia @Prueba
sealed = sellado|precintado @Prueba
tampering with evidence = alteración de pruebas|manipulación de evidencias @Prueba
obstruction of justice = obstrucción de la justicia @Infracciones
crime|criminal offense = crimen|infracción penal @Infracciones
petty offense|minor offense = contravención|infracción menor @Infracciones
attempt = tentativa @Infracciones
conspiracy = asociación de malhechores|conspiración @Infracciones
criminal association = asociación de malhechores @Infracciones
aggravated robbery = robo agravado|robo con violencia @Infracciones
armed robbery = robo a mano armada @Infracciones
burglary = robo con fractura|robo en vivienda @Infracciones
breaking and entering = allanamiento de morada con fractura|violación de domicilio @Infracciones
shoplifting = robo en tienda|hurto en comercio @Infracciones
pickpocketing = carterismo|robo de cartera @Infracciones
carjacking = robo de vehículo con violencia @Infracciones
motorcycle theft = robo de motocicleta @Infracciones
receiving stolen property = receptación|ocultación de objetos robados @Infracciones
scam|swindle = estafa @Infracciones
pyramid scheme = esquema piramidal|estafa piramidal @Infracciones
counterfeiting = falsificación|falsificación de moneda @Infracciones
counterfeit bills = billetes falsos @Infracciones
use of forged documents = uso de documentos falsos @Infracciones
tax evasion = evasión fiscal|evasión tributaria @Infracciones
smuggling = contrabando @Infracciones
illegal gambling = juego ilegal|bancas ilegales @Infracciones
corruption = corrupción @Infracciones
abuse of power = abuso de poder|abuso de autoridad @Infracciones
illicit enrichment = enriquecimiento ilícito @Infracciones
influence peddling = tráfico de influencias @Infracciones
misappropriation of public funds = malversación de fondos públicos|desfalco @Infracciones
threats = amenazas @Infracciones
death threats = amenazas de muerte @Infracciones
defamation = difamación @Infracciones
libel = difamación escrita|libelo @Infracciones
slander = difamación oral|injuria @Infracciones
insult = injuria @Infracciones
battery = golpes y heridas @Infracciones
assault with a deadly weapon = agresión con arma mortal|golpes y heridas con arma @Infracciones
intentional injuries = golpes y heridas voluntarios @Infracciones
involuntary manslaughter = homicidio involuntario @Infracciones
vehicular manslaughter = homicidio involuntario con vehículo de motor @Infracciones
femicide = feminicidio @Infracciones
infanticide = infanticidio @Infracciones
parricide = parricidio @Infracciones
hired killer|hitman = sicario @Infracciones
contract killing = sicariato @Infracciones
child abuse = abuso infantil|maltrato infantil @Infracciones
child sexual abuse = abuso sexual infantil @Infracciones
statutory rape = violación de menor|seducción de menor @Infracciones
incest = incesto @Infracciones
sexual harassment = acoso sexual @Infracciones
indecent exposure = exhibicionismo|exhibición obscena @Infracciones
child pornography = pornografía infantil @Infracciones
prostitution = prostitución @Infracciones
pimping|procuring = proxenetismo @Infracciones
abandonment of a minor = abandono de menor @Infracciones
failure to pay child support = incumplimiento de manutención|violación a la ley de manutención @Infracciones
psychological abuse = violencia psicológica @Infracciones
intimate partner violence = violencia de pareja|violencia intrafamiliar @Infracciones
cyberbullying = ciberacoso @Infracciones
hacking = acceso ilícito a sistemas informáticos @Infracciones
phishing = suplantación|phishing @Infracciones
illegal possession of drugs = posesión ilícita de drogas @Infracciones
simple possession = simple posesión @Infracciones
drug distribution = distribución de drogas @Infracciones
drug dealer = traficante|distribuidor de drogas|vendedor de drogas @Infracciones
cocaine = cocaína @Infracciones
crack cocaine = crack @Infracciones
marijuana = marihuana @Infracciones
heroin = heroína @Infracciones
packages|bricks = paquetes|pacas @Infracciones
grams = gramos @Infracciones
kilograms = kilogramos @Infracciones
illegal carrying of weapons = porte ilegal de armas @Infracciones
unlicensed firearm = arma de fuego sin licencia @Infracciones
firearm license = licencia de porte de armas @Infracciones
ammunition = municiones @Infracciones
illegal entry = entrada ilegal @Infracciones
document fraud = falsificación de documentos @Infracciones
resisting arrest = resistencia al arresto|rebelión @Infracciones
disorderly conduct = alteración del orden público @Infracciones
public intoxication = embriaguez en la vía pública @Infracciones
driving without a license = conducir sin licencia @Infracciones
speeding = exceso de velocidad @Infracciones
running a red light = cruzar en rojo|violar la luz roja @Infracciones
traffic accident = accidente de tránsito @Infracciones
leaving the scene of an accident = abandonar el lugar del accidente @Infracciones
animal cruelty = maltrato animal @Infracciones
environmental crime = delito ambiental @Infracciones
guilty = culpable @Conceptos
innocent = inocente @Conceptos
liable = responsable @Conceptos
criminal liability = responsabilidad penal @Conceptos
civil liability = responsabilidad civil @Conceptos
accomplice liability = complicidad @Conceptos
principal = autor @Conceptos
complicity = complicidad @Conceptos
aiding and abetting = complicidad|ayuda e instigación @Conceptos
legitimate defense = legítima defensa @Conceptos
state of necessity = estado de necesidad @Conceptos
insanity defense = inimputabilidad por enfermedad mental @Conceptos
diminished capacity = imputabilidad disminuida @Conceptos
duress = coacción @Conceptos
entrapment = incitación policial|provocación @Conceptos
recidivism|repeat offender = reincidencia|reincidente @Conceptos
first-time offender = infractor primario|delincuente primario @Conceptos
legal age = mayoría de edad @Conceptos
underage = menor de edad @Conceptos
legal capacity = capacidad jurídica @Conceptos
good faith = buena fe @Conceptos
bad faith = mala fe @Conceptos
legal fees = honorarios @Conceptos
retainer = anticipo de honorarios @Conceptos
attorney-client privilege = secreto profesional abogado-cliente @Conceptos
conflict of interest = conflicto de intereses @Conceptos
equality of arms = igualdad de armas|igualdad entre las partes @Conceptos
right to an interpreter = derecho a un intérprete @Derechos
right to a fair trial = derecho a un juicio justo @Derechos
right to appeal = derecho a recurrir @Derechos
right against self-incrimination = derecho a no autoincriminarse|derecho a no declarar contra sí mismo @Derechos
right to be informed of the charges = derecho a ser informado de la acusación @Derechos
right to a phone call = derecho a una llamada @Derechos
Miranda rights|reading of rights = lectura de derechos @Derechos
waiver = renuncia @Derechos
to waive a right = renunciar a un derecho @Derechos
privacy = intimidad|privacidad @Derechos
human rights = derechos humanos @Derechos
dignity = dignidad @Derechos
search warrant issued by a judge = orden de allanamiento|orden de registro @Documentos
arrest warrant issued by a judge = orden de arresto|orden de conducencia @Documentos
court summons = citación|emplazamiento @Documentos
affidavit = declaración jurada|acto de notoriedad @Documentos
deed = escritura|acto de venta @Documentos
contract of sale = contrato de compraventa @Documentos
promissory note = pagaré @Documentos
receipt = recibo @Documentos
invoice = factura @Documentos
certificate of title = certificado de título @Documentos
vehicle registration = matrícula del vehículo @Documentos
license plate = placa @Documentos
passport = pasaporte @Documentos
visa = visado|visa @Documentos
residence permit = permiso de residencia @Documentos
work permit = permiso de trabajo @Documentos
marriage certificate = acta de matrimonio @Documentos
death certificate = acta de defunción @Documentos
criminal background check = certificado de no antecedentes penales|certificado de buena conducta @Documentos
medical records = expediente médico|historial clínico @Documentos
will|last will and testament = testamento @Civil
estate = sucesión|patrimonio @Civil
inheritance = herencia @Civil
property = propiedad|inmueble @Civil
real estate = bienes raíces|bienes inmuebles @Civil
personal property = bienes muebles @Civil
mortgage = hipoteca @Civil
foreclosure = embargo inmobiliario|ejecución hipotecaria @Civil
garnishment|attachment = embargo @Civil
debt collection = cobro de deudas|cobro de pesos @Civil
damages claim = demanda en daños y perjuicios @Civil
moral damages = daños morales @Civil
material damages = daños materiales @Civil
indemnity = indemnización @Civil
liability insurance = seguro de responsabilidad civil @Civil
insurance policy = póliza de seguro @Civil
small claims = demandas de menor cuantía @Civil
plaintiff's claim = demanda @Civil
defendant (civil) = demandado @Civil
countersuit|counterclaim = demanda reconvencional @Civil
labor lawsuit = demanda laboral @Civil
wrongful termination = despido injustificado @Civil
severance pay = prestaciones laborales|cesantía @Civil
domestic partnership|common-law marriage = unión libre|unión consensual @Familia
spouse = cónyuge|esposo|esposa @Familia
ex-wife = ex esposa @Familia
stepdaughter = hijastra @Familia
half brother = medio hermano|hermano de padre|hermano de madre @Familia
foster care = hogar de acogida|hogar sustituto @Familia
adoption = adopción @Familia
legal guardianship = tutela|guarda @Familia
joint custody = custodia compartida|guarda compartida @Familia
child support payment = pensión alimentaria|manutención @Familia
protection order = orden de protección|orden de alejamiento @Familia
National Council for Children = Consejo Nacional para la Niñez y la Adolescencia (CONANI) @Familia
juvenile court = tribunal de niños, niñas y adolescentes @Familia
asylum = asilo @Migración
refugee = refugiado @Migración
undocumented = indocumentado @Migración
overstay = permanencia ilegal|exceder el tiempo autorizado @Migración
removal proceedings = proceso de deportación @Migración
repatriation = repatriación @Migración
consulate = consulado @Migración
dual citizenship = doble nacionalidad @Migración
prison = cárcel|centro penitenciario @Ejecución
correctional and rehabilitation center = centro de corrección y rehabilitación (CCR) @Ejecución
solitary confinement = aislamiento|confinamiento solitario @Ejecución
early release = libertad anticipada @Ejecución
conditional release = libertad condicional @Ejecución
sentence reduction = reducción de pena @Ejecución
prison term = pena de prisión|condena @Ejecución
twenty years of imprisonment = veinte años de reclusión mayor|veinte años de prisión @Ejecución
life sentence = cadena perpetua @Ejecución
concurrent sentences = penas concurrentes @Ejecución
consecutive sentences = penas consecutivas|penas acumuladas @Ejecución
to serve a sentence = cumplir una condena @Ejecución
probation = libertad a prueba|suspensión condicional de la pena @Ejecución
rehabilitation = rehabilitación|reinserción @Ejecución
victim impact statement = declaración de impacto de la víctima @Prueba
eyewitness account = relato del testigo presencial @Prueba
stab wound = herida de arma blanca|herida punzante @Prueba
gunshot wound = herida de bala|herida de arma de fuego @Prueba
bruises = hematomas|moretones @Prueba
laceration = laceración|herida cortante @Prueba
fracture = fractura @Prueba
cause of death = causa de la muerte @Prueba
time of death = hora de la muerte @Prueba
crime lab = laboratorio forense @Prueba
bullet casing|shell casing = casquillo @Prueba
caliber = calibre @Prueba
nine-millimeter pistol = pistola nueve milímetros|pistola calibre 9 mm @Prueba
revolver = revólver @Prueba
shotgun = escopeta @Prueba
knife = cuchillo @Prueba
machete = machete @Prueba
handcuffs = esposas @Prueba
patrol car = patrulla|carro patrulla @Prueba
police station = destacamento|cuartel policial @Prueba
holding cell = celda preventiva|celda del destacamento @Prueba
`;

// Falsos cognados y trampas: [inglés, traducción correcta, trampa frecuente]
const FA = `
actual | real, verdadero | actual (= current)
to pretend | fingir | pretender (= to aim, to court)
to intend | tener la intención de | intentar (= to try)
to molest | abusar sexualmente de | molestar (= to bother)
to bother | molestar | —
disgrace | vergüenza, deshonra | desgracia (= misfortune)
misfortune | desgracia | —
compromise | acuerdo, término medio | compromiso (= commitment)
commitment | compromiso | —
to demand | exigir | demandar (= to sue)
to sue | demandar | —
lecture | conferencia, charla | lectura (= reading)
reading | lectura | —
large | grande | largo (= long)
long | largo | —
casualty | víctima, baja, herido | casualidad (= chance)
by chance | por casualidad | —
to attempt | intentar | atentar (= to make an attempt on)
outrage | indignación, escándalo | ultraje (en general no)
to sign | firmar | signar (arcaico)
signature | firma | signatura
sympathetic | comprensivo, compasivo | simpático (= nice)
nice | simpático, amable | —
terrific | estupendo | terrorífico (= terrifying)
to recollect | recordar | recolectar (= to collect)
to collect | recoger, cobrar, recolectar | —
deception | engaño | decepción (= disappointment)
disappointment | decepción | —
to excite | entusiasmar, provocar | excitar (connotación sexual)
exciting | emocionante | excitante
apology | disculpa | apología (= defense of an idea)
to contest | impugnar, disputar | contestar (= to answer)
to answer | contestar, responder | —
argument | discusión, pelea (o argumento) | argumento siempre
discussion | conversación, debate | discusión (= argument)
to discuss | hablar de, conversar | discutir (= to argue)
to argue | discutir, alegar | argüir
assault | agresión | asalto (= robbery en RD)
mugging | asalto, atraco | —
crime | delito, crimen | crimen siempre (= solo homicidio grave)
offender | infractor, delincuente | ofensor
criminal | delincuente | criminal siempre
to prosecute | procesar, ejercer la acción penal | perseguir (= to chase)
prosecution | Ministerio Público, acusación | prosecución
to process | tramitar | procesar (penalmente)
to charge | imputar, acusar | cargar, cobrar
to accuse | acusar | —
to incriminate | incriminar | —
indictment | acusación formal | inculpamiento
judgment | sentencia, fallo | juicio (= trial)
trial | juicio | trial
to try (a case) | juzgar | tratar
to condemn | condenar (moralmente) | condenar penalmente (= to convict)
to convict | condenar, declarar culpable | convictar
convict | condenado, recluso | convicto (correcto solo en registro culto)
sentence (grammar) | oración | sentencia
probation | libertad a prueba | probación
parole | libertad condicional | palabra
bail | fianza | baile
bond | fianza, bono | bond
warrant | orden judicial | garantía
guarantee | garantía | —
lawyer | abogado | legista
solicitor | abogado (asesor) | solicitante
applicant | solicitante | aplicante
to apply | solicitar, aplicar (una norma) | aplicar (una solicitud)
application | solicitud | aplicación (en solicitudes)
to qualify | reunir los requisitos | calificar
to fail | reprobar, no cumplir | fallar (en juicio = to rule)
to rule | fallar, decidir | regir
to dismiss | desestimar, despedir | dismisionar
dismissal | desestimación, despido | dimisión (= resignation)
resignation | renuncia, dimisión | resignación
to resign | renunciar | resignar
to retire | jubilarse | retirarse (= to withdraw)
to withdraw | retirar, retirarse | —
to remove | quitar, sacar, destituir | remover (= to stir)
to stir | remover, revolver | —
facilities | instalaciones | facilidades
facility (prison) | centro, recinto | facilidad
to facilitate | facilitar | —
agenda | orden del día | agenda (= planner)
planner | agenda | —
compliment | cumplido, halago | complemento
to comply | cumplir, acatar | complacer
compliance | cumplimiento | complacencia
fatality | víctima mortal | fatalidad (= bad luck)
injury | lesión, herida | injuria (= insult)
insult | insulto, injuria | —
to injure | herir, lesionar | injuriar
wound | herida | —
to wound | herir | —
to sustain | sufrir (una lesión), sostener | sustentar
evidence | prueba(s) | evidencia (aceptable, pero «prueba» es el término procesal)
evident | evidente | —
proof | prueba (concluyente) | —
to prove | probar, demostrar | —
to test | probar, examinar | testar (= to make a will)
to testify | declarar, atestiguar | testificar (válido)
testimony | testimonio, declaración | —
to declare | declarar (oficialmente) | —
statement | declaración | estamento
to state | declarar, indicar | estatuir
state | estado | —
record | antecedentes, registro, acta | récord
records | expedientes, registros | récords
to record | grabar, registrar | recordar
to remember | recordar | —
file | expediente, archivo | fila (= line)
line | fila | —
case | caso, causa, expediente | caso siempre
cause | causa, motivo | —
to sign up | inscribirse | firmar arriba
to register | inscribir, registrar | —
officer | agente, oficial | oficinista
office | oficina, despacho, cargo | —
officer of the court | auxiliar de la justicia | oficial de la corte
court | tribunal, corte | cancha (court de tenis) / corte
courthouse | Palacio de Justicia | casa corte
chamber | despacho del juez, sala | cámara
judge's chambers | despacho del juez | cámaras
bench | estrado, magistratura | banco
bar (legal) | colegio de abogados, barra | bar
Bar exam | examen de habilitación de abogados | examen de bar
counsel | abogado, asesor letrado | consejo (= advice)
advice | consejo, asesoría | aviso
notice | aviso, notificación | noticia (= news)
news | noticia(s) | —
to notice | notar, darse cuenta | noticiar
to notify | notificar | —
to realize | darse cuenta | realizar
to carry out | realizar, llevar a cabo | —
to support | apoyar, mantener (económicamente) | soportar (= to put up with)
to put up with | soportar, aguantar | —
to stand trial | ser juzgado | estar parado en juicio
to stand | estar de pie, soportar | —
to sustain an objection | ha lugar a la objeción | sostener la objeción (calco)
overruled | no ha lugar | sobreruleado
hearing | audiencia, vista | oído (= sense of hearing)
audience | público | audiencia (judicial)
to hear a case | conocer de un caso | oír un caso
to know | saber, conocer | —
to adjourn | levantar la sesión, aplazar | ajornar
session | sesión, audiencia | —
to postpone | aplazar | posponer (válido)
term | período, plazo, término | —
deadline | plazo, fecha límite | línea muerta
to expire | vencer, caducar | expirar (morir)
to die | morir, fallecer | —
deceased | fallecido, occiso | deceso (= death)
decease | fallecimiento | —
corpse | cadáver | cuerpo
body | cuerpo, cadáver | —
casket | ataúd | casco
coroner | médico forense | coronel
cartoon | caricatura, dibujo animado | cartón
cardboard | cartón | —
carpet | alfombra | carpeta (= folder)
folder | carpeta | —
library | biblioteca | librería (= bookstore)
bookstore | librería | —
fabric | tela | fábrica (= factory)
factory | fábrica | —
embarrassed | avergonzado | embarazada (= pregnant)
pregnant | embarazada | —
constipated | estreñido | constipado (= cold, en España)
to have a cold | estar resfriado | —
exit | salida | éxito (= success)
success | éxito | —
sensible | sensato | sensible (= sensitive)
sensitive | sensible, delicado | —
parents | padres | parientes (= relatives)
relatives | parientes, familiares | relativos
college | universidad | colegio (= school)
school | escuela, colegio | —
grocery | colmado, supermercado | grosería (= rudeness)
rude | grosero, maleducado | rudo (= rough)
rough | brusco, áspero | —
eventually | finalmente, con el tiempo | eventualmente (= possibly)
possibly | posiblemente, eventualmente | —
actually | en realidad | actualmente
currently | actualmente | corrientemente
ultimately | en última instancia, al final | últimamente (= lately)
lately | últimamente | —
to assume | suponer | asumir (= to take on)
to take on | asumir | —
consistent | coherente, constante | consistente (= firm, thick)
inconsistent | contradictorio | inconsistente
contradictory | contradictorio | —
to confront | carear, enfrentar | confrontar (aceptable)
confrontation (witnesses) | careo | confrontación
to arrest | arrestar, detener | arrestar (correcto)
to detain | retener, detener | detener (válido)
detention | detención, prisión | —
custody | custodia, guarda | —
in custody | bajo arresto, detenido | en custodia (válido)
jail | cárcel | jaula (= cage)
cage | jaula | —
cell | celda | célula (= cell biology)
battery | golpes (agresión) o batería | batería
assault and battery | golpes y heridas | asalto y batería
homicide | homicidio | —
murder | asesinato, homicidio voluntario | murder
manslaughter | homicidio involuntario o preterintencional | matanza
massacre | masacre | —
to kill | matar | —
to shoot | disparar, dispararle a | chutar
to fire (a gun) | disparar | despedir
to fire (an employee) | despedir | fuego
to discharge | disparar (un arma), dar de alta, despedir | descargar
weapon | arma | —
arm | brazo | arma
to rob | robar (a alguien), asaltar | —
to steal | robar, hurtar (algo) | —
burglar | ladrón (de casas) | burgués
thief | ladrón | —
medicine | medicamento, medicina | —
pharmacy | farmacia | —
dope | droga (coloquial) | dopado
to be high | estar drogado, estar endrogado | estar alto
`;

// Modismos: [expresión, equivalente, categoría] — «Inglés» = de inglés a español; «Dominicano» = de español a inglés.
const MOD = `
to have a beef with someone = tener un problema con alguien|tener un lío con alguien @Inglés
to be on the take = aceptar sobornos|estar cogiendo dinero por debajo @Inglés
to cut a deal = hacer un trato|llegar a un acuerdo @Inglés
to get off scot-free = salir impune|irse limpio @Inglés
to get away with it = salirse con la suya @Inglés
to be caught red-handed = ser atrapado con las manos en la masa|en flagrante @Inglés
to blow the whistle = denunciar|destapar el asunto @Inglés
to cover one's tracks = borrar las huellas|no dejar rastro @Inglés
to take the fall = cargar con la culpa|pagar los platos rotos @Inglés
to sell someone out = traicionar a alguien|vender a alguien @Inglés
to snitch = chivatear|delatar|ser chota @Inglés
to lay low = esconderse|mantener un perfil bajo @Inglés
to skip town = irse del pueblo|desaparecer @Inglés
to hit the road = irse|largarse @Inglés
to blow up at someone = estallar con alguien|explotar con alguien @Inglés
to have it out with someone = enfrentarse con alguien|aclarar las cosas a gritos @Inglés
to lose one's temper = perder los estribos @Inglés
to see red = enfurecerse|ponerse rojo de rabia @Inglés
to be at each other's throats = estar como perros y gatos|pelear constantemente @Inglés
to be beside oneself = estar fuera de sí @Inglés
to be shaken up = estar conmocionado|estar asustado @Inglés
to be in shock = estar en estado de shock|estar conmocionado @Inglés
to pass out = desmayarse @Inglés
to come to = volver en sí @Inglés
to black out = perder el conocimiento|no recordar nada @Inglés
to be loaded = estar borracho|tener mucho dinero (según contexto) @Inglés
to be buzzed = estar entonado|estar medio prendido @Inglés
under the influence = bajo los efectos del alcohol o drogas @Inglés
to be broke = estar sin dinero|estar pelado @Inglés
to make ends meet = llegar a fin de mes|pasar la quincena @Inglés
to pay under the table = pagar por debajo de la mesa @Inglés
dirty money = dinero sucio @Inglés
to launder money = lavar dinero @Inglés
a slap on the wrist = un simple regaño|una sanción mínima @Inglés
the last straw = la gota que colmó el vaso @Inglés
to give someone a hard time = hacerle la vida difícil a alguien|molestar @Inglés
to keep an eye on = vigilar|no perder de vista @Inglés
to keep tabs on someone = vigilar a alguien|seguirle los pasos @Inglés
to be on someone's tail = seguir a alguien de cerca @Inglés
to tail someone = seguir a alguien @Inglés
to stake out = vigilar (un lugar) @Inglés
to bust someone = arrestar a alguien|agarrar a alguien @Inglés
to book someone = fichar a alguien|registrar el arresto @Inglés
to be behind bars = estar tras las rejas|estar preso @Inglés
to go straight = rehabilitarse|dejar la mala vida @Inglés
to turn oneself in = entregarse @Inglés
to have a run-in with the law = tener problemas con la justicia @Inglés
to be in hot water = estar en problemas|estar en un lío @Inglés
to face the music = afrontar las consecuencias @Inglés
to let someone off the hook = librar a alguien de responsabilidad|dejar pasar @Inglés
to come forward = presentarse|dar la cara @Inglés
to point the finger at = culpar a|señalar a @Inglés
to have someone's back = respaldar a alguien|cubrirle las espaldas @Inglés
off the top of my head = así de memoria|sin pensarlo mucho @Inglés
to ring a bell = sonar conocido|me suena @Inglés
in the heat of the moment = en el calor del momento|en el arrebato @Inglés
all of a sudden = de repente @Inglés
in the blink of an eye = en un abrir y cerrar de ojos @Inglés
to call it a night = dar la noche por terminada|irse a dormir @Inglés
to crash at someone's place = quedarse a dormir donde alguien @Inglés
to pick a fight = buscar pleito|buscar problemas @Inglés
to get into it with someone = pelearse con alguien @Inglés
to pull a gun on someone = sacarle una pistola a alguien|apuntar con un arma @Inglés
to mess with someone = meterse con alguien @Inglés
to talk trash = hablar basura|ofender @Inglés
to be all talk = ser puro cuento|hablar mucho y no hacer nada @Inglés
to have sticky fingers = tener las manos largas|ser ladrón @Inglés
to hit someone up = escribirle o llamar a alguien|pedirle algo @Inglés
to give someone a ride = darle una bola a alguien|llevar a alguien @Inglés
to hold up (a store) = asaltar|atracar @Inglés
a stick-up = un atraco|un asalto @Inglés
a getaway car = un carro de huida @Inglés
a dead end = un callejón sin salida @Inglés
estar en la lona = to be broke|to be flat broke @Dominicano
estar pelao = to be broke @Dominicano
tumbar a alguien = to rip someone off|to con someone (o derribar) @Dominicano
dar un tumbe = to pull a scam|to rip someone off @Dominicano
un tumbador = a con man|a swindler @Dominicano
dar un palo = to pull off a robbery|to score big @Dominicano
estar en algo = to be up to something|to be involved in something shady @Dominicano
andar en malos pasos = to be on the wrong path|to be up to no good @Dominicano
un pana = a buddy|a friend @Dominicano
mi pana full = my best friend|my close buddy @Dominicano
un jevo / una jeva = a boyfriend / a girlfriend @Dominicano
un chamaco = a kid|a boy @Dominicano
un tiguerito = a street-smart kid|a little hustler @Dominicano
estar asfixiado = to be under pressure|to be broke (según contexto) @Dominicano
estar en olla = to be broke|to be in trouble @Dominicano
dar pela = to beat (someone up)|to spank @Dominicano
un boche = a scolding|a telling-off @Dominicano
echar un boche = to scold someone|to chew someone out @Dominicano
estar quillao = to be angry|to be mad @Dominicano
quillarse = to get mad @Dominicano
armar un lío = to start a fight|to make a scene @Dominicano
formar un rebú = to start a commotion|to cause a ruckus @Dominicano
un rebú = a ruckus|a commotion @Dominicano
dar un jumo = to get drunk @Dominicano
estar picao = to be tipsy @Dominicano
un trago = a drink @Dominicano
una frena = a beer|a cold one @Dominicano
estar jarto = to be fed up|to be full @Dominicano
estar hasta la coronilla = to be fed up @Dominicano
no aguantar pela = to be soft|can't take a beating @Dominicano
coger corte = to get cut (from a deal)|to get one's share @Dominicano
dar cotorra = to sweet-talk|to fast-talk someone @Dominicano
dar muela = to sweet-talk someone|to talk someone into something @Dominicano
un muelú = a smooth talker @Dominicano
estar en pie de lucha = to be ready to fight @Dominicano
coger el monte = to go on the run|to flee into the countryside @Dominicano
irse de la casa sin decir nada = to leave home without telling anyone @Dominicano
pasar el Niágara en bicicleta = to go through hell|to have a very hard time @Dominicano
ser un chivo = to be a spy|to be a snitch @Dominicano
chivatear = to snitch @Dominicano
hacerse el loco = to play dumb|to pretend not to know @Dominicano
echarle el muerto a alguien = to pin the blame on someone @Dominicano
pagar los platos rotos = to take the fall|to pay the price @Dominicano
estar en el bonche = to be partying with friends @Dominicano
un jevi = cool|awesome @Dominicano
dique = supposedly|allegedly @Dominicano
de una vez = right away|immediately @Dominicano
ahorita = in a little while|right now (según contexto) @Dominicano
a la cañona = by force|against one's will @Dominicano
un cuarto = money|some cash @Dominicano
un peso = a peso|money @Dominicano
un motoconchista = a motorcycle taxi driver @Dominicano
una pasola = a scooter|a moped @Dominicano
un bacano = a rich guy|a big shot @Dominicano
un guardia = a police officer|a cop (o soldado) @Dominicano
un raso = a low-ranking officer|a private @Dominicano
el destacamento = the police station @Dominicano
la Victoria = La Victoria prison @Dominicano
estar preso = to be in jail|to be locked up @Dominicano
`;

function parseG(txt) {
  return txt.trim().split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [pair, cat] = l.split(" @");
    const [en, es] = pair.split(" = ");
    return [en.trim(), es.trim(), (cat || "Otros").trim()];
  }).filter((r) => r[0] && r[1]);
}
export const GLOSARIO3 = parseG(G);
export const MODISMOS3 = parseG(MOD);
export const FALSOS3 = FA.trim().split("\n").map((l) => l.split(" | ").map((x) => x.trim())).filter((r) => r.length === 3);

// Banco 3 (parte D): audiencias de consecutiva adicionales (sin internet), formato del examen oral.
import { DIALOGOS } from "./content.js";
const T = (hablante, idioma, texto) => ({ hablante, idioma, texto });

const NUEVOS = [
  {
    id: "d11", titulo: "Medida de coerción – turista detenido con droga en el aeropuerto", nivel: 2,
    contexto: "Oficina de Atención Permanente de Boca Chica. Imputado estadounidense detenido en el Aeropuerto de Las Américas.",
    turnos: [
      T("Juez", "es", "Buenos días. Señor, ¿entiende usted el español o necesita intérprete?"),
      T("Imputado", "en", "I need an interpreter, please. I only understand a little Spanish."),
      T("Juez", "es", "El tribunal le informa que usted tiene derecho a guardar silencio y a ser asistido por un abogado. ¿Ha entendido sus derechos?"),
      T("Imputado", "en", "Yes, Your Honor, I understand. My lawyer is right here."),
      T("Fiscal", "es", "Honorable, el señor fue detenido el 2 de noviembre en la puerta 9 del aeropuerto. En el doble fondo de su maleta se ocuparon cuatro paquetes con un peso total de 4.2 kilogramos de cocaína."),
      T("Fiscal", "es", "Por la gravedad de los hechos y el peligro de fuga, ya que el imputado no tiene arraigo en el país, solicitamos un año de prisión preventiva."),
      T("Juez", "es", "Señor, ¿desea declarar? Recuerde que no está obligado."),
      T("Imputado", "en", "Yes, I want to say something. A man I met at the hotel in Bávaro asked me to take the suitcase to Newark as a favor. He said it was full of clothes for his kids."),
      T("Imputado", "en", "He paid for my hotel and gave me eight hundred dollars. I know that was stupid, but I swear I didn't know there were drugs inside."),
      T("Defensa", "es", "Honorable, mi representado tiene 23 años, no tiene antecedentes y colaboró desde el primer momento. Solicitamos una garantía económica y el impedimento de salida."),
      T("Juez", "es", "¿Usted conoce el nombre de la persona que le entregó la maleta?"),
      T("Imputado", "en", "He told me his name was Junior. He had a tattoo of a lion on his neck and he drove a black Jeep. I can show you his number on my phone."),
      T("Juez", "es", "El tribunal impone la medida de coerción de prisión preventiva por un período de doce meses. Se fija la revisión obligatoria en tres meses."),
      T("Imputado", "en", "Twelve months? Can I at least call my mother? She doesn't know where I am.")
    ]
  },
  {
    id: "d12", titulo: "Juicio de fondo – violencia de género, testimonio de la víctima", nivel: 2,
    contexto: "Tribunal Colegiado de Santiago. La víctima, residente en Nueva York, declara en inglés.",
    turnos: [
      T("Fiscal", "es", "Señora Taylor, diga al tribunal cómo conoció al imputado y cuánto tiempo estuvieron juntos."),
      T("Víctima", "en", "We met online in 2020. He was very sweet at first. I moved to Santiago in March 2022, and we lived together for about a year and a half."),
      T("Fiscal", "es", "¿Cuándo empezaron los problemas?"),
      T("Víctima", "en", "A few months after I moved. He started checking my phone, he didn't let me go out with my friends, and he got angry if I talked to my family in English."),
      T("Fiscal", "es", "Hable al tribunal de lo que pasó la noche del 14 de agosto de 2023."),
      T("Víctima", "en", "He came home drunk around one in the morning. He accused me of cheating on him. I told him to calm down, and he grabbed me by the hair and slammed my head against the wall."),
      T("Víctima", "en", "Then he took a kitchen knife and said that if I ever left him, he would kill me and then kill himself. I was so scared I couldn't even scream."),
      T("Fiscal", "es", "¿Qué hizo usted después?"),
      T("Víctima", "en", "When he fell asleep, I took my passport and walked to my neighbor's house. Her name is Doña Carmen. She called the police and took me to the hospital."),
      T("Defensa", "es", "Señora, ¿no es cierto que usted esa misma semana había comprado un pasaje para irse a Nueva York?"),
      T("Víctima", "en", "Yes, I had bought a ticket, because I was planning to leave him. That's exactly why he got so violent."),
      T("Defensa", "es", "¿Y no es cierto que usted le pidió dinero a mi cliente para pagar ese pasaje?"),
      T("Víctima", "en", "No, that's not true. I paid for it with my own credit card. I can show you the receipt."),
      T("Juez", "es", "La testigo puede retirarse. El tribunal agradece su comparecencia.")
    ]
  },
  {
    id: "d13", titulo: "Accidente de tránsito – conductor de un camión", nivel: 2,
    contexto: "Juzgado Especial de Tránsito de Santo Domingo Este. Testigo turista estadounidense.",
    turnos: [
      T("Defensa", "es", "Señor Green, ¿dónde se encontraba usted el día del accidente?"),
      T("Testigo", "en", "I was at a bus stop on San Vicente de Paúl Avenue, right across from the Plaza. It was about 5:40 in the afternoon, rush hour."),
      T("Defensa", "es", "Describa al tribunal lo que vio."),
      T("Testigo", "en", "A blue cement truck was going north. The light was green for the truck. A motorcycle with two people on it came out of the side street without stopping and crashed into the side of the truck."),
      T("Defensa", "es", "¿El camión iba a exceso de velocidad?"),
      T("Testigo", "en", "No, I don't think so. It was moving slowly because of the traffic. Maybe thirty or forty kilometers per hour, at the most."),
      T("Fiscal", "es", "Señor, usted dijo que estaba en la parada. ¿Hacia dónde estaba mirando exactamente?"),
      T("Testigo", "en", "I was looking down the avenue to see if my bus was coming, so I was looking straight at the intersection."),
      T("Fiscal", "es", "¿Y los pasajeros de la motocicleta llevaban casco?"),
      T("Testigo", "en", "The driver had a helmet. The girl on the back didn't. She landed on the sidewalk, about ten feet from me. I ran over to help her."),
      T("Fiscal", "es", "¿El conductor del camión se detuvo?"),
      T("Testigo", "en", "Yes, he stopped right away, got out, and called an ambulance. He was very upset. He kept saying, 'They came out of nowhere, they came out of nowhere.'")
    ]
  },
  {
    id: "d14", titulo: "Estafa inmobiliaria – compradora extranjera", nivel: 3,
    contexto: "Tribunal Colegiado de Puerto Plata. Querellante canadiense contra un supuesto agente inmobiliario.",
    turnos: [
      T("Abogado de la víctima", "es", "Señora Dubois, explíquele al tribunal cómo conoció al imputado."),
      T("Víctima", "en", "I found his ad on Facebook in January 2023. He was selling a two-bedroom condo in Sosúa for one hundred and twenty thousand dollars, which seemed like a fair price."),
      T("Abogado de la víctima", "es", "¿Qué documentos le mostró él?"),
      T("Víctima", "en", "He showed me a copy of the land title, a floor plan, and a power of attorney from the owner. Everything looked official. He even took me to see the apartment."),
      T("Abogado de la víctima", "es", "¿Cuánto dinero le entregó usted y de qué forma?"),
      T("Víctima", "en", "I made two wire transfers: forty thousand dollars on February 3rd and sixty thousand on March 15th. The rest was supposed to be paid at closing."),
      T("Abogado de la víctima", "es", "¿Y qué pasó después del segundo pago?"),
      T("Víctima", "en", "He stopped answering my calls. When I went to the Title Registry, they told me the condo belonged to an Italian couple who never authorized the sale. The power of attorney was fake."),
      T("Defensa", "es", "Señora, ¿usted contrató a un abogado antes de hacer esas transferencias?"),
      T("Víctima", "en", "No, I didn't. He told me his cousin was a notary and that it would save me money. Looking back, that was a huge mistake."),
      T("Defensa", "es", "Entonces usted admite que no verificó el título en el Registro antes de pagar."),
      T("Víctima", "en", "I trusted him. That's what con men do: they gain your trust. Not checking doesn't make it my fault that he stole a hundred thousand dollars from me."),
      T("Juez", "es", "Licenciado, limítese a hacer preguntas. La testigo no está siendo juzgada.")
    ]
  },
  {
    id: "d15", titulo: "Manutención de menores – padre residente en EE. UU.", nivel: 1,
    contexto: "Juzgado de Paz de San Cristóbal (demanda de manutención). El padre declara por videollamada en inglés.",
    turnos: [
      T("Juez", "es", "Señor Ramírez, la madre de su hija reclama una pensión alimentaria de quince mil pesos mensuales. ¿Qué tiene que decir?"),
      T("Padre", "en", "Your Honor, I love my daughter. I'm not trying to avoid my responsibility. But I lost my job in Boston in June and I'm working part-time now."),
      T("Juez", "es", "¿Cuánto gana usted actualmente?"),
      T("Padre", "en", "About eight hundred dollars every two weeks, before taxes. My rent alone is fourteen hundred a month."),
      T("Madre", "es", "Eso no es verdad. Él publica fotos en Instagram en restaurantes y en la playa todos los fines de semana."),
      T("Padre", "en", "Those pictures are old, from last year. And sometimes my friends invite me. I can show my pay stubs to the court."),
      T("Juez", "es", "¿Cuándo fue la última vez que envió dinero para la niña?"),
      T("Padre", "en", "I sent two hundred dollars through a remittance agency on October 28th. I have the receipt. Before that, I sent money in August."),
      T("Madre", "es", "Doscientos dólares no alcanzan ni para el colegio. La niña tiene siete años y necesita uniformes, libros y medicinas."),
      T("Juez", "es", "El tribunal fija una pensión provisional de diez mil pesos mensuales, pagaderos los días 5 de cada mes, y ordena al padre depositar sus comprobantes de ingresos."),
      T("Padre", "en", "Thank you, Your Honor. I'll do my best. Can I please talk to my daughter on video this weekend?")
    ]
  },
  {
    id: "d16", titulo: "Robo con violencia – testigo presencial en un colmado", nivel: 2,
    contexto: "Tribunal Colegiado de la provincia Santo Domingo. Testigo estadounidense que estaba de visita en casa de su suegra.",
    turnos: [
      T("Fiscal", "es", "Señor Peterson, ¿qué hacía usted en el colmado La Esquina la noche del 7 de julio?"),
      T("Testigo", "en", "I was buying ice and a few beers. My mother-in-law lives two houses down, in Los Mina. It was around 9:15."),
      T("Fiscal", "es", "¿Qué ocurrió mientras usted estaba allí?"),
      T("Testigo", "en", "Two guys walked in wearing caps. The taller one pulled out a gun and pointed it at the owner. The other one jumped behind the counter and took the money from the drawer."),
      T("Fiscal", "es", "¿Usted les vio la cara?"),
      T("Testigo", "en", "I saw the shorter one very clearly. He was just a few feet from me. He had a gap between his front teeth and a scar on his left eyebrow."),
      T("Fiscal", "es", "¿Ese hombre se encuentra hoy en esta sala?"),
      T("Testigo", "en", "Yes. He's the one sitting next to the defense attorney, in the gray shirt."),
      T("Fiscal", "es", "Que conste en acta que el testigo ha señalado al imputado."),
      T("Defensa", "es", "Señor, usted había tomado cervezas esa noche, ¿verdad?"),
      T("Testigo", "en", "I had one beer at my mother-in-law's house before I went out. I wasn't drunk. I remember everything perfectly."),
      T("Defensa", "es", "¿Y cuánto duró el robo? ¿Un minuto? ¿Menos?"),
      T("Testigo", "en", "Maybe a minute and a half. But when a man is standing three feet from you, you don't forget his face. I see it in my nightmares.")
    ]
  }
];

const seen = new Set(DIALOGOS.map((d) => d.id));
for (const d of NUEVOS) if (!seen.has(d.id)) DIALOGOS.push(d);

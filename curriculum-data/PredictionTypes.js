/* SER / ESTAR PREDICTION PHRASES
   Format per entry: [Spanish, English, Answer, Conjugation]

   [0] Spanish     — shown to the user; conjugated verb replaced with ___
   [1] English     — shown to the user; verb replaced with ___
   [2] Answer      — HIDDEN: "Ser" or "Estar" (verb family the user must choose)
   [3] Conjugation — HIDDEN: fills the ___ blank (e.g. "es", "estoy")

   SER  → D.O.C.T.O.R.  (Descriptions, Occupations, Characteristics, Time, Origin, Relationships)
   ESTAR → P.L.A.C.E.   (Position, Location, Actions, Conditions, Emotions)
*/

// ─── SER — D.O.C.T.O.R. ──────────────────────────────────────────────────────

// D — Descriptions (physical appearance, personality, nationality, religion)
const serDescriptions = [
    // soy
    ["___ alto y delgado.",               "___ tall and slim.",                      "Ser", "soy"],
    ["___ muy tímido.",                   "___ very shy.",                           "Ser", "soy"],
    ["___ de nacionalidad panameña.",     "___ of Panamanian nationality.",          "Ser", "soy"],
    ["___ moreno y de ojos oscuros.",     "___ dark and dark-eyed.",                 "Ser", "soy"],
    ["___ muy extrovertido.",             "___ very extroverted.",                   "Ser", "soy"],
    ["___ cristiano.",                    "___ Christian.",                          "Ser", "soy"],
    ["___ bastante serio.",               "___ quite serious.",                      "Ser", "soy"],
    ["___ de complexión robusta.",        "___ of sturdy build.",                    "Ser", "soy"],
    ["___ muy curioso por naturaleza.",   "___ very curious by nature.",             "Ser", "soy"],
    ["___ una persona muy paciente.",     "___ a very patient person.",              "Ser", "soy"],
    // eres
    ["___ muy amable.",                   "___ very kind.",                        "Ser", "eres"],
    ["___ muy inteligente.",              "___ very intelligent.",                 "Ser", "eres"],
    ["___ una persona generosa.",         "___ a generous person.",                "Ser", "eres"],
    ["___ muy divertido.",                "___ very funny.",                       "Ser", "eres"],
    ["___ bastante alto.",                "___ quite tall.",                       "Ser", "eres"],
    ["___ muy responsable.",              "___ very responsible.",                 "Ser", "eres"],
    ["___ muy trabajador.",               "___ very hardworking.",                 "Ser", "eres"],
    ["___ una persona muy honesta.",      "___ a very honest person.",             "Ser", "eres"],
    ["___ muy creativo.",                 "___ very creative.",                    "Ser", "eres"],
    ["___ de cabello negro.",             "___ dark-haired.",                      "Ser", "eres"],
    // es
    ["___ alta.",                        "___ tall.",                             "Ser", "es"],
    ["___ muy delgado.",                   "___ very thin.",                         "Ser", "es"],
    ["El niño ___ rubio.",                    "The boy ___ blonde.",                       "Ser", "es"],
    ["___ católica.",                    "___ Catholic.",                         "Ser", "es"],
    ["Mi amigo ___ muy gracioso.",            "My friend ___ very funny.",                 "Ser", "es"],
    ["La profesora ___ muy estricta.",        "The teacher ___ very strict.",              "Ser", "es"],
    ["El niño ___ muy inteligente.",          "The boy ___ very intelligent.",             "Ser", "es"],
    ["Mi hermana ___ muy generosa.",          "My sister ___ very generous.",              "Ser", "es"],
    ["El anciano ___ muy sabio.",             "The old man ___ very wise.",                "Ser", "es"],
    ["___ de tez morena.",               "___ dark-complexioned.",                "Ser", "es"],
    // somos
    ["___ inteligentes.",            "___ intelligent.",                       "Ser", "somos"],
    ["___ muy trabajadores.",        "___ very hardworking.",                  "Ser", "somos"],
    ["___ personas muy amables.",    "___ very kind people.",                  "Ser", "somos"],
    ["___ muy similares en carácter.","___ very similar in character.",       "Ser", "somos"],
    ["___ bastante serios.",         "___ quite serious.",                     "Ser", "somos"],
    ["___ muy responsables.",        "___ very responsible.",                  "Ser", "somos"],
    ["___ muy creativos.",           "___ very creative.",                     "Ser", "somos"],
    ["___ de la misma religión.",    "___ of the same religion.",              "Ser", "somos"],
    ["___ personas muy honestas.",   "___ very honest people.",                "Ser", "somos"],
    ["___ muy divertidos en grupo.", "___ very fun as a group.",               "Ser", "somos"],
    // son
    ["___ españoles.",                  "___ Spanish.",                         "Ser", "son"],
    ["___ muy simpáticas.",             "___ very friendly.",                   "Ser", "son"],
    ["Los niños ___ rubios.",                 "The children ___ blonde.",                  "Ser", "son"],
    ["Mis vecinos ___ muy ruidosos.",         "My neighbours ___ very noisy.",             "Ser", "son"],
    ["Los estudiantes ___ muy dedicados.",    "The students ___ very dedicated.",          "Ser", "son"],
    ["Las chicas ___ muy altas.",             "The girls ___ very tall.",                  "Ser", "son"],
    ["Mis colegas ___ muy creativos.",        "My colleagues ___ very creative.",          "Ser", "son"],
    ["Los actores ___ muy talentosos.",       "The actors ___ very talented.",             "Ser", "son"],
    ["Las personas mayores ___ muy sabias.",  "Elderly people ___ very wise.",             "Ser", "son"],
    ["___ muy amables con todos.",      "___ very kind to everyone.",           "Ser", "son"],
];

// O — Occupations (professions and roles)
const serOccupations = [
    // soy
    ["___ profesora.",                      "___ a teacher.",                          "Ser", "soy"],
    ["___ médico.",                          "___ a doctor.",                           "Ser", "soy"],
    ["___ estudiante de español.",           "___ a Spanish student.",                  "Ser", "soy"],
    ["___ abogado.",                         "___ a lawyer.",                           "Ser", "soy"],
    ["___ carpintero.",                      "___ a carpenter.",                        "Ser", "soy"],
    ["___ chef en un restaurante.",          "___ a chef at a restaurant.",             "Ser", "soy"],
    ["___ policía.",                         "___ a police officer.",                   "Ser", "soy"],
    ["___ periodista.",                      "___ a journalist.",                       "Ser", "soy"],
    ["___ arquitecto.",                      "___ an architect.",                       "Ser", "soy"],
    ["___ conductor de autobús.",            "___ a bus driver.",                       "Ser", "soy"],
    // eres
    ["___ estudiante.",                      "___ a student.",                        "Ser", "eres"],
    ["___ un buen ingeniero.",               "___ a good engineer.",                  "Ser", "eres"],
    ["___ cocinero en ese restaurante.",     "___ a cook at that restaurant.",        "Ser", "eres"],
    ["___ el mejor médico del hospital.",    "___ the best doctor in the hospital.",  "Ser", "eres"],
    ["___ diseñador gráfico.",               "___ a graphic designer.",               "Ser", "eres"],
    ["___ enfermero en urgencias.",          "___ a nurse in the emergency room.",    "Ser", "eres"],
    ["___ programador.",                     "___ a programmer.",                     "Ser", "eres"],
    ["___ bombero.",                         "___ a firefighter.",                    "Ser", "eres"],
    ["___ contador público.",                "___ a public accountant.",              "Ser", "eres"],
    ["___ traductor de idiomas.",            "___ a language translator.",            "Ser", "eres"],
    // es
    ["___ médico.",                          "___ a doctor.",                          "Ser", "es"],
    ["___ abogada.",                       "___ a lawyer.",                         "Ser", "es"],
    ["Mi madre ___ enfermera.",                 "My mother ___ a nurse.",                    "Ser", "es"],
    ["El hombre ___ cocinero.",                 "The man ___ a cook.",                       "Ser", "es"],
    ["Mi padre ___ ingeniero.",                 "My father ___ an engineer.",                "Ser", "es"],
    ["La mujer ___ arquitecta.",                "The woman ___ an architect.",               "Ser", "es"],
    ["Mi hermano ___ policía.",                 "My brother ___ a police officer.",          "Ser", "es"],
    ["La chica ___ periodista.",                "The girl ___ a journalist.",                "Ser", "es"],
    ["El dueño ___ empresario.",                "The owner ___ a businessman.",              "Ser", "es"],
    ["Mi vecino ___ electricista.",             "My neighbour ___ an electrician.",          "Ser", "es"],
    // somos
    ["___ artistas.",                  "___ artists.",                           "Ser", "somos"],
    ["___ profesores en esa escuela.", "___ teachers at that school.",           "Ser", "somos"],
    ["___ ingenieros en la misma empresa.","___ engineers at the same company.", "Ser", "somos"],
    ["___ voluntarios en el hospital.","___ volunteers at the hospital.",        "Ser", "somos"],
    ["___ investigadores de la universidad.","___ researchers at the university.","Ser", "somos"],
    ["___ médicos especializados.",    "___ specialist doctors.",                "Ser", "somos"],
    ["___ cocineros en el mismo restaurante.","___ cooks at the same restaurant.","Ser", "somos"],
    ["___ entrenadores de fútbol.",    "___ football coaches.",                  "Ser", "somos"],
    ["___ arquitectos del mismo proyecto.","___ architects on the same project.","Ser", "somos"],
    ["___ periodistas del mismo periódico.","___ journalists at the same newspaper.","Ser", "somos"],
    // son
    ["___ ingenieros.",                   "___ engineers.",                       "Ser", "son"],
    ["Mis padres ___ médicos.",                 "My parents ___ doctors.",                   "Ser", "son"],
    ["Los dos hombres ___ abogados.",           "The two men ___ lawyers.",                  "Ser", "son"],
    ["___ profesores de matemáticas.",    "___ maths teachers.",                  "Ser", "son"],
    ["Las mujeres ___ enfermeras.",             "The women ___ nurses.",                     "Ser", "son"],
    ["Los chicos ___ bomberos.",                "The guys ___ firefighters.",                "Ser", "son"],
    ["Mis compañeros ___ programadores.",       "My colleagues ___ programmers.",            "Ser", "son"],
    ["Las dos chicas ___ diseñadoras.",         "The two girls ___ designers.",              "Ser", "son"],
    ["___ pilotos de avión.",             "___ airline pilots.",                  "Ser", "son"],
    ["Los nuevos empleados ___ contadores.",    "The new employees ___ accountants.",        "Ser", "son"],
];

// C — Characteristics (inherent properties of objects)
const serCharacteristics = [
    // soy
    ["___ una persona honesta.",           "___ an honest person.",                   "Ser", "soy"],
    ["___ zurdo.",                         "___ left-handed.",                        "Ser", "soy"],
    ["___ de piel morena.",                "___ dark-skinned.",                       "Ser", "soy"],
    ["___ muy terco por naturaleza.",      "___ very stubborn by nature.",            "Ser", "soy"],
    ["___ de sangre fría.",                "___ cold-blooded.",                       "Ser", "soy"],
    ["___ una persona muy directa.",       "___ a very direct person.",               "Ser", "soy"],
    ["___ de complexión atlética.",        "___ of athletic build.",                  "Ser", "soy"],
    ["___ un hombre de palabra.",          "___ a man of my word.",                   "Ser", "soy"],
    ["___ muy leal con mis amigos.",       "___ very loyal to my friends.",           "Ser", "soy"],
    ["___ bastante pragmático.",           "___ quite pragmatic.",                    "Ser", "soy"],
    // eres
    ["___ muy creativo.",                  "___ very creative.",                    "Ser", "eres"],
    ["___ de complexión delgada.",         "___ of slim build.",                    "Ser", "eres"],
    ["___ muy valiente.",                  "___ very brave.",                       "Ser", "eres"],
    ["___ una persona muy disciplinada.",  "___ a very disciplined person.",        "Ser", "eres"],
    ["___ de carácter muy fuerte.",        "___ of very strong character.",         "Ser", "eres"],
    ["___ naturalmente curioso.",          "___ naturally curious.",                "Ser", "eres"],
    ["___ una persona de confianza.",      "___ a trustworthy person.",             "Ser", "eres"],
    ["___ muy observador.",                "___ very observant.",                   "Ser", "eres"],
    ["___ muy detallista.",                "___ very detail-oriented.",             "Ser", "eres"],
    ["___ una persona muy reflexiva.",     "___ a very thoughtful person.",         "Ser", "eres"],
    // es
    ["La mesa ___ de madera.",                "The table ___ made of wood.",               "Ser", "es"],
    ["El anillo ___ de oro.",                 "The ring ___ made of gold.",                "Ser", "es"],
    ["El hielo ___ frío.",                    "Ice ___ cold.",                             "Ser", "es"],
    ["El fuego ___ caliente.",                "Fire ___ hot.",                             "Ser", "es"],
    ["La rosa ___ roja.",                     "The rose ___ red.",                         "Ser", "es"],
    ["El acero ___ muy resistente.",          "Steel ___ very resistant.",                 "Ser", "es"],
    ["El diamante ___ el mineral más duro.",  "Diamond ___ the hardest mineral.",          "Ser", "es"],
    ["El cielo ___ azul.",                    "The sky ___ blue.",                         "Ser", "es"],
    ["La miel ___ dulce.",                    "Honey ___ sweet.",                          "Ser", "es"],
    ["El carbón ___ negro.",                  "Coal ___ black.",                           "Ser", "es"],
    // somos
    ["___ seres humanos.",           "___ human beings.",                      "Ser", "somos"],
    ["___ muy similares en carácter.","___ very similar in character.",        "Ser", "somos"],
    ["___ personas honradas.",       "___ honorable people.",                  "Ser", "somos"],
    ["___ de la misma raza.",        "___ of the same race.",                  "Ser", "somos"],
    ["___ muy tercos.",              "___ very stubborn.",                     "Ser", "somos"],
    ["___ muy diferentes en personalidad.","___ very different in personality.","Ser", "somos"],
    ["___ personas muy leales.",     "___ very loyal people.",                 "Ser", "somos"],
    ["___ bastante pragmáticos.",    "___ quite pragmatic.",                   "Ser", "somos"],
    ["___ muy directos al hablar.",  "___ very direct when speaking.",         "Ser", "somos"],
    ["___ de sangre caliente.",      "___ hot-blooded.",                       "Ser", "somos"],
    // son
    ["Las rosas ___ rojas.",                  "The roses ___ red.",                        "Ser", "son"],
    ["Los diamantes ___ muy duros.",          "Diamonds ___ very hard.",                   "Ser", "son"],
    ["Las paredes ___ de ladrillo.",          "The walls ___ made of brick.",              "Ser", "son"],
    ["Los metales ___ buenos conductores.",   "Metals ___ good conductors.",               "Ser", "son"],
    ["Las esmeraldas ___ verdes.",            "Emeralds ___ green.",                       "Ser", "son"],
    ["Los lobos ___ animales salvajes.",      "Wolves ___ wild animals.",                  "Ser", "son"],
    ["Las montañas ___ muy altas.",           "The mountains ___ very high.",              "Ser", "son"],
    ["Los colores del arcoíris ___ brillantes.","The colours of the rainbow ___ bright.", "Ser", "son"],
    ["Las mariposas ___ muy frágiles.",       "Butterflies ___ very fragile.",             "Ser", "son"],
    ["Las ballenas ___ mamíferos.",           "Whales ___ mammals.",                       "Ser", "son"],
];

// T — Time (telling time, dates, days of the week)
const serTime = [
    // soy
    ["___ del signo Escorpio.",             "___ a Scorpio.",                          "Ser", "soy"],
    ["___ del turno de la mañana.",         "___ on the morning shift.",               "Ser", "soy"],
    ["___ del signo Aries.",                "___ an Aries.",                           "Ser", "soy"],
    ["___ del signo Cáncer.",               "___ a Cancer.",                           "Ser", "soy"],
    ["___ de la generación de los noventa.","___ from the nineties generation.",       "Ser", "soy"],
    ["___ una persona muy puntual.",        "___ a very punctual person.",             "Ser", "soy"],
    ["___ del turno de tarde.",             "___ on the afternoon shift.",             "Ser", "soy"],
    ["___ mayor que tú.",                   "___ older than you.",                     "Ser", "soy"],
    ["___ nacido en invierno.",             "___ born in winter.",                     "Ser", "soy"],
    ["___ el menor de la familia.",         "___ the youngest in the family.",         "Ser", "soy"],
    // eres
    ["___ del signo Géminis.",              "___ a Gemini.",                         "Ser", "eres"],
    ["___ del turno de la noche.",          "___ on the night shift.",               "Ser", "eres"],
    ["___ del signo Tauro.",                "___ a Taurus.",                         "Ser", "eres"],
    ["___ mayor que yo.",                   "___ older than me.",                    "Ser", "eres"],
    ["___ del signo Leo.",                  "___ a Leo.",                            "Ser", "eres"],
    ["___ nacido en verano.",               "___ born in summer.",                   "Ser", "eres"],
    ["___ de la misma generación que yo.",  "___ from the same generation as me.",  "Ser", "eres"],
    ["___ el mayor de tus hermanos.",       "___ the oldest of your siblings.",      "Ser", "eres"],
    ["___ del turno de la mañana también.", "___ also on the morning shift.",        "Ser", "eres"],
    ["___ muy joven para ese cargo.",       "___ very young for that position.",     "Ser", "eres"],
    // es
    ["Hoy ___ lunes.",                         "Today ___ Monday.",                         "Ser", "es"],
    ["Hoy ___ el cinco de mayo.",              "Today ___ the fifth of May.",               "Ser", "es"],
    ["Hoy ___ martes.",                        "Today ___ Tuesday.",                        "Ser", "es"],
    ["___ la una en punto.",                   "It ___ exactly one o'clock.",               "Ser", "es"],
    ["Hoy ___ el veinte de enero.",            "Today ___ the twentieth of January.",       "Ser", "es"],
    ["Hoy ___ mi cumpleaños.",                 "Today ___ my birthday.",                    "Ser", "es"],
    ["Ya ___ muy tarde.",                      "It ___ very late already.",                 "Ser", "es"],
    ["Hoy ___ el último día del mes.",         "Today ___ the last day of the month.",      "Ser", "es"],
    ["Hoy ___ domingo.",                       "Today ___ Sunday.",                         "Ser", "es"],
    ["Hoy ___ el primer día de primavera.",    "Today ___ the first day of spring.",        "Ser", "es"],
    // estamos
    ["___ del mismo turno.",          "___ on the same shift.",                 "Ser", "somos"],
    ["___ de la misma generación.",   "___ from the same generation.",          "Ser", "somos"],
    ["___ nacidos en el mismo mes.",  "___ born in the same month.",            "Ser", "somos"],
    ["___ del mismo signo zodiacal.", "___ the same star sign.",                "Ser", "somos"],
    ["___ de la misma edad.",         "___ the same age.",                      "Ser", "somos"],
    ["___ los mayores del grupo.",    "___ the oldest in the group.",           "Ser", "somos"],
    ["___ contemporáneos.",           "___ contemporaries.",                    "Ser", "somos"],
    ["___ del turno de noche esta semana.","___ on the night shift this week.", "Ser", "somos"],
    ["___ nacidos en el mismo año.",  "___ born in the same year.",             "Ser", "somos"],
    ["___ los más jóvenes de la empresa.","___ the youngest at the company.",  "Ser", "somos"],
    // son — clock time: plural noun (las X) uniquely determines conjugation
    ["___ las tres de la tarde.",              "It ___ three in the afternoon.",            "Ser", "son"],
    ["___ las doce del mediodía.",             "It ___ noon.",                              "Ser", "son"],
    ["___ las ocho de la mañana.",             "It ___ eight in the morning.",              "Ser", "son"],
    ["___ las cinco y media.",                 "It ___ half past five.",                    "Ser", "son"],
    ["___ las once de la noche.",              "It ___ eleven at night.",                   "Ser", "son"],
    ["___ las dos y cuarto.",                  "It ___ quarter past two.",                  "Ser", "son"],
    ["___ las siete de la mañana.",            "It ___ seven in the morning.",              "Ser", "son"],
    ["___ las nueve y media de la noche.",     "It ___ half past nine at night.",           "Ser", "son"],
    ["___ las cuatro menos cuarto.",           "It ___ quarter to four.",                   "Ser", "son"],
    ["___ las diez en punto.",                 "It ___ exactly ten o'clock.",               "Ser", "son"],
];

// O — Origin (where someone or something is from)
const serOrigin = [
    // soy
    ["___ de Panamá.",                     "___ from Panama.",                        "Ser", "soy"],
    ["___ panameño.",                      "___ Panamanian.",                         "Ser", "soy"],
    ["___ de una familia humilde.",         "___ from a humble family.",               "Ser", "soy"],
    ["___ de origen italiano.",            "___ of Italian origin.",                  "Ser", "soy"],
    ["___ del norte del país.",            "___ from the north of the country.",      "Ser", "soy"],
    ["___ de ascendencia africana.",       "___ of African descent.",                 "Ser", "soy"],
    ["___ del campo, no de la ciudad.",    "___ from the countryside, not the city.", "Ser", "soy"],
    ["___ colombiano por parte de madre.", "___ Colombian on my mother's side.",      "Ser", "soy"],
    ["___ mestizo.",                       "___ of mixed heritage.",                  "Ser", "soy"],
    ["___ de la costa caribeña.",          "___ from the Caribbean coast.",           "Ser", "soy"],
    // eres
    ["¿De dónde ___ tú?",                     "Where ___ you from?",                       "Ser", "eres"],
    ["___ mexicano, ¿verdad?",             "___ Mexican, right?",                   "Ser", "eres"],
    ["___ de aquí, ¿no?",                  "___ from here, right?",                 "Ser", "eres"],
    ["___ venezolano, según recuerdo.",    "___ Venezuelan, if I remember right.",  "Ser", "eres"],
    ["___ de la capital, ¿no?",            "___ from the capital, aren't you?",     "Ser", "eres"],
    ["___ de familia extranjera.",         "___ from a foreign family.",            "Ser", "eres"],
    ["___ de origen español.",             "___ of Spanish origin.",                "Ser", "eres"],
    ["___ del sur del país.",              "___ from the south of the country.",    "Ser", "eres"],
    ["___ de ascendencia europea.",        "___ of European descent.",              "Ser", "eres"],
    ["___ de una ciudad muy pequeña.",     "___ from a very small town.",           "Ser", "eres"],
    // es
    ["___ de México.",                   "___ from Mexico.",                      "Ser", "es"],
    ["___ colombiano.",                    "___ Colombian.",                         "Ser", "es"],
    ["El café ___ de Colombia.",              "The coffee ___ from Colombia.",             "Ser", "es"],
    ["Este queso ___ de Francia.",            "This cheese ___ from France.",              "Ser", "es"],
    ["El vino ___ de Argentina.",             "The wine ___ from Argentina.",              "Ser", "es"],
    ["Mi profesor ___ de Cuba.",              "My teacher ___ from Cuba.",                 "Ser", "es"],
    ["Esta cerámica ___ de México.",          "This pottery ___ from Mexico.",             "Ser", "es"],
    ["El chocolate ___ de Ecuador.",          "The chocolate ___ from Ecuador.",           "Ser", "es"],
    ["Mi vecino ___ de Venezuela.",           "My neighbour ___ from Venezuela.",          "Ser", "es"],
    ["Esta receta ___ de mi abuela.",         "This recipe ___ from my grandmother.",      "Ser", "es"],
    // somos
    ["___ de España.",               "___ from Spain.",                        "Ser", "somos"],
    ["___ latinoamericanos.",         "___ Latin American.",                    "Ser", "somos"],
    ["___ del mismo país.",          "___ from the same country.",             "Ser", "somos"],
    ["___ de orígenes muy distintos.","___ from very different backgrounds.",  "Ser", "somos"],
    ["___ de la misma región.",      "___ from the same region.",              "Ser", "somos"],
    ["___ de ascendencia indígena.", "___ of indigenous descent.",             "Ser", "somos"],
    ["___ todos inmigrantes de primera generación.","___ all first-generation immigrants.","Ser", "somos"],
    ["___ de familias muy distintas.","___ from very different families.",     "Ser", "somos"],
    ["___ de la misma provincia.",   "___ from the same province.",            "Ser", "somos"],
    ["___ del mismo barrio.",        "___ from the same neighbourhood.",       "Ser", "somos"],
    // son
    ["___ argentinos.",                 "___ Argentine.",                       "Ser", "son"],
    ["Mis abuelos ___ de Cuba.",              "My grandparents ___ from Cuba.",            "Ser", "son"],
    ["Estas frutas ___ de Colombia.",         "These fruits ___ from Colombia.",           "Ser", "son"],
    ["Los jugadores ___ brasileños.",         "The players ___ Brazilian.",                "Ser", "son"],
    ["Estos productos ___ de importación.",   "These products ___ imported.",              "Ser", "son"],
    ["Las especias ___ de la India.",         "The spices ___ from India.",                "Ser", "son"],
    ["Los turistas ___ de Alemania.",         "The tourists ___ from Germany.",            "Ser", "son"],
    ["Mis compañeros ___ de distintos países.","My classmates ___ from different countries.","Ser", "son"],
    ["Esos zapatos ___ de cuero italiano.",   "Those shoes ___ made of Italian leather.",  "Ser", "son"],
    ["Los actores ___ de Hollywood.",         "The actors ___ from Hollywood.",            "Ser", "son"],
];

// R — Relationships (family ties and personal connections)
const serRelationships = [
    // soy
    ["___ el hermano mayor.",                 "___ the older brother.",                   "Ser", "soy"],
    ["___ su mejor amigo.",                   "___ his best friend.",                     "Ser", "soy"],
    ["___ el padre de dos hijos.",            "___ the father of two children.",          "Ser", "soy"],
    ["___ el hijo único.",                    "___ the only child.",                      "Ser", "soy"],
    ["___ su padrino.",                       "___ his godfather.",                       "Ser", "soy"],
    ["___ la madre de familia.",              "___ the mother of the family.",            "Ser", "soy"],
    ["___ su mentor desde hace años.",        "___ his mentor for years.",                "Ser", "soy"],
    ["___ el tío favorito de los niños.",     "___ the children's favourite uncle.",      "Ser", "soy"],
    ["___ el novio de María.",                "___ María's boyfriend.",                   "Ser", "soy"],
    ["___ su compañero de toda la vida.",     "___ his lifelong companion.",              "Ser", "soy"],
    // eres
    ["___ mi mejor amigo.",                   "___ my best friend.",                    "Ser", "eres"],
    ["___ la persona más importante aquí.",   "___ the most important person here.",    "Ser", "eres"],
    ["___ como un hermano para mí.",          "___ like a brother to me.",              "Ser", "eres"],
    ["___ mi pareja desde hace tres años.",   "___ my partner for three years.",        "Ser", "eres"],
    ["___ el mejor amigo de mi hijo.",        "___ my son's best friend.",              "Ser", "eres"],
    ["___ mi compañero de cuarto.",           "___ my roommate.",                       "Ser", "eres"],
    ["___ su tutor legal.",                   "___ his legal guardian.",                "Ser", "eres"],
    ["___ como una madre para mí.",           "___ like a mother to me.",               "Ser", "eres"],
    ["___ mi cuñado, ¿verdad?",               "___ my brother-in-law, right?",          "Ser", "eres"],
    ["___ la madrina de mi hija.",            "___ my daughter's godmother.",           "Ser", "eres"],
    // es
    ["___ mi hermana.",                     "___ my sister.",                         "Ser", "es"],
    ["___ mi padre.",                         "___ my father.",                          "Ser", "es"],
    ["___ mi jefe.",                          "___ my boss.",                            "Ser", "es"],
    ["___ mi novia.",                       "___ my girlfriend.",                     "Ser", "es"],
    ["___ la madrina de mi hijo.",          "___ my son's godmother.",                "Ser", "es"],
    ["___ mi suegro.",                        "___ my father-in-law.",                   "Ser", "es"],
    ["___ mi vecina desde siempre.",        "___ my neighbour for as long as I remember.","Ser", "es"],
    ["El niño ___ el hijo de mi hermano.",       "The boy ___ my brother's son.",              "Ser", "es"],
    ["___ mi profesora favorita.",          "___ my favourite teacher.",              "Ser", "es"],
    ["___ mi compañero de trabajo.",          "___ my work colleague.",                  "Ser", "es"],
    // somos
    ["___ primos.",                     "___ cousins.",                            "Ser", "somos"],
    ["___ muy buenos amigos.",          "___ very good friends.",                  "Ser", "somos"],
    ["___ compañeros de trabajo.",      "___ work colleagues.",                    "Ser", "somos"],
    ["___ hermanos gemelos.",           "___ twins.",                              "Ser", "somos"],
    ["___ cuñados.",                    "___ brothers-in-law.",                    "Ser", "somos"],
    ["___ padrinos de la misma boda.",  "___ both godparents at the same wedding.","Ser", "somos"],
    ["___ compañeros de piso.",         "___ flatmates.",                          "Ser", "somos"],
    ["___ socios en el mismo negocio.", "___ business partners.",                  "Ser", "somos"],
    ["___ muy unidos como familia.",    "___ very close as a family.",             "Ser", "somos"],
    ["___ compadres desde hace muchos años.","___ close friends for many years.",  "Ser", "somos"],
    // son
    ["___ mis amigos.",                    "___ my friends.",                       "Ser", "son"],
    ["___ mis vecinos.",                   "___ my neighbors.",                     "Ser", "son"],
    ["Mis padres ___ muy cariñosos.",            "My parents ___ very affectionate.",          "Ser", "son"],
    ["___ mis primos de parte de mi padre.","___ my cousins on my father's side.",  "Ser", "son"],
    ["Las chicas ___ mis compañeras de clase.",  "The girls ___ my classmates.",               "Ser", "son"],
    ["___ los mejores amigos de mi hermano.","___ my brother's best friends.",      "Ser", "son"],
    ["Mis abuelos ___ los pilares de la familia.","My grandparents ___ the pillars of the family.","Ser", "son"],
    ["___ mis sobrinas.",                  "___ my nieces.",                        "Ser", "son"],
    ["Mis compañeros ___ como una familia.",     "My colleagues ___ like a family.",           "Ser", "son"],
    ["Los niños ___ los hijos de mi vecino.",    "The children ___ my neighbour's kids.",      "Ser", "son"],
];


// ─── ESTAR — P.L.A.C.E. ──────────────────────────────────────────────────────

// P — Position (physical stance or posture)
const estarPosition = [
    // estoy
    ["___ de pie.",                           "___ standing.",                              "Estar", "estoy"],
    ["___ sentado en la silla.",              "___ sitting in the chair.",                  "Estar", "estoy"],
    ["___ acostado en el sofá.",              "___ lying on the sofa.",                     "Estar", "estoy"],
    ["___ arrodillado.",                      "___ kneeling.",                              "Estar", "estoy"],
    ["___ agachado.",                         "___ crouching.",                             "Estar", "estoy"],
    ["___ apoyado en la pared.",              "___ leaning against the wall.",              "Estar", "estoy"],
    ["___ de puntillas.",                     "___ on tiptoe.",                             "Estar", "estoy"],
    ["___ boca abajo.",                       "___ face down.",                             "Estar", "estoy"],
    ["___ tumbado en la cama.",               "___ lying on the bed.",                      "Estar", "estoy"],
    ["___ inclinado hacia adelante.",         "___ leaning forward.",                       "Estar", "estoy"],
    // estás
    ["___ de rodillas.",                      "___ on your knees.",                       "Estar", "estás"],
    ["___ agachado.",                         "___ crouching.",                           "Estar", "estás"],
    ["___ parado frente a la puerta.",        "___ standing in front of the door.",       "Estar", "estás"],
    ["___ sentado en el suelo.",              "___ sitting on the floor.",                "Estar", "estás"],
    ["___ recostado en la cama.",             "___ lying back on the bed.",               "Estar", "estás"],
    ["___ apoyado en la mesa.",               "___ leaning on the table.",                "Estar", "estás"],
    ["___ de pie junto a la ventana.",        "___ standing by the window.",              "Estar", "estás"],
    ["___ boca arriba.",                      "___ face up.",                             "Estar", "estás"],
    ["___ inclinado sobre el libro.",         "___ bent over the book.",                  "Estar", "estás"],
    ["___ tumbado en el sofá.",               "___ lying on the sofa.",                   "Estar", "estás"],
    // está
    ["El libro ___ abierto.",                    "The book ___ open.",                           "Estar", "está"],
    ["El perro ___ acostado.",                   "The dog ___ lying down.",                      "Estar", "está"],
    ["La puerta ___ cerrada.",                   "The door ___ closed.",                         "Estar", "está"],
    ["El gato ___ sentado en la ventana.",       "The cat ___ sitting in the window.",           "Estar", "está"],
    ["El niño ___ arrodillado.",                 "The child ___ kneeling.",                      "Estar", "está"],
    ["La botella ___ tumbada.",                  "The bottle ___ lying on its side.",            "Estar", "está"],
    ["El cuadro ___ colgado en la pared.",       "The painting ___ hung on the wall.",           "Estar", "está"],
    ["La silla ___ volcada.",                    "The chair ___ tipped over.",                   "Estar", "está"],
    ["El paraguas ___ apoyado en la pared.",     "The umbrella ___ leaning against the wall.",   "Estar", "está"],
    ["El bebé ___ boca abajo.",                  "The baby ___ face down.",                      "Estar", "está"],
    // estamos
    ["___ de pie en la fila.",          "___ standing in line.",                     "Estar", "estamos"],
    ["___ sentados en el suelo.",       "___ sitting on the floor.",                 "Estar", "estamos"],
    ["___ de rodillas en la iglesia.",  "___ on our knees in the church.",           "Estar", "estamos"],
    ["___ recostados en la hierba.",    "___ lying on the grass.",                   "Estar", "estamos"],
    ["___ agachados detrás del coche.", "___ crouching behind the car.",             "Estar", "estamos"],
    ["___ parados en la esquina.",      "___ standing on the corner.",               "Estar", "estamos"],
    ["___ apoyados en la barra.",       "___ leaning on the bar.",                   "Estar", "estamos"],
    ["___ tumbados en la playa.",       "___ lying on the beach.",                   "Estar", "estamos"],
    ["___ de pie frente al escenario.", "___ standing in front of the stage.",       "Estar", "estamos"],
    ["___ sentados alrededor de la mesa.","___ sitting around the table.",           "Estar", "estamos"],
    // están
    ["Los libros ___ apilados en la mesa.",      "The books ___ stacked on the table.",          "Estar", "están"],
    ["Los niños ___ sentados en el suelo.",      "The children ___ sitting on the floor.",       "Estar", "están"],
    ["Las sillas ___ colocadas en fila.",        "The chairs ___ placed in a row.",              "Estar", "están"],
    ["Los perros ___ acostados en el jardín.",  "The dogs ___ lying in the garden.",            "Estar", "están"],
    ["Las cajas ___ apiladas en el almacén.",   "The boxes ___ stacked in the warehouse.",      "Estar", "están"],
    ["Los soldados ___ de rodillas.",            "The soldiers ___ on their knees.",             "Estar", "están"],
    ["Las plantas ___ colgadas en el balcón.",  "The plants ___ hanging on the balcony.",       "Estar", "están"],
    ["Los alumnos ___ de pie.",                  "The pupils ___ standing.",                     "Estar", "están"],
    ["Los muebles ___ volcados.",                "The furniture ___ tipped over.",               "Estar", "están"],
    ["Las maletas ___ amontonadas en el pasillo.","The suitcases ___ piled up in the hallway.",  "Estar", "están"],
];

// L — Location (where someone or something physically is right now)
const estarLocation = [
    // estoy
    ["___ en la casa.",                       "___ at home.",                               "Estar", "estoy"],
    ["___ en el trabajo.",                    "___ at work.",                               "Estar", "estoy"],
    ["___ en el parque.",                     "___ in the park.",                           "Estar", "estoy"],
    ["___ en el supermercado.",               "___ at the supermarket.",                    "Estar", "estoy"],
    ["___ lejos de casa.",                    "___ far from home.",                         "Estar", "estoy"],
    ["___ cerca de la playa.",                "___ near the beach.",                        "Estar", "estoy"],
    ["___ en el coche.",                      "___ in the car.",                            "Estar", "estoy"],
    ["___ en el hospital.",                   "___ at the hospital.",                       "Estar", "estoy"],
    ["___ en la biblioteca.",                 "___ at the library.",                        "Estar", "estoy"],
    ["___ en el centro de la ciudad.",        "___ in the city centre.",                    "Estar", "estoy"],
    // estás
    ["¿Dónde ___ tú?",                           "Where ___ you?",                               "Estar", "estás"],
    ["___ muy lejos de aquí.",                "___ very far from here.",                  "Estar", "estás"],
    ["___ cerca del banco.",                  "___ near the bank.",                       "Estar", "estás"],
    ["___ en el aeropuerto.",                 "___ at the airport.",                      "Estar", "estás"],
    ["___ detrás de mí.",                     "___ behind me.",                           "Estar", "estás"],
    ["___ al lado del parque.",               "___ next to the park.",                    "Estar", "estás"],
    ["___ en el gimnasio.",                   "___ at the gym.",                          "Estar", "estás"],
    ["___ frente a la tienda.",               "___ in front of the shop.",                "Estar", "estás"],
    ["___ fuera de la ciudad.",               "___ outside the city.",                    "Estar", "estás"],
    ["___ en mi barrio.",                     "___ in my neighbourhood.",                 "Estar", "estás"],
    // está
    ["El banco ___ cerca.",                      "The bank ___ nearby.",                         "Estar", "está"],
    ["La escuela ___ lejos.",                    "The school ___ far away.",                     "Estar", "está"],
    ["¿Dónde ___ el baño?",                      "Where ___ the bathroom?",                      "Estar", "está"],
    ["El hospital ___ a dos kilómetros.",        "The hospital ___ two kilometres away.",         "Estar", "está"],
    ["La farmacia ___ en la esquina.",           "The pharmacy ___ on the corner.",              "Estar", "está"],
    ["El aeropuerto ___ fuera de la ciudad.",    "The airport ___ outside the city.",            "Estar", "está"],
    ["Mi casa ___ cerca del río.",               "My house ___ near the river.",                 "Estar", "está"],
    ["El parque ___ detrás del colegio.",        "The park ___ behind the school.",              "Estar", "está"],
    ["La oficina ___ en el tercer piso.",        "The office ___ on the third floor.",           "Estar", "está"],
    ["El restaurante ___ en el centro.",         "The restaurant ___ in the centre.",            "Estar", "está"],
    // estamos
    ["___ en el parque.",               "___ in the park.",                          "Estar", "estamos"],
    ["___ en la ciudad.",               "___ in the city.",                          "Estar", "estamos"],
    ["___ muy lejos del aeropuerto.",   "___ very far from the airport.",            "Estar", "estamos"],
    ["___ en el mismo edificio.",       "___ in the same building.",                 "Estar", "estamos"],
    ["___ cerca de la playa.",          "___ near the beach.",                       "Estar", "estamos"],
    ["___ en la sala de espera.",       "___ in the waiting room.",                  "Estar", "estamos"],
    ["___ en el centro comercial.",     "___ at the shopping centre.",               "Estar", "estamos"],
    ["___ a diez minutos de tu casa.",  "___ ten minutes from your house.",          "Estar", "estamos"],
    ["___ en el quinto piso.",          "___ on the fifth floor.",                   "Estar", "estamos"],
    ["___ fuera del país.",             "___ outside the country.",                  "Estar", "estamos"],
    // están
    ["Mis llaves ___ encima de la mesa.",        "My keys ___ on top of the table.",             "Estar", "están"],
    ["___ en el supermercado.",            "___ at the supermarket.",                 "Estar", "están"],
    ["Los estudiantes ___ en la biblioteca.",    "The students ___ at the library.",             "Estar", "están"],
    ["Mis amigos ___ en la playa.",              "My friends ___ at the beach.",                 "Estar", "están"],
    ["Los turistas ___ en la plaza principal.",  "The tourists ___ in the main square.",         "Estar", "están"],
    ["Mis padres ___ en casa.",                  "My parents ___ at home.",                      "Estar", "están"],
    ["Los coches ___ aparcados fuera.",          "The cars ___ parked outside.",                 "Estar", "están"],
    ["Las oficinas ___ en el segundo piso.",     "The offices ___ on the second floor.",         "Estar", "están"],
    ["Los niños ___ en el parque.",             "The children ___ in the park.",                "Estar", "están"],
    ["Los libros ___ en la estantería.",         "The books ___ on the shelf.",                  "Estar", "están"],
];

// A — Actions (progressive actions in progress with -ando / -iendo)
const estarActions = [
    // estoy
    ["___ comiendo.",                     "___ eating.",                            "Estar", "estoy"],
    ["___ leyendo un libro.",             "___ reading a book.",                    "Estar", "estoy"],
    ["___ escuchando música.",            "___ listening to music.",                "Estar", "estoy"],
    ["___ trabajando desde casa.",        "___ working from home.",                 "Estar", "estoy"],
    ["___ cocinando la cena.",            "___ cooking dinner.",                    "Estar", "estoy"],
    ["___ hablando con mi madre.",        "___ talking to my mother.",              "Estar", "estoy"],
    ["___ viendo una película.",          "___ watching a film.",                   "Estar", "estoy"],
    ["___ escribiendo un correo.",        "___ writing an email.",                  "Estar", "estoy"],
    ["___ limpiando la casa.",            "___ cleaning the house.",                "Estar", "estoy"],
    ["___ aprendiendo español.",          "___ learning Spanish.",                  "Estar", "estoy"],
    // estás
    ["___ durmiendo.",                    "___ sleeping.",                        "Estar", "estás"],
    ["___ mirando la televisión.",        "___ watching television.",             "Estar", "estás"],
    ["___ hablando por teléfono.",        "___ talking on the phone.",            "Estar", "estás"],
    ["___ comiendo muy rápido.",          "___ eating very fast.",                "Estar", "estás"],
    ["___ corriendo en el parque.",       "___ running in the park.",             "Estar", "estás"],
    ["___ estudiando para el examen.",    "___ studying for the exam.",           "Estar", "estás"],
    ["___ escuchando música muy alta.",   "___ listening to very loud music.",    "Estar", "estás"],
    ["___ usando el ordenador.",          "___ using the computer.",              "Estar", "estás"],
    ["___ haciendo ejercicio.",           "___ exercising.",                      "Estar", "estás"],
    ["___ cocinando algo rico.",          "___ cooking something tasty.",         "Estar", "estás"],
    // está — weather is impersonal; all other entries have explicit subjects
    ["___ lloviendo.",                       "It ___ raining.",                          "Estar", "está"],
    ["___ hablando.",                   "___ talking.",                         "Estar", "está"],
    ["El bebé ___ llorando.",                "The baby ___ crying.",                     "Estar", "está"],
    ["El sol ___ saliendo.",                 "The sun ___ rising.",                      "Estar", "está"],
    ["El perro ___ ladrando.",               "The dog ___ barking.",                     "Estar", "está"],
    ["___ trabajando en la oficina.",     "___ working in the office.",            "Estar", "está"],
    ["La niña ___ cantando.",                "The girl ___ singing.",                    "Estar", "está"],
    ["El chef ___ cocinando.",               "The chef ___ cooking.",                    "Estar", "está"],
    ["El agua ___ hirviendo.",               "The water ___ boiling.",                   "Estar", "está"],
    ["___ leyendo en el jardín.",       "___ reading in the garden.",           "Estar", "está"],
    // estamos
    ["___ estudiando.",             "___ studying.",                         "Estar", "estamos"],
    ["___ trabajando mucho.",       "___ working a lot.",                    "Estar", "estamos"],
    ["___ preparando la cena.",     "___ preparing dinner.",                 "Estar", "estamos"],
    ["___ aprendiendo cosas nuevas.","___ learning new things.",             "Estar", "estamos"],
    ["___ esperando el autobús.",   "___ waiting for the bus.",              "Estar", "estamos"],
    ["___ jugando a las cartas.",   "___ playing cards.",                    "Estar", "estamos"],
    ["___ viendo una película.",    "___ watching a film.",                  "Estar", "estamos"],
    ["___ hablando de política.",   "___ talking about politics.",           "Estar", "estamos"],
    ["___ planeando las vacaciones.","___ planning the holidays.",           "Estar", "estamos"],
    ["___ construyendo una casa.",  "___ building a house.",                 "Estar", "estamos"],
    // están
    ["___ corriendo.",                 "___ running.",                        "Estar", "están"],
    ["___ jugando fútbol.",            "___ playing soccer.",                 "Estar", "están"],
    ["Los niños ___ durmiendo.",             "The children ___ sleeping.",               "Estar", "están"],
    ["Los pájaros ___ cantando.",            "The birds ___ singing.",                   "Estar", "están"],
    ["Los estudiantes ___ estudiando.",      "The students ___ studying.",               "Estar", "están"],
    ["___ bailando en la fiesta.",     "___ dancing at the party.",           "Estar", "están"],
    ["Los mecánicos ___ reparando el coche.","The mechanics ___ fixing the car.",        "Estar", "están"],
    ["Las mujeres ___ hablando.",            "The women ___ talking.",                   "Estar", "están"],
    ["Los obreros ___ construyendo el edificio.","The workers ___ building the building.","Estar", "están"],
    ["Los perros ___ ladrando.",             "The dogs ___ barking.",                    "Estar", "están"],
];

// C — Conditions (temporary states or conditions that can change)
const estarConditions = [
    // estoy
    ["___ enfermo.",                      "___ sick.",                              "Estar", "estoy"],
    ["___ muy ocupado hoy.",              "___ very busy today.",                   "Estar", "estoy"],
    ["___ listo para salir.",             "___ ready to leave.",                    "Estar", "estoy"],
    ["___ muy cansado.",                  "___ very tired.",                        "Estar", "estoy"],
    ["___ mojado por la lluvia.",         "___ wet from the rain.",                 "Estar", "estoy"],
    ["___ harto de esperar.",             "___ fed up with waiting.",               "Estar", "estoy"],
    ["___ lleno después de comer.",       "___ full after eating.",                 "Estar", "estoy"],
    ["___ agotado.",                      "___ exhausted.",                         "Estar", "estoy"],
    ["___ muy estresado.",                "___ very stressed.",                     "Estar", "estoy"],
    ["___ un poco mareado.",              "___ a little dizzy.",                    "Estar", "estoy"],
    // estás
    ["___ cansado.",                      "___ tired.",                           "Estar", "estás"],
    ["___ mojado por la lluvia.",         "___ wet from the rain.",               "Estar", "estás"],
    ["___ muy pálido.",                   "___ very pale.",                       "Estar", "estás"],
    ["___ enfermo.",                      "___ sick.",                            "Estar", "estás"],
    ["___ muy ocupado.",                  "___ very busy.",                       "Estar", "estás"],
    ["___ listo para empezar.",           "___ ready to start.",                  "Estar", "estás"],
    ["___ con fiebre.",                   "___ running a fever.",                 "Estar", "estás"],
    ["___ muy delgado últimamente.",      "___ very thin lately.",                "Estar", "estás"],
    ["___ agotado después del partido.",  "___ exhausted after the match.",       "Estar", "estás"],
    ["___ muy nervioso.",                 "___ very nervous.",                    "Estar", "estás"],
    // está
    ["El agua ___ fría.",                    "The water ___ cold.",                      "Estar", "está"],
    ["La sopa ___ caliente.",                "The soup ___ hot.",                        "Estar", "está"],
    ["El coche ___ roto.",                   "The car ___ broken.",                      "Estar", "está"],
    ["La fruta ___ madura.",                 "The fruit ___ ripe.",                      "Estar", "está"],
    ["El café ___ listo.",                   "The coffee ___ ready.",                    "Estar", "está"],
    ["La leche ___ agria.",                  "The milk ___ sour.",                       "Estar", "está"],
    ["El teléfono ___ apagado.",             "The phone ___ switched off.",              "Estar", "está"],
    ["La comida ___ fría.",                  "The food ___ cold.",                       "Estar", "está"],
    ["El ordenador ___ estropeado.",         "The computer ___ broken.",                 "Estar", "está"],
    ["La habitación ___ sucia.",             "The room ___ dirty.",                      "Estar", "está"],
    // estamos
    ["___ listos para empezar.",    "___ ready to start.",                   "Estar", "estamos"],
    ["___ muy ocupados esta semana.","___ very busy this week.",             "Estar", "estamos"],
    ["___ enfermos.",               "___ sick.",                             "Estar", "estamos"],
    ["___ muy cansados.",           "___ very tired.",                       "Estar", "estamos"],
    ["___ agotados después del viaje.","___ exhausted after the trip.",     "Estar", "estamos"],
    ["___ mojados por la lluvia.",  "___ wet from the rain.",                "Estar", "estamos"],
    ["___ preparados para el examen.","___ prepared for the exam.",         "Estar", "estamos"],
    ["___ hartos del mal tiempo.",  "___ fed up with the bad weather.",      "Estar", "estamos"],
    ["___ llenos después de la cena.","___ full after dinner.",              "Estar", "estamos"],
    ["___ muy estresados con el trabajo.","___ very stressed with work.",   "Estar", "estamos"],
    // están
    ["Las ventanas ___ rotas.",              "The windows ___ broken.",                  "Estar", "están"],
    ["Las flores ___ marchitas.",            "The flowers ___ wilted.",                  "Estar", "están"],
    ["Los precios ___ muy altos.",           "The prices ___ very high.",                "Estar", "están"],
    ["Los niños ___ enfermos.",              "The children ___ sick.",                   "Estar", "están"],
    ["Los coches ___ averiados.",            "The cars ___ broken down.",                "Estar", "están"],
    ["Las manzanas ___ maduras.",            "The apples ___ ripe.",                     "Estar", "están"],
    ["Los ordenadores ___ apagados.",        "The computers ___ switched off.",          "Estar", "están"],
    ["Las tuberías ___ rotas.",              "The pipes ___ broken.",                    "Estar", "están"],
    ["Los alumnos ___ muy cansados.",        "The pupils ___ very tired.",               "Estar", "están"],
    ["Las tiendas ___ cerradas.",            "The shops ___ closed.",                    "Estar", "están"],
];

// E — Emotions (how someone feels at a given moment)
const estarEmotions = [
    // estoy
    ["___ muy feliz hoy.",                     "___ very happy today.",                      "Estar", "estoy"],
    ["___ aburrido.",                          "___ bored.",                                 "Estar", "estoy"],
    ["___ muy emocionado.",                    "___ very excited.",                          "Estar", "estoy"],
    ["___ triste.",                            "___ sad.",                                   "Estar", "estoy"],
    ["___ muy nervioso.",                      "___ very nervous.",                          "Estar", "estoy"],
    ["___ asustado.",                          "___ scared.",                                "Estar", "estoy"],
    ["___ enojado.",                           "___ angry.",                                 "Estar", "estoy"],
    ["___ muy orgulloso de ti.",               "___ very proud of you.",                     "Estar", "estoy"],
    ["___ confundido.",                        "___ confused.",                              "Estar", "estoy"],
    ["___ sorprendido.",                       "___ surprised.",                             "Estar", "estoy"],
    // estás
    ["___ enojado.",                           "___ angry.",                               "Estar", "estás"],
    ["___ muy triste hoy.",                    "___ very sad today.",                      "Estar", "estás"],
    ["___ nervioso por el examen.",            "___ nervous about the exam.",              "Estar", "estás"],
    ["___ muy emocionado.",                    "___ very excited.",                        "Estar", "estás"],
    ["___ asustado.",                          "___ scared.",                              "Estar", "estás"],
    ["___ confundido.",                        "___ confused.",                            "Estar", "estás"],
    ["___ muy aburrido.",                      "___ very bored.",                          "Estar", "estás"],
    ["___ orgulloso de tu trabajo.",           "___ proud of your work.",                  "Estar", "estás"],
    ["___ agotado emocionalmente.",            "___ emotionally exhausted.",               "Estar", "estás"],
    ["___ muy feliz hoy.",                     "___ very happy today.",                    "Estar", "estás"],
    // está
    ["___ triste.",                          "___ sad.",                                 "Estar", "está"],
    ["___ preocupado.",                        "___ worried.",                              "Estar", "está"],
    ["___ enamorada.",                       "___ in love.",                             "Estar", "está"],
    ["___ muy enojado.",                       "___ very angry.",                           "Estar", "está"],
    ["___ muy feliz.",                       "___ very happy.",                          "Estar", "está"],
    ["El niño ___ asustado.",                     "The child ___ scared.",                        "Estar", "está"],
    ["___ muy orgulloso.",                     "___ very proud.",                           "Estar", "está"],
    ["___ aburrida.",                        "___ bored.",                               "Estar", "está"],
    ["___ sorprendido.",                       "___ surprised.",                            "Estar", "está"],
    ["La niña ___ muy emocionada.",               "The girl ___ very excited.",                   "Estar", "está"],
    // estamos
    ["___ emocionados.",                 "___ excited.",                              "Estar", "estamos"],
    ["___ muy contentos con los resultados.","___ very happy with the results.",     "Estar", "estamos"],
    ["___ nerviosos por la presentación.","___ nervous about the presentation.",     "Estar", "estamos"],
    ["___ muy felices juntos.",          "___ very happy together.",                  "Estar", "estamos"],
    ["___ tristes por la noticia.",      "___ sad about the news.",                   "Estar", "estamos"],
    ["___ asustados por la tormenta.",   "___ scared by the storm.",                  "Estar", "estamos"],
    ["___ muy orgullosos de nuestro equipo.","___ very proud of our team.",          "Estar", "estamos"],
    ["___ confundidos con las instrucciones.","___ confused by the instructions.",   "Estar", "estamos"],
    ["___ sorprendidos por el resultado.","___ surprised by the result.",            "Estar", "estamos"],
    ["___ hartos de las mentiras.",      "___ fed up with the lies.",                 "Estar", "estamos"],
    // están
    ["___ asustados.",                      "___ scared.",                             "Estar", "están"],
    ["Los niños ___ muy felices.",                "The children ___ very happy.",                 "Estar", "están"],
    ["___ muy emocionados.",                "___ very excited.",                       "Estar", "están"],
    ["Mis amigos ___ tristes.",                   "My friends ___ sad.",                          "Estar", "están"],
    ["Los estudiantes ___ muy nerviosos.",        "The students ___ very nervous.",               "Estar", "están"],
    ["___ muy enojadas.",                   "___ very angry.",                         "Estar", "están"],
    ["Los padres ___ preocupados.",               "The parents ___ worried.",                     "Estar", "están"],
    ["Los fans ___ muy emocionados.",             "The fans ___ very excited.",                   "Estar", "están"],
    ["___ muy orgullosos.",                 "___ very proud.",                         "Estar", "están"],
    ["Los invitados ___ aburridos.",              "The guests ___ bored.",                        "Estar", "están"],
];


// ─── Prompt normalization for unambiguous conjugation ───────────────────────

const SE_SUBJECT_PREFIX_BY_CONJ = {
    soy: 'Yo',
    eres: 'Tu',
    es: 'El',
    somos: 'Nosotros',
    son: 'Ellos',
    estoy: 'Yo',
    'estas': 'Tu',
    'esta': 'El',
    estamos: 'Nosotros',
    'estan': 'Ellos'
};

const SE_EN_SUBJECT_PREFIX_BY_CONJ = {
    soy: 'I',
    eres: 'You',
    es: 'He',
    somos: 'We',
    son: 'They',
    estoy: 'I',
    'estas': 'You',
    'esta': 'He',
    estamos: 'We',
    'estan': 'They'
};

function seNormalizeConjugationKey(conj) {
    return (conj || '')
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function seIsUniqueImpersonalTime(spanishPrompt) {
    const normalized = spanishPrompt
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    if (/^___\s+la\s+una\b/.test(normalized)) return true;
    if (/^___\s+las\s+\w+/.test(normalized)) return true;
    return false;
}

function seHasExplicitSubjectAroundBlank(spanishPrompt) {
    // If the blank is not leading, the phrase generally already contains overt subject context.
    return !/^___\b/.test(spanishPrompt.trim());
}

function seNormalizePromptTuple(entry) {
    if (!Array.isArray(entry) || entry.length < 4) return entry;

    const spanish = typeof entry[0] === 'string' ? entry[0].trim() : '';
    const english = typeof entry[1] === 'string' ? entry[1].trim() : '';
    const conjKey = seNormalizeConjugationKey(entry[3]);

    if (!spanish || !english) return entry;
    if (seHasExplicitSubjectAroundBlank(spanish)) return entry;
    if (seIsUniqueImpersonalTime(spanish)) return entry;

    const esSubject = SE_SUBJECT_PREFIX_BY_CONJ[conjKey];
    const enSubject = SE_EN_SUBJECT_PREFIX_BY_CONJ[conjKey];
    if (!esSubject || !enSubject) return entry;

    const rewrittenSpanish = `${esSubject} ${spanish}`;
    const rewrittenEnglish = `${enSubject} ${english}`;
    return [rewrittenSpanish, rewrittenEnglish, entry[2], entry[3]];
}

function seNormalizePhraseSet(list) {
    return Array.isArray(list) ? list.map(seNormalizePromptTuple) : [];
}

const serDescriptionsNormalized = seNormalizePhraseSet(serDescriptions);
const serOccupationsNormalized = seNormalizePhraseSet(serOccupations);
const serCharacteristicsNormalized = seNormalizePhraseSet(serCharacteristics);
const serTimeNormalized = seNormalizePhraseSet(serTime);
const serOriginNormalized = seNormalizePhraseSet(serOrigin);
const serRelationshipsNormalized = seNormalizePhraseSet(serRelationships);
const estarPositionNormalized = seNormalizePhraseSet(estarPosition);
const estarLocationNormalized = seNormalizePhraseSet(estarLocation);
const estarActionsNormalized = seNormalizePhraseSet(estarActions);
const estarConditionsNormalized = seNormalizePhraseSet(estarConditions);
const estarEmotionsNormalized = seNormalizePhraseSet(estarEmotions);

// ─── Exports ──────────────────────────────────────────────────────────────────

const serEstarPhrases = {
    DOCTOR: {
        D_Descriptions:    serDescriptionsNormalized,
        O_Occupations:     serOccupationsNormalized,
        C_Characteristics: serCharacteristicsNormalized,
        T_Time:            serTimeNormalized,
        O_Origin:          serOriginNormalized,
        R_Relationships:   serRelationshipsNormalized,
    },
    PLACE: {
        P_Position:   estarPositionNormalized,
        L_Location:   estarLocationNormalized,
        A_Actions:    estarActionsNormalized,
        C_Conditions: estarConditionsNormalized,
        E_Emotions:   estarEmotionsNormalized,
    },
};

// Flat array of all phrases — useful for randomised quiz draws
const allSerEstarPhrases = [
    ...serDescriptionsNormalized,
    ...serOccupationsNormalized,
    ...serCharacteristicsNormalized,
    ...serTimeNormalized,
    ...serOriginNormalized,
    ...serRelationshipsNormalized,
    ...estarPositionNormalized,
    ...estarLocationNormalized,
    ...estarActionsNormalized,
    ...estarConditionsNormalized,
    ...estarEmotionsNormalized,
];

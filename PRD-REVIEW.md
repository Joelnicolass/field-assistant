# Revisión en frío de PRD.md

Revisión hecha solo con `CHALLENGE.md`, `PRD.md` y `CLAUDE.md`. No se modificó ningún otro archivo.

## Veredicto

El PRD es sólido en estructura, en la lista de requisitos y en las jornadas, y cubre casi toda la consigna. Pero tiene tres problemas que pueden hacer fallar la prueba real: lee la semilla de datos de una forma que hace imposible la frase de las 40 vaquillonas, no tiene ningún requisito para publicar y mantener el server del que depende el APK, y su indicador de micrófono contradice la consigna cuando están activas las manos libres. Además hay una docena de ambigüedades e inconsistencias internas (confirmación de audios guardados, números "del modelo", corrección de lo último, tiempos sin valor, cronograma sin horas) que conviene arreglar antes de extraer features.

**Tipo de producto clasificado:** app móvil Android con un server mínimo sin estado (servicio/API como pieza secundaria).
**Controles omitidos (visible y auditable):** login y cuentas, base de datos, modelo de negocio, internacionalización, iOS, tablets, analítica y cumplimiento regulatorio; todo coincide con la consigna ("No construyas") o no aplica. Controles que sí apliqué y que el PRD cubre solo en parte: permisos del sistema, comportamiento sin red, rendimiento y batería en gama media, seguridad del server público, accesibilidad visual (contraste y tamaños), distribución del APK.

## Paso 0: anclaje en la realidad

- No hay implementación, prototipo ni fuente "extraída de" que contrastar: la carpeta solo tiene `CHALLENGE.md`, `PRD.md` y `CLAUDE.md`. No hay discrepancias de comportamiento que reportar.
- `RNF-10` y `CLAUDE.md` citan `RULES.md`, que todavía no existe.
- Afirmaciones técnicas que **no pude verificar** (el PRD las da por buenas):
  - Costo de 1 dólar o menos cada mil pedidos (RNF-07), y que incluya o no la voz de servicio.
  - Latencia de 5 s (M5, RNF-02), 3 s de objetivo, y 100 ms de respuesta al toque.
  - APK de 100 MB o menos (RNF-09).
  - Que un detector de frase dentro del teléfono funcione con ruido de fondo y gama media (RF-26).
  - Que el micrófono se pueda mantener abierto para manos libres en Android 11+ con la app en segundo plano o con pantalla apagada (el PRD no dice si es solo en primer plano).
  - Que el brillo máximo pueda subirse desde la app sin permisos especiales (RF-29).
  - Hechos confirmados: Android 11 es API 30 (RNF-01 es coherente); 4,5 a 1 es el umbral AA de contraste para texto normal; el server debe ir con https porque Android bloquea HTTP sin cifrar por defecto en versiones recientes (S2).

## Hallazgos

### Crítico

#### C-1 · S1 y RF-22 contradicen la consigna y hacen fallar una de las cuatro frases de M1

- **Qué dice el PRD:** S1: "'~450 cabezas por categoría y lote' se lee como unas 450 cabezas en total, repartidas entre las categorías y los lotes." RF-22: "unas 450 cabezas en cinco categorías". RF-09 usa el ejemplo "En el lote 3 hay 12 novillos, no 500". M1: "Las cuatro frases de la consigna dan el resultado correcto".
- **Problema:** la consigna dice "~450 cabezas por categoría y lote" y usa "Pasé 40 vaquillonas del lote 3 al 5". Leído literal son 8 lotes × 5 categorías × ~450 = ~18.000 cabezas. Con la lectura del PRD, 450 repartidas en 40 celdas dan ~11 por celda, y la regla de RF-09 ("los animales alcanzan") rechazaría el movimiento de 40 vaquillonas del lote 3, que es la frase central de la consigna. Además "Acaba de pasar 40 vaquillonas de lote" supone lotes con decenas de animales por categoría. La consigna manda sobre el PRD. Aun la lectura intermedia (450 por categoría en total, ~56 por celda) deja la frase posible; la lectura de S1 no. Y la tabla de "Controles que no aplican" afirma no contradecir la consigna.
- **Cambio propuesto (reemplazar S1 y RF-22):**
  > **S1.** La consigna dice "~450 cabezas por categoría y lote". Se toma como unas 450 cabezas **por categoría** repartidas entre los 8 lotes (unas 2.250 en total, 50 a 60 por categoría y lote). Es la lectura más chica que deja posible "Pasé 40 vaquillonas del lote 3 al 5". Se anota en DECISIONS.md. Hay que confirmarla con quien evalúa si hay forma.
  >
  > **RF-22.** Datos iniciales: establecimiento "La Tranquera" (cría, Castelli, Buenos Aires), 8 lotes, unas 450 cabezas por categoría (vacas, vaquillonas, terneros, novillos y toros) repartidas entre los lotes, y lluvias de los últimos 60 días. La semilla garantiza que el lote 3 tiene al menos 40 vaquillonas y que las cuatro frases de la consigna se pueden ejecutar en orden.

#### C-2 · No existe ningún requisito para publicar y mantener el server, y M1 depende de él

- **Qué dice el PRD:** S2: "Se publica con https para que el APK funcione en el teléfono de quien evalúa." Q1: "¿Dónde se publica el server?", para "Antes de la etapa 5". RF-32 pide "cómo levantar el server". M1 exige las cuatro frases "desde el APK instalado" en un teléfono real.
- **Problema:** el APK entendido-por-modelo (S3) solo funciona si el server está en línea cuando quien evalúa lo prueba, días o semanas después de la entrega. Ningún RF ni RNF pide publicarlo, dejarlo arriba durante la evaluación, ni configurar la URL del server en el APK. S2 lo da por hecho pero está sin responsable, y Q1 sigue abierta hasta la última etapa. La cola (RF-17) salva la app, pero no las cuatro frases: si el server está caído, M1 falla. Tampoco hay requisito de qué ve quien evalúa si el server no responde.
- **Cambio propuesto (agregar a 5.9 y ajustar Q1):**
  > **RF-35 · Must.** El server queda publicado con https en una URL pública, arriba durante todo el período de evaluación (hasta la fecha que indique la entrega). La URL del server está en un ajuste del APK, no en el código de las pantallas, y el README dice cómo cambiarla para correr el server local.
  >
  > **RF-36 · Must.** Antes de entregar, las cuatro frases de la consigna se prueban desde el APK de release instalado en un teléfono físico contra el server publicado, y el resultado se anota en DECISIONS.md.
  >
  > **Q1** (cambiar el plazo): "¿Dónde se publica el server? **Antes de la etapa 3**, porque la prueba en teléfono físico necesita una URL pública, no solo el server local."

#### C-3 · RF-02 contradice "El estado del micrófono siempre es obvio" cuando hay manos libres

- **Qué dice el PRD:** RF-02: "Son cuatro: en reposo, escuchando, pensando y hablando." RF-26: con manos libres "mientras espera, nada se graba ni se envía". RNF-08: "El micrófono está abierto solo durante un turno o con manos libres encendido."
- **Problema:** con manos libres encendido, el micrófono está abierto para el detector mientras el orbe dice "en reposo". El usuario no puede distinguir "no me oye" de "me escucha esperando la frase". La consigna exige que el estado sea obvio, siempre. Además hay estados reales que no están entre los cuatro: sin permiso de micrófono (RF-16), esperando confirmación con cuenta de 4 s (RF-08), esperando una respuesta a un dato que falta (RF-19) y con audio guardado sin red (RF-17).
- **Cambio propuesto (reemplazar RF-02):**
  > **RF-02 · Must.** El estado del micrófono se ve siempre, con color, movimiento, ícono y texto propios (nunca solo por color). Hay cinco estados: **en reposo** (micrófono cerrado), **esperando la frase** (manos libres encendido; micrófono abierto solo para el detector local; claramente distinto de reposo y con un ícono de oreja o micrófono activo), **escuchando** (grabando para enviar), **pensando** y **hablando**. Los demás casos (sin permiso, esperando confirmación, pregunta de un dato faltante, sin señal) se muestran con una tarjeta y no cambian el estado del orbe, salvo que vuelvan a escuchar, y en ese caso el orbe pasa a "escuchando".

### Importante

#### I-1 · M4 y RF-13 afirman algo falso para la tarjeta de propuesta

- **Qué dice el PRD:** M4: "Ningún número de una tarjeta o de una respuesta sale del modelo de lenguaje". RF-13: "Los números de la tarjeta y de la respuesta salen de los datos guardados, nunca del modelo". Pero RF-08 y J1 muestran la tarjeta "Voy a anotar: 18 mm, lluvia de ayer" antes de anotar.
- **Problema:** los 18 mm, las 40 vaquillonas o los "quince terneros" los extrae el modelo del audio. Son lo único que la persona puede verificar con los ojos, y es donde el modelo puede equivocarse en ruido ("quince" por "cincuenta"). La meta quedó mal formulada y no se puede comprobar tal cual.
- **Cambio propuesto (reemplazar M4 y RF-13):**
  > **M4.** Los números de totales, saldos y resultados salen siempre de los datos guardados. Los números de una propuesta son lo que el modelo entendió del audio: se muestran grandes antes de anotar y la persona puede cancelar.
  >
  > **RF-13 · Must.** Los totales, los saldos y los detalles de las respuestas y de los comprobantes se calculan con los datos guardados, nunca con lo que devuelve el modelo. De la propuesta, el modelo solo aporta los datos del pedido (cantidad, categoría, lotes, milímetros, fecha); la app los valida (RF-09) antes de mostrarlos.

#### I-2 · RF-04 promete "corregir lo último" como entendido, pero RF-10 es Should y está en la lista de recortes

- **Qué dice el PRD:** RF-04 (Must): "Pedidos posibles: ... y corregir lo último anotado." RF-10 (Should): "Corregir lo último anotado". La lista de recortes incluye RF-10.
- **Problema:** si se recorta RF-10, RF-04 sigue diciendo que la app entiende ese pedido y no hay comportamiento definido (¿"no entendido"?, ¿un cambio silencioso?). La Must declara algo que la Should entrega.
- **Cambio propuesto:**
  > **RF-04 · Must.** ... Pedidos posibles: registrar lluvia, mover animales, consultar lluvia y consultar un lote. Si RF-10 está entregado, también corregir lo último anotado. Lo demás es "no entendido" (RF-18).
  >
  > **RF-10 · Should.** Corregir lo último anotado: "No, eran veinte". Muestra la propuesta corregida con la misma cuenta de 4 segundos (RF-08), y el registro corregido reemplaza al anterior, no se suma. Solo corrige la última escritura. Si no hay ninguna, lo dice.

#### I-3 · RF-17 (audios guardados) choca con RF-08 y deja sin definir cuándo y con qué fecha se procesan

- **Qué dice el PRD:** RF-08: toda escritura espera 4 s y se anota sola. RF-17: "Al volver la señal muestra lo que entendió, para confirmar o descartar." J4: botones "Anotar" y "Descartar", sin cuenta.
- **Problema:** (a) ¿Un audio guardado horas antes se anota solo a los 4 s cuando vuelve la señal? J4 dice que no, pero RF-08 dice "antes de anotar... espera 4 segundos" sin excepción. (b) "Ayer" dicho el lunes y procesado el martes debe ser el domingo, no el lunes. El PRD no define la fecha de referencia. (c) Entre la grabación y la confirmación el stock puede haber cambiado, así que hay que volver a validar. (d) No dice cuándo se reintenta (¿al abrir la app?, ¿con la red de vuelta en primer plano?), ni qué pasa con varios audios, ni con consultas guardadas (una lectura guardada, ¿se contesta?).
- **Cambio propuesto (reemplazar RF-17):**
  > **RF-17 · Must.** Sin red o con el server sin responder en 10 segundos: el audio se guarda en el teléfono junto con la fecha y hora en que se grabó, y la app lo dice en voz alta y por texto. Los audios guardados siguen ahí al cerrar la app y se muestran como "N guardados". Se reenvían, de a uno y en orden, al abrir la app o cuando vuelve la red con la app abierta. Cada uno se interpreta con su fecha de grabación ("ayer" es el día anterior a esa fecha) y se vuelve a validar con los datos actuales. Lo que se entendió se muestra en una tarjeta con los botones "Anotar" y "Descartar", **sin cuenta regresiva y sin anotar nunca solo**. Una consulta guardada se contesta al reenviarse. Máximo 20 guardados; al llegar al tope, la app avisa y no graba más.
  >
  > **RF-08** (agregar al final): "La cuenta de 4 segundos no se aplica a los audios guardados sin señal (RF-17)."

#### I-4 · "Cola de audios sin señal" figura como extra, pero es un requisito Must

- **Qué dice el PRD:** sección 3, "Extras elegidos: ... cola de audios sin señal". RF-17 y RNF-04 (Must) la requieren, y RNF-11 la usa como mecanismo de robustez.
- **Problema:** un extra se puede recortar; este no. La sección 9 no la lista en el orden de recortes, así que la lectura correcta es Must, pero el alcance dice lo contrario y un lector puede dejarla afuera.
- **Cambio propuesto:** en la sección 3, quitar "cola de audios sin señal" de los extras y agregarla a la lista de lo incluido: "Las cuatro salidas de 'que nunca se trabe': micrófono denegado, sin red (con cola de audios guardados), no entendió y faltan datos."

#### I-5 · "Este mes", "esta semana", "hoy", "anoche" y la semilla de 60 días no están definidos

- **Qué dice el PRD:** RF-06 ("hoy", "ayer", "anoche" y una fecha), RF-11 ("hoy, ayer, esta semana, este mes"), RF-22 ("las lluvias de los últimos 60 días"), J1 ("Van 56 milímetros en el mes").
- **Problema:** "este mes" puede ser el mes calendario o los últimos 30 días; el día 2 del mes dan resultados muy distintos y la frase de la consigna "¿Cuánto llovió este mes?" es una de las cuatro de M1. "Esta semana" no dice si empieza el lunes o el domingo. No hay zona horaria. Si las lluvias de la semilla tienen fechas fijas, a los pocos días de entregar dejan de ser "los últimos 60 días" y el mes puede quedar vacío. "Anoche" puede caer en el día de ayer o de hoy según la hora. No se dice qué pasa con una fecha futura o de más de 60 días.
- **Cambio propuesto (agregar al final de 5.2 o como RF-37):**
  > **RF-37 · Must.** Fechas y períodos: la app usa la zona horaria America/Argentina/Buenos_Aires. "Este mes" es el mes calendario en curso, hasta hoy. "Esta semana" empieza el lunes. "Anoche" se anota con la fecha de ayer si son las 6 h o más, y con la fecha de hoy si son antes de las 6 h. No se anotan lluvias con fecha futura. Las lluvias de la semilla se generan al primer arranque con fechas relativas a ese día, de modo que siempre cubren los 60 días anteriores y el mes en curso tiene lluvias a partir del tercer día del mes.

  (Las horas de corte son una propuesta; cámbielas el autor si prefiere otras, pero tienen que estar escritas.)

#### I-6 · Los tiempos de escucha y de espera no tienen valor, y la latencia está mal definida

- **Qué dice el PRD:** RF-01 ("Se corta sola cuando la persona deja de hablar"), RF-17 ("con el server lento"), RF-20 ("Nadie habló: la escucha se cancela sola"), RNF-02 y M5 ("del final de la frase a la tarjeta pasan 5 segundos como máximo"), Q5 ("¿Cuánto tarda de verdad un turno...?").
- **Problema:** "deja de hablar", "lento" y "nadie habló" no se pueden comprobar sin números. Con ruido de fondo (que la consigna menciona) un corte por silencio puede no dispararse nunca, así que hace falta un tope de grabación. "Final de la frase" no dice si es cuando la persona calla o cuando la app lo detecta (el corte por silencio ya consume 1 a 2 s del presupuesto de 5 s). Q5 se resuelve en el research de la etapa 1, pero M5 y RNF-02 ya fijaron 5 s y 3 s sin medir.
- **Cambio propuesto:**
  > **RF-01** (reemplazar la segunda oración): "Se corta sola tras 1,5 segundos de silencio, o a los 15 segundos de grabación como máximo, y también tocando de nuevo."
  > **RF-20 · Must.** Nadie habló: si no se detecta voz en los primeros 6 segundos, la escucha se cancela sola, la app lo dice y vuelve a reposo.
  > **RNF-02** (reemplazar la segunda oración): "Con buena señal, desde que la app detecta el fin de la frase hasta que aparece la tarjeta pasan 5 segundos como máximo; el objetivo es 3. Se mide en el teléfono físico y se anota en DECISIONS.md. Si el research de la etapa 1 (Q5) muestra que 5 segundos no se alcanza, se cambia el número aquí y en M5 antes de la etapa 3."
  > **M5** (reemplazar): "Con buena señal, desde el fin de la frase hasta la tarjeta pasa lo que dice RNF-02."

  Los valores (1,5 s, 15 s, 6 s, 10 s) son propuestas para validar con voz real.

#### I-7 · El ciclo de "faltan datos" no tiene salida si la persona no contesta o contesta otra cosa

- **Qué dice el PRD:** RF-19: "la app pregunta lo que falta ... y vuelve a escuchar sola. La respuesta completa el pedido anterior." RF-20: "Nadie habló: la escucha se cancela sola."
- **Problema:** no dice qué pasa con el pedido pendiente si la persona no contesta (RF-20 cancela la escucha, ¿y el pedido?), si contesta otra cosa ("mejor lluvia de 5 mm"), si la respuesta sigue incompleta ("del dos"), ni cuántas veces pregunta. Es el camino con más riesgo de quedar en un bucle, y M2 exige salida visible.
- **Cambio propuesto (reemplazar RF-19):**
  > **RF-19 · Must.** Faltan datos: la app pregunta lo que falta ("¿De qué lote a qué lote?"), muestra la tarjeta del pedido incompleto con los datos que ya tiene y un botón "Cancelar", y vuelve a escuchar sola. La respuesta completa el pedido anterior. Si la respuesta es un pedido nuevo y completo, reemplaza al pendiente. Si sigue incompleta, vuelve a preguntar una sola vez más; a la segunda, descarta el pedido, lo dice y muestra tres frases de ejemplo. Si nadie contesta (RF-20), el pedido pendiente se descarta y la app lo dice.

#### I-8 · Los errores fuera de 5.5 no tienen salida, y RNF-11 confunde "no entendió" con "falló el server"

- **Qué dice el PRD:** M2 ("cada uno de los errores de la sección 5.5"), RF-21 ("Ningún estado deja la pantalla sin salida"), RNF-11 ("un pedido sin entender va a la cola (RF-17)").
- **Problema:** RF-21 es una regla general vaga, no un error. Faltan casos reales de "nunca se trabe": el server responde con error (5xx), el modelo devuelve algo inválido o fuera de esquema, el audio sale vacío o demasiado corto, el almacenamiento falla o se corrompe, la voz falla a mitad de frase, el permiso de micrófono se revoca con la app abierta, el micrófono está ocupado (llamada entrante) y la app pasa a segundo plano durante la cuenta de 4 s. Además RNF-11 llama "sin entender" a lo que RF-18 llama "no entendió": son cosas distintas (falla del proveedor vs el modelo dijo "no sé"). Tampoco hay forma de cancelar mientras el orbe está en "pensando".
- **Cambio propuesto:**
  > **RF-21 · Must.** Ningún estado deja la pantalla sin salida: siempre hay al menos un botón visible para seguir o volver. En "pensando" hay un botón "Cancelar". Casos que se resuelven así: error del server o respuesta inválida del modelo (se trata como falla del proveedor: audio a la cola, RF-17); audio vacío (como RF-20); falla al guardar en el teléfono (mensaje y no se pierde la tarjeta); permiso revocado con la app abierta (como RF-16); micrófono ocupado (mensaje y reintento); la app pasa a segundo plano durante la cuenta de 4 s (la propuesta **no** se anota: queda como tarjeta de "Anotar" o "Descartar" al volver).
  > **RNF-11** (reemplazar): "Si falla un proveedor, la app no se rompe: un audio que no se pudo enviar o interpretar por una falla técnica va a la cola (RF-17), y la voz cae en la del teléfono (RF-24). 'No entendió' (RF-18) es solo cuando el modelo respondió que no es un pedido válido."
  > **M2** (reemplazar): "Cada error de la sección 5.5 y cada caso de RF-21 termina en una pantalla con una salida visible."

#### I-9 · El server es público, sin login, y nada lo protege; RNF-07 no incluye la voz

- **Qué dice el PRD:** S2 (publicado con https), RNF-05 ("Ninguna clave de un proveedor viaja en el APK. Están en el server."), RNF-07 ("Entender mil pedidos cuesta 1 dólar o menos").
- **Problema:** como no hay login, cualquiera que conozca la URL puede mandar audios y gastar las claves del autor. RNF-05 protege la clave contra extracción, pero no contra uso. No hay límite de tamaño de audio ni tasa de pedidos ni tope de gasto en los proveedores. RNF-07 solo mide "entender", mientras que cada turno también habla con la voz de servicio (RF-24), que suele costar más. Por último, la consigna evalúa "qué pasa si esto va de un productor a miles": un server sin protección ni tasa limitada es la primera respuesta que se espera.
- **Cambio propuesto (agregar a la sección 6):**
  > **RNF-12 · Seguridad del server.** El server rechaza audios de más de 20 segundos o 1 MB, limita los pedidos por dirección IP y por minuto, exige una clave compartida en un encabezado (se sabe que se puede extraer del APK: no es autenticación, solo frena el uso casual), y cada proveedor tiene un tope de gasto mensual configurado en su panel. No guarda audio ni datos (RNF-06).
  > **RNF-07** (reemplazar): "Un turno completo (entender y hablar con la voz de servicio) cuesta 1 dólar o menos cada mil, con los precios de los proveedores verificados y anotados con fecha en DECISIONS.md."

#### I-10 · El cronograma no tiene horas, el orden de recorte contradice la prioridad real y falta el server en las etapas

- **Qué dice el PRD:** sección 9: "La ventana es de 4 horas ... cinco etapas ... Cada una deja la app funcionando." La etapa 2 es "sin pantalla". El orden de recorte termina con RF-30 y RF-26. Q1: "Antes de la etapa 5".
- **Problema:**
  - No hay presupuesto de tiempo por etapa. Hay mucho alcance extra (manos libres con detector local, orbe animado, entrada del logo, sensor de luz, brillo, splash) dentro de 4 h, con 25 Must y 8 Should.
  - "Cada una deja la app funcionando" es falso para la etapa 2 (sin pantalla) y la etapa 1 (solo proyecto armado).
  - El server no aparece en ninguna etapa; la etapa 3 lo necesita para "entender".
  - La prueba de 20 frases y la de "otra persona compila desde cero" (sección 8) no están en ninguna etapa.
  - En el orden de recorte, RF-26 (manos libres) es lo último que se corta, pero es el extra más caro y más arriesgado (detector, permisos, falsos positivos, batería) y la consigna acepta push-to-talk. RF-30 (splash e ícono) es barato. Un recorte "desde abajo" debería sacar primero lo caro y menos valioso para M1.
- **Cambio propuesto (reemplazar la sección 9):**
  > La ventana es de 4 horas. Cinco etapas, una por RFC, con este presupuesto: etapa 1 (30 min), etapa 2 (35 min), etapa 3 (60 min, incluye el server local), etapa 4 (55 min), etapa 5 (60 min, incluye publicar el server y probar en teléfono físico). Cada etapa deja el repositorio en un estado que compila y con sus tests en verde; la app solo se puede usar de punta a punta desde la etapa 3.
  >
  > | Etapa | Qué deja |
  > | --- | --- |
  > | 1 | Proyecto armado con todas las librerías, y el research técnico hecho y anotado |
  > | 2 | Los datos y las reglas del campo, con sus tests y sin pantalla |
  > | 3 | El server local y el turno de voz completo: grabar, entender, proponer, anotar y hablar, con la cola sin señal |
  > | 4 | La pantalla: design system, resumen de hoy, tarjetas y todos los errores con salida |
  > | 5 | Los extras, el server publicado, la prueba de 20 frases con voz real, el APK, el README y las decisiones |
  >
  > **Si el tiempo no alcanza**, se recorta desde abajo, en este orden: RF-29, RF-28, RF-25, RF-30, RF-10, RF-05, RF-27 y RF-26. Lo que se recorte se cuenta en `DECISIONS.md` con el motivo. (RF-26 va último pero **antes** de tocar cualquier Must; si ya está en riesgo la etapa 3, se recorta primero.)

  Los minutos son una propuesta que suma 240. Ajustarlos si el autor tiene otra estimación.

#### I-11 · El español rioplatense y el ruido de fondo no tienen requisito ni métrica

- **Qué dice el PRD:** RF-04 (entiende "el pedido a partir del audio"), RF-24 ("La app habla en español"), sección 8 ("una batería de 20 frases dichas con voz real, 18 o más").
- **Problema:** la consigna dice "el usuario habla en español rioplatense", con "ruido de fondo". El PRD no pide entender voseo ("Mové", "Pasá", "Dale"), números dichos con palabras ("quince", "cuarenta y cinco"), "mm" y "milímetros", ni "anoche". La batería de 20 frases no dice si incluye ruido ni qué frases son.
- **Cambio propuesto:**
  > **RF-04** (agregar): "Entiende español rioplatense hablado: voseo en el imperativo ('Mové', 'Pasá'), números dichos con palabras, 'mm' y 'milímetros', y 'anoche', 'ayer', 'hoy'."
  > **Sección 8** (reemplazar la segunda viñeta): "De una batería escrita de 20 frases, dichas con voz real en español rioplatense (al menos 5 de ellas con ruido de fondo, por ejemplo una radio o un motor), 18 o más terminan en el resultado esperado. La batería incluye las cuatro frases de la consigna, al menos 3 pedidos con datos faltantes y 3 pedidos que deben terminar en 'no entendió' o en una regla que rechaza (RF-09)."

#### I-12 · Falta el requisito de entregar el repo en GitHub con historial, y varios detalles del APK

- **Qué dice el PRD:** M6 ("Repo con historial real"); RF-31 a RF-34 cubren APK, README, DECISIONS.md y AI-USAGE.md, pero ninguno cubre el repo.
- **Problema:** la consigna pide "Repo en GitHub con historial de commits real". Solo aparece como meta (M6), sin requisito comprobable. Además RF-31 dice "APK de release", pero la consigna acepta "firmado en debug"; no dice con qué clave se firma, ni que debe abrir sin un servidor de desarrollo (Metro), ni que se instala con `adb install`.
- **Cambio propuesto:**
  > **RF-38 · Must.** El código está en un repositorio de GitHub con commits reales por paso (no un solo commit al final).
  > **RF-31 · Must** (reemplazar): "APK de release firmado (la firma de debug alcanza), para Android 11 o superior, arm64, publicado como archivo de un Release de GitHub. Se instala con `adb install` y abre y funciona sin ningún servidor de desarrollo corriendo."

### Menor

- **m-1 · Justificar push-to-talk (RF-01 y RF-33).** La consigna pide "Push-to-talk o manos libres (justificalo)". RF-01 es "toca para empezar y se corta sola", no mantener apretado, y RF-33 no pide esa justificación en particular. Cambio: en RF-33 agregar "...incluida la justificación de tocar para hablar como modo principal frente a manos libres (RF-26) y frente a mantener apretado."
- **m-2 · RF-09 tiene reglas incompletas.** Agregar: "...además, la cantidad es un entero positivo, la categoría es una de las cinco, el lote de origen y el de destino son distintos, los milímetros no superan 500 por registro, y no hay fechas futuras."
- **m-3 · RF-26 y RNF-06 con manos libres.** RNF-06 dice "El audio sale del teléfono solo en un turno que inició la persona", pero un falso positivo del detector inicia un turno sin intención, y los audios guardados salen horas después (RF-17). Cambio en RNF-06: "El audio sale del teléfono solo en un turno que inició la persona (con un toque o con la frase de activación), o cuando reenvía un audio que ella dejó guardado." Y en RF-26 agregar: "Funciona solo con la app abierta y la pantalla encendida. Si la escucha que sigue a la frase detecta silencio (RF-20), se cancela."
- **m-4 · RF-27 "La entrada se puede apagar" no dice cómo.** Cambio: "...La entrada se puede apagar con un ajuste en la app y no se repite al volver del segundo plano."
- **m-5 · RNF-03 "Los textos principales".** Cambio: "Los textos principales (el subtítulo, los números de las tarjetas y los botones) miden 20 sp o más."
- **m-6 · "Teléfono de gama media" sin definir (RNF-01, M1).** Cambio en RNF-01: "...probado en al menos un teléfono físico Android 11 o superior con 4 GB de RAM o menos, y además en el emulador." RNF-02: "100 ms" no dice cómo se mide; cambiar a "el orbe cambia de estado en el cuadro siguiente al toque, medido con el registro de la app".
- **m-7 · Métricas de la sección 8 desalineadas con las metas.** Repiten M1, M2 y M5, no hay métrica para M3, M4 ni M6, y "las cuatro frases de la consigna" no están listadas. Agregar a M1: "(1) 'Llovieron 18 mm anoche', (2) 'Pasé 40 vaquillonas del lote 3 al 5', (3) '¿Cuánto llovió este mes?', (4) '¿Cuántos animales hay en el lote 5?'". Agregar métricas: "Ninguna escritura queda anotada sin pasar por una propuesta o por una confirmación (M3, por test)" y "Totales y saldos siempre coinciden con los datos guardados (M4, por test)".
- **m-8 · M2 cita RF-21 como un "error" y el alcance habla de "cuatro salidas" con seis RF.** La sección 5.5 tiene seis requisitos (RF-16 a RF-21), de los cuales RF-20 y RF-21 no son de la consigna. Cambio en la sección 3: "Las cuatro salidas de la consigna (micrófono denegado, sin red, no entendió, faltan datos) y dos más (nadie habló, ningún estado sin salida)."
- **m-9 · RNF-10 depende de `RULES.md`**, que no existe y tiene menos autoridad que el PRD según `CLAUDE.md`. Cambio: "Cumple la arquitectura y el estilo de `RULES.md` cuando exista; el autor puede explicar cualquier línea." No agrega ninguna regla propia al PRD.
- **m-10 · RF-14 no incluye "lluvia de hoy".** El resumen de "hoy" muestra "lluvia del mes" y "última lluvia", pero no si llovió hoy. Cambio: "...cabezas totales, lluvia de hoy (0 si no llovió), lluvia del mes, última lluvia, ...".
- **m-11 · "No un chat" no está como requisito.** Solo se deduce del alcance. Agregar a RF-03: "La pantalla muestra una tarjeta a la vez; no hay lista de mensajes ni burbujas."
- **m-12 · J4 y J5.** J4 usa "Anotar y Descartar" y RF-08 usa "anotar ya o cancelar"; unificar los botones: "Anotar" y "Cancelar" en la propuesta, "Anotar" y "Descartar" en lo guardado. J5 depende de RF-26 (Should) sin decirlo: agregar "(Si RF-26 está entregado.)" al título.
- **m-13 · README y la clave de desarrollo.** La consigna dice "¿Necesitás una key para desarrollar? Pedila." No hay ninguna pregunta o supuesto sobre ello. Cambio: agregar **Q6** "¿Qué proveedor de voz y de modelo se usa y hace falta pedir una clave para el desarrollo? Antes de la etapa 1." Y en RF-32: "README ... incluye cómo configurar las claves en el server (archivo de ejemplo sin valores)."
- **m-14 · Q3 y RNF-08.** RNF-08 afirma "Las animaciones no corren en el hilo de JavaScript" (dependiente del stack, difícil de comprobar), mientras Q3 deja abierto si el orbe se aquieta en reposo. Cambio: "Las animaciones no bloquean el hilo de la interfaz, y el orbe se aquieta en reposo (Q3 resuelta: sí)" o dejar Q3 sin resolver y quitar la afirmación del RNF.
- **m-15 · RF-33 y los recortes.** La sección 9 dice "Lo que se recorte se cuenta en DECISIONS.md" y la consigna pide "qué y por qué". Cambio: "...se cuenta en DECISIONS.md, con el motivo."
- **m-16 · Escalabilidad en RF-33.** Queda como una frase. Cambio: "...y cómo escalaría de un productor a miles: costo por pedido, límites del server, datos en el teléfono vs en un servicio, y qué cambiaría primero."

## Cobertura de la consigna

| Punto de la consigna | Requisitos del PRD | Estado |
| --- | --- | --- |
| Contexto: "sol del mediodía, guantes puestos, poca señal y ruido de fondo", "Android de gama media" | RNF-01, RNF-03, RNF-04, RF-17, RF-29 | A medias: el ruido de fondo no tiene requisito ni métrica (I-11); la gama media no está definida (m-6) |
| "habla en español rioplatense" | RF-04, RF-24 | A medias: no pide entender voseo ni números en palabras (I-11) |
| "la app responde en voz alta" | RF-03, RF-24, RF-25 | Cubierto |
| "registra lo que pasó en el campo y contesta preguntas" | RF-06 a RF-13 | Cubierto |
| "La pantalla muestra el comprobante: una tarjeta con los números, no un chat" | RF-08, RF-11, RF-12, alcance (sin historial) | A medias: "no un chat" solo se deduce (m-11) |
| "Nos importan tus decisiones de UX y técnicas ... Recortá alcance y contanos qué y por qué" | RF-33, sección 9 | A medias: el "por qué" de los recortes no está pedido (m-15) |
| Obligatorio 1: "hablás → respuesta hablada corta + subtítulo" | RF-01, RF-03 | Cubierto |
| Obligatorio 1: "Push-to-talk o manos libres (justificalo)" | RF-01, RF-26, RF-33 | A medias: falta pedir la justificación (m-1) |
| Obligatorio 1: "El estado del micrófono siempre es obvio" | RF-02 | A medias: contradice con manos libres y no cubre otros estados (C-3) |
| Obligatorio 2: escrituras de lluvia y movimiento | RF-06, RF-07, RF-08, RF-09, RF-23 | Cubierto |
| Obligatorio 3: lecturas "¿Cuánto llovió este mes?" y "¿Cuántos animales hay en el lote 5?" con detalle en tarjeta | RF-11, RF-12, RF-13 | A medias: "este mes" sin definir (I-5) |
| Obligatorio 4: pantalla de inicio con resumen de "hoy" | RF-14, RF-15 | Cubierto (con m-10) |
| "Que nunca se trabe": micrófono denegado | RF-16, J6 | Cubierto |
| "Que nunca se trabe": sin red | RF-17, RNF-04, RNF-11, J4 | A medias: sin tiempo de espera, conflicto con RF-08 (I-3, I-6) |
| "Que nunca se trabe": no entendió | RF-18 | Cubierto |
| "Que nunca se trabe": faltan datos ("¿De qué lote?") | RF-19, RF-20, J2 | A medias: ciclo sin salida (I-7) |
| "Que nunca se trabe" (en general) | RF-21, M2 | A medias: casos fuera de 5.5 (I-8) |
| "No construyas": login, backend real, reportes, mapas, iOS | Sección 3, S2 | Cubierto (S2 justifica el server mínimo) |
| Datos: "Un JSON local o el storage del teléfono. Sin base de datos ni integraciones" | RF-22, RF-23 | Cubierto |
| Datos: semilla "La Tranquera, cría, Castelli (BA) · 8 lotes · ~450 cabezas por categoría y lote · lluvias de los últimos 60 días" | RF-22, S1 | A medias: S1 contradice la cifra y hace imposible "40 vaquillonas del lote 3" (C-1); el 60 días sin fechas relativas (I-5) |
| Stack: "Elegís vos" | RF-33, S3 | Cubierto |
| Stack: "¿Necesitás una key para desarrollar? Pedila." | (ninguno) | Falta (m-13) |
| Evaluar: Escalabilidad | RF-33, RNF-05, RNF-07 | A medias: una frase en RF-33; sin protección del server (I-9, m-16) |
| Evaluar: UX y diseño | RF-02, RF-27, RF-28, RF-29, RNF-03 | Cubierto |
| Evaluar: Decisión de stack | RF-33 | Cubierto |
| Entregable: repo en GitHub con historial de commits real | M6 (solo meta) | Falta (I-12) |
| Entregable: APK en un GitHub Release, Android 11+ arm64, debug alcanza | RF-31, RNF-01 | A medias: sin firma ni "sin Metro" (I-12) |
| Entregable: README "cómo compilar desde cero y levantar el server" | RF-32 | Cubierto |
| Entregable: DECISIONS.md | RF-33 | Cubierto |
| "Instalamos el APK en un teléfono real y lo usamos como un productor" | M1, RNF-01, S2 | A medias: sin requisito de publicar el server ni de probar en teléfono físico (C-2) |
| Reglas: "contanos cuáles y cómo" (IA) y "poder explicar cualquier línea" | RF-34, RNF-10 | Cubierto |
| Condiciones: "4 horas para el MVP" | Sección 9 | A medias: sin presupuesto de tiempo (I-10) |

**Contradicciones directas con la consigna:** S1 contra la cifra de la semilla (C-1) y RF-02 contra "El estado del micrófono siempre es obvio" cuando están activas las manos libres (C-3).

## Referencias cruzadas y números

Chequeo hecho al final, recontando desde el contenido de `PRD.md`:

- Existen y son consecutivos: RF-01 a RF-34 (5.1: 5, 5.2: 5, 5.3: 3, 5.4: 2, 5.5: 6, 5.6: 2, 5.7: 2, 5.8: 5, 5.9: 4), RNF-01 a RNF-11, M1 a M6, S1 a S5, Q1 a Q5, J1 a J6. No hay IDs duplicados.
- Citas internas verificadas: M2 y la sección 8 citan "sección 5.5" (existe y contiene los errores); RNF-11 cita RF-17 (cola de audios: correcto) y RF-24 (voz de respaldo: correcto); la sección 8 cita RNF-02 (latencia: correcto).
- La lista de recortes nombra RF-29, RF-28, RF-25, RF-10, RF-05, RF-27, RF-30 y RF-26. Cada ID existe y dice lo que el texto da a entender (brillo, tema, aviso de voz, corregir, interrumpir, orbe, splash, manos libres). Los ocho son exactamente los requisitos Should (RF-05, 10, 25, 26, 27, 28, 29, 30): la lista no omite ni agrega ninguno. Pero RF-04 (Must) cita RF-10 (Should) como capacidad del producto (I-2).
- "Cuatro estados" en RF-02: coinciden los cuatro nombrados. "Cinco etapas": la tabla tiene cinco. "Las cuatro frases de la consigna" (M1): la consigna tiene cuatro ejemplos concretos, pero el PRD no las lista (m-7).
- Referencias inexactas: sección 3 cuenta la cola de audios como extra mientras RF-17 es Must (I-4); M4 y RF-13 dicen que ningún número viene del modelo mientras RF-08 y J1 muestran números entendidos por el modelo (I-1); J4 muestra botones sin cuenta mientras RF-08 no admite excepciones (I-3); la sección 9 dice que cada etapa "deja la app funcionando" mientras la etapa 2 es "sin pantalla" (I-10).
- Números que no cierran: S1 (450 en total) contra la consigna (~450 por categoría y lote) y contra el ejemplo de 40 vaquillonas (C-1); M5 y RNF-02 fijan 5 s y 3 s antes de que Q5 los mida (I-6); la ventana de 4 h no tiene suma por etapa (I-10).
- No hay referencias a IDs inexistentes. El chequeo no encontró dos tablas del PRD que se contradigan entre sí aparte de lo anotado arriba.

## Puntaje de calidad (1 a 10)

| Criterio | Puntaje | Motivo |
| --- | --- | --- |
| Completitud | 7 | Cubre casi todo; faltan el server publicado, el repo, fechas/períodos y casos de error |
| Claridad | 6 | Varios requisitos sin números ni definiciones (silencio, mes, semana, "lento") |
| Viabilidad | 6 | Mucho alcance extra para 4 horas, sin presupuesto; la semilla elegida rompe la frase central |
| Enfoque en el usuario | 8 | Jornadas claras, buena atención al sol, los guantes y la poca señal |

## Preguntas para el autor

1. ¿Es válida la lectura "~450 cabezas por categoría repartidas entre los lotes" para la semilla? ¿O se mantiene S1 y se garantiza igual que el lote 3 tiene 40 vaquillonas o más (C-1)?
2. ¿Dónde se va a publicar el server y quién lo mantiene arriba mientras evalúan (C-2)? ¿Hasta qué fecha?
3. En manos libres, ¿qué debe ver la persona para saber que el micrófono está abierto esperando la frase (C-3)? ¿Se acepta un quinto estado visual?
4. ¿Una escritura que llegó por manos libres se debe anotar sola a los 4 segundos, o conviene exigir un toque para confirmar? Con guantes, ruido y un detector que puede dispararse solo, anotar sin tocar es el caso de más riesgo.
5. ¿"Este mes" es el mes calendario o los últimos 30 días? ¿"Esta semana" empieza el lunes (I-5)? ¿Y desde qué hora "anoche" es de ayer?
6. ¿Cuánto tiempo real se asigna a cada etapa, y qué se corta primero si la etapa 3 se pasa de tiempo (I-10)?
7. ¿La cola de audios sin señal es parte del Must o se acepta, como mínimo, un mensaje y un botón de reintento (I-4)?
8. ¿Hay un teléfono físico Android 11+ disponible para las pruebas de voz y para M1? ¿De qué gama (m-6)?
9. ¿Se pidió una clave de desarrollo para el modelo y la voz, o se usan claves propias (m-13)? ¿Quién paga el gasto durante la evaluación (I-9)?
10. ¿Cuántas rondas de "faltan datos" se toleran antes de descartar el pedido, y qué ve la persona al final (I-7)?
11. ¿La entrada con el logo es obligatoria en cada apertura o solo la primera vez (m-4)?
12. ¿RF-10 (corregir lo último) es una capacidad que el modelo debe reconocer siempre, o solo si se entrega (I-2)?

## Qué se hizo con cada hallazgo

Después de esta revisión se corrigió `PRD.md`. Esta tabla dice qué se aplicó y qué no.

| Hallazgo | Resolución |
| --- | --- |
| C-1 | Se mantiene la lectura de 450 cabezas en total (S1), pero RF-22 ahora garantiza que las cuatro frases de la consigna se pueden ejecutar: el lote 3 arranca con 40 vaquillonas o más. La lectura queda marcada para confirmar con quien evalúa |
| C-2 | Aplicado: RF-35 (server publicado) y RF-36 (prueba final en un teléfono físico) |
| C-3 | No aplicado, por decisión del autor: con manos libres el orbe sigue en reposo, como en cualquier manos libres. Avisan el interruptor encendido y el texto de estado, y el paso a escuchando es evidente |
| I-1 | Aplicado en M4 y RF-13 |
| I-2 | Aplicado en RF-04 y RF-10 |
| I-3 | Aplicado en RF-17 y RF-08, con 8 segundos de espera y reintento cada 20 |
| I-4 | Aplicado: la cola pasó de extra a incluido |
| I-5 | Aplicado como RF-37, con definiciones más simples: "anoche" es siempre ayer y "esta semana" son los últimos 7 días |
| I-6 | Aplicado con estos valores: 2,5 segundos de silencio, 20 de tope y 8 sin voz. La latencia se mide desde que termina la escucha |
| I-7 | Aplicado en RF-19: dos preguntas seguidas como máximo |
| I-8 | Aplicado en parte, en RF-21, RF-08 y RNF-11: cancelar mientras piensa, respuesta ilegible del server y segundo plano durante la cuenta. No se listaron el micrófono ocupado ni la falla al guardar: quedan cubiertos por la regla general de RF-21 |
| I-9 | Aplicado en parte como RNF-12: tope de tamaño y tope de gasto. La clave compartida y el límite por dirección no entran: se explican en DECISIONS.md como lo que falta para producción |
| I-10 | Aplicado: minutos por etapa y el server en las etapas. El orden de recorte se sacó después, por decisión del autor: entra todo |
| I-11 | Aplicado en RF-04 y en la batería de la sección 8 |
| I-12 | Aplicado: RF-38 (repo con historial) y RF-31 |
| m-1, m-2, m-3, m-4, m-5, m-6, m-7, m-8, m-11, m-12, m-13, m-15, m-16 | Aplicados. De m-2 no se tomó el tope de 500 mm |
| m-9 | No aplica: `RULES.md` ya existe |
| m-10 | No aplicado: "lo anotado hoy" ya dice si hoy se anotó lluvia |
| m-14 | No aplicado: RNF-08 se comprueba en el research. Q3 se respondió después: el orbe sigue animado |
| Preguntas 1, 2, 4, 6 y 8 | Quedaron en la sección 10 del PRD: S1, Q1, Q6, Q8 y Q7 |


# PRD · Field Assistant

Revisado con `/verify-prd`: los hallazgos y qué se hizo con cada uno están en `PRD-REVIEW.md`.
Lo que queda por decidir está en la sección 10.

**Tipo de producto:** app móvil para Android, con un server mínimo sin estado que guarda las
claves de los proveedores.

**Controles que no aplican y se omiten:** cuentas y login, base de datos, modelo de negocio,
internacionalización, iOS, tablets, analítica y cumplimiento regulatorio. La consigna
(`CHALLENGE.md`) los deja afuera o no los menciona.

## 1. Resumen

Field Assistant es un asistente de campo por voz. Un productor ganadero, en el lote, le dice
al teléfono lo que pasó ("Pasé 40 vaquillonas del lote 3 al 5", "Llovieron 18 milímetros
anoche") o le pregunta lo que necesita saber ("¿Cuánto llovió este mes?"). La app contesta en
voz alta con una oración corta y muestra el comprobante: una tarjeta con los números, no un
chat.

Está pensada para las condiciones de la consigna: sol del mediodía, guantes puestos, poca
señal, ruido de fondo y un Android de gama media.

## 2. Metas y objetivos

| ID | Meta | Cómo se comprueba |
| --- | --- | --- |
| M1 | Lo obligatorio de la consigna funciona de punta a punta en un teléfono real | Las cuatro frases de la consigna dan el resultado correcto desde el APK instalado: "Llovieron 18 mm anoche", "Pasé 40 vaquillonas del lote 3 al 5", "¿Cuánto llovió este mes?" y "¿Cuántos animales hay en el lote 5?" |
| M2 | La app nunca se traba | Cada error de la sección 5.5 termina en una pantalla con una salida visible |
| M3 | Nada se anota a espaldas de la persona | Toda escritura pasa por una tarjeta que muestra lo que se va a anotar y se puede cancelar |
| M4 | Los números son confiables | Los totales y los saldos salen siempre de los datos guardados. Los números de una propuesta son lo que se entendió del audio: se muestran antes de anotar y se pueden cancelar |
| M5 | Un turno es rápido | Se cumple RNF-02 |
| M6 | La entrega está completa | Se cumplen los requisitos de la sección 5.9 |

## 3. Alcance

**Incluido**

- Lo obligatorio de la consigna: turno de voz, escrituras de lluvia y de movimiento de
  animales, lecturas de lluvia y de animales por lote, y pantalla de inicio con el resumen de hoy.
- Las cuatro salidas que pide la consigna para "que nunca se trabe" (micrófono denegado, sin
  red, no entendió y faltan datos) y dos más: nadie habló, y que ningún estado quede sin salida.
  Sin red, el audio se guarda en una cola y se procesa al volver la señal.
- Extras elegidos: manos libres con frase de activación, orbe animado con entrada del logo,
  tema y brillo según la luz, y splash e ícono con la marca.

**Fuera de alcance, por la consigna**

Login, backend real, reportes, mapas e iOS.

**Fuera de alcance, por decisión propia**

- Más de un establecimiento o más de un usuario.
- Editar o borrar registros a mano desde la pantalla.
- Historial de la conversación guardado entre aperturas de la app.
- Cancelar o confirmar por voz mientras corre la cuenta de una propuesta.
- Sincronización entre teléfonos.

## 4. Personas

**P1 · El productor o encargado.** Trabaja al aire libre, con las manos ocupadas o con
guantes. Mira la pantalla de reojo y al sol. Tiene señal intermitente. No quiere llenar
formularios ni leer párrafos: quiere decirlo, oír que se entendió y ver el número.

**P2 · Quien evalúa el challenge.** Instala el APK en un teléfono real y lo usa como P1.
Después lee el código, el README y las decisiones. Tiene que poder compilar desde cero.

## 5. Requisitos funcionales

Prioridad: **Must** es lo mínimo para entregar; **Should** entra si el tiempo alcanza.

### 5.1 Turno de voz

| ID | Prioridad | Requisito |
| --- | --- | --- |
| RF-01 | Must | Tocar el botón principal inicia la escucha. Se corta sola tras 2,5 segundos de silencio, a los 20 segundos como máximo, y también tocando de nuevo. La consigna pide justificar el modo: se toca una vez, no se mantiene apretado, porque con guantes es más fácil. |
| RF-02 | Must | El estado del micrófono se ve siempre. Son cuatro: en reposo, escuchando, pensando y hablando. Cada uno tiene color, movimiento, ícono y texto propios, y se distingue también sin el color. |
| RF-03 | Must | Cada turno termina con una respuesta hablada de una oración y el mismo texto como subtítulo. La pantalla muestra tarjetas con números, no una lista de mensajes. |
| RF-04 | Must | La app entiende el pedido a partir del audio: qué se pide y con qué datos. Pedidos posibles: registrar lluvia, mover animales, consultar lluvia, consultar un lote y corregir lo último anotado. Lo demás es "no entendido" (RF-18). Entiende español rioplatense hablado: el voseo ("Mové", "Pasá"), los números dichos con palabras, "milímetros" y "anoche". |
| RF-05 | Should | Tocar el botón mientras la app habla la interrumpe. |

### 5.2 Escrituras

| ID | Prioridad | Requisito |
| --- | --- | --- |
| RF-06 | Must | Registrar lluvia: milímetros y día. Entiende "hoy", "ayer", "anoche" y una fecha (RF-37). |
| RF-07 | Must | Mover animales: cantidad, categoría, lote de origen y lote de destino. |
| RF-08 | Must | Antes de anotar, la app muestra lo que va a anotar y espera 4 segundos. La persona puede tocar "Anotar" o "Cancelar". Al anotar, la tarjeta pasa a ser el comprobante, con los números ya actualizados. Si la app pasa a segundo plano durante la cuenta, no se anota sola: la propuesta queda esperando un toque. La cuenta no se aplica a los audios guardados sin señal (RF-17). |
| RF-09 | Must | Las reglas las aplica la app, no el modelo de lenguaje: los lotes existen y son distintos, la categoría es una de las cinco, la cantidad es un entero positivo y alcanza en el lote de origen, los milímetros son un número positivo y la fecha no es futura. Si no se cumplen, no anota y lo explica con los números ("En el lote 3 hay 12 novillos, no 500"). |
| RF-10 | Should | Corregir lo último anotado: "No, eran veinte". Pasa por la misma propuesta de RF-08, y el registro corregido reemplaza al anterior. Si no hay nada anotado desde que se abrió la app, lo dice. |

### 5.3 Lecturas

| ID | Prioridad | Requisito |
| --- | --- | --- |
| RF-11 | Must | Lluvia de un período (hoy, ayer, esta semana, este mes; RF-37): el total se dice en voz alta y el detalle por día va en la tarjeta. |
| RF-12 | Must | Animales de un lote: el total se dice en voz alta y el detalle por categoría va en la tarjeta. |
| RF-13 | Must | Los totales, los saldos y el detalle de las respuestas y de los comprobantes se calculan con los datos guardados, nunca con lo que devuelve el modelo de lenguaje. De una propuesta, el modelo solo aporta los datos del pedido (cantidad, categoría, lotes, milímetros, día), y la app los valida (RF-09) antes de mostrarlos. |

### 5.4 Pantalla de inicio

| ID | Prioridad | Requisito |
| --- | --- | --- |
| RF-14 | Must | Resumen de hoy: cabezas totales, lluvia del mes, última lluvia, animales por lote y lo anotado hoy. |
| RF-15 | Must | El resumen se actualiza al anotar, sin recargar la pantalla. |

### 5.5 Que nunca se trabe

| ID | Prioridad | Requisito |
| --- | --- | --- |
| RF-16 | Must | Micrófono denegado: una tarjeta lo explica y un botón abre los ajustes del teléfono. |
| RF-17 | Must | Sin red, con el server sin contestar en 8 segundos o con un error del server: el audio se guarda en el teléfono con la fecha en que se grabó, y la app lo dice. La pantalla muestra cuántos hay guardados, y siguen ahí al cerrar la app. Se reenvían cada 20 segundos y cuando la app vuelve a estar a la vista. Cada uno se entiende con su fecha de grabación ("ayer" es el día anterior a esa fecha) y se valida con los datos del momento. Lo entendido se muestra en una tarjeta con "Anotar" y "Descartar": nunca se anota solo. Una consulta guardada se contesta en una tarjeta. |
| RF-18 | Must | No entendió: lo dice y muestra tres frases de ejemplo. |
| RF-19 | Must | Faltan datos: la app pregunta lo que falta ("¿De qué lote a qué lote?") y vuelve a escuchar sola. La respuesta completa el pedido anterior; si es un pedido nuevo, lo reemplaza. Si después de dos preguntas seguidas el pedido sigue incompleto, o si nadie contesta (RF-20), la app lo descarta, lo dice y muestra frases de ejemplo. |
| RF-20 | Must | Nadie habló: si no se detecta voz en 8 segundos, o el audio queda vacío, la escucha se cancela, la app lo dice y vuelve a reposo. |
| RF-21 | Must | Ningún estado deja la pantalla sin salida: siempre hay una acción visible para seguir. Mientras la app piensa, tocar el botón principal cancela el turno. Una respuesta del server que no se puede leer se trata como un error del server (RF-17). |

### 5.6 Datos

| ID | Prioridad | Requisito |
| --- | --- | --- |
| RF-22 | Must | Datos iniciales: establecimiento "La Tranquera" (cría, Castelli, Buenos Aires), 8 lotes, 450 cabezas en cinco categorías (vacas, vaquillonas, terneros, novillos y toros) y las lluvias de los 60 días anteriores a la primera apertura (S1). El reparto garantiza que las cuatro frases de la consigna se puedan ejecutar en orden: el lote 3 arranca con 40 vaquillonas o más. |
| RF-23 | Must | Lo anotado se guarda en el teléfono y sigue ahí al cerrar y volver a abrir la app. |
| RF-37 | Must | Fechas y períodos, con el reloj y la zona horaria del teléfono. "Anoche" y "ayer" son la fecha de ayer. "Este mes" es el mes en curso, hasta hoy. "Esta semana" son los últimos 7 días, contando hoy. No se anota nada con fecha futura. |

### 5.7 La voz de la app

| ID | Prioridad | Requisito |
| --- | --- | --- |
| RF-24 | Must | La app habla en español. Usa una voz de servicio y, si no está disponible, la voz del teléfono. |
| RF-25 | Should | Si el teléfono no tiene ninguna voz en español, la app lo avisa y ofrece instalarla. |
| RF-39 | Should | Frases grabadas: mientras piensa, la app dice una muletilla corta ("Dame un segundo"), y el aviso de sin señal suena con la misma voz de siempre. Son audios guardados dentro de la app: suenan al instante y sin red. |

### 5.8 Extras

| ID | Prioridad | Requisito |
| --- | --- | --- |
| RF-26 | Should | Manos libres: con el interruptor encendido, decir una frase de activación inicia la escucha sin tocar. La frase se detecta dentro del teléfono; mientras espera, nada se graba ni se envía. El teléfono vibra al detectarla. Está apagado por defecto y funciona solo con la app a la vista. Mientras espera la frase, el botón principal sigue en reposo, como en cualquier manos libres: lo que avisa que está atento es el interruptor encendido y el texto de estado. Al oír la frase, el cambio a escuchando es evidente. |
| RF-27 | Should | El botón principal es un orbe animado, y al abrir la app hay una entrada con el logo de la marca. La entrada se apaga con un ajuste de configuración y no se repite al volver del segundo plano. |
| RF-28 | Should | Tema claro u oscuro según la luz ambiente. |
| RF-29 | Should | Con mucha luz, el brillo de la pantalla va al máximo, y vuelve al del teléfono a la sombra. |
| RF-30 | Should | Splash e ícono de la app con la marca. |

### 5.9 Entrega

| ID | Prioridad | Requisito |
| --- | --- | --- |
| RF-31 | Must | APK de release para Android 11 o superior, arm64, publicado como archivo de un Release de GitHub. La firma de debug alcanza. Abre y funciona sin ningún servidor de desarrollo. |
| RF-32 | Must | README con cómo compilar desde cero, cómo levantar el server y cómo configurar sus claves. |
| RF-33 | Must | DECISIONS.md con las decisiones de UX y de stack y qué se resignó en cada una. Incluye por qué se toca para hablar y qué lugar tiene manos libres, qué quedó afuera y por qué (si algo quedó afuera), y cómo escalaría de un productor a miles: costo por pedido, límites del server, datos en el teléfono o en un servicio, y qué cambiaría primero. |
| RF-34 | Must | AI-USAGE.md con las herramientas de IA usadas y para qué. |
| RF-35 | Must | El server queda publicado con https y disponible mientras dure la evaluación. Su dirección es un ajuste del build, y el README dice cómo cambiarla para usar un server local. |
| RF-36 | Must | Antes de entregar, las cuatro frases de la consigna se prueban con el APK de release en un teléfono físico contra el server publicado. El resultado se anota. |
| RF-38 | Must | El código está en un repositorio de GitHub con historial real: un commit por paso, no uno solo al final. |

## 6. Requisitos no funcionales

| ID | Requisito |
| --- | --- |
| RNF-01 | **Plataforma.** Android 11 (API 30) o superior, arm64, en vertical, en un teléfono de gama media. Se prueba en un teléfono físico; lo que solo se pudo probar en el emulador se anota. |
| RNF-02 | **Rapidez.** Al tocar, la pantalla responde en menos de 100 ms. Con buena señal, desde que termina la escucha hasta que aparece la tarjeta pasan 5 segundos como máximo; el objetivo es 3. El research de la etapa 1 lo mide (Q5); si no se alcanza, se corrige este número antes de la etapa 4. |
| RNF-03 | **Sol y guantes.** El botón principal mide 64 dp o más y su área táctil es más grande que el dibujo. El subtítulo, los números de las tarjetas y los botones miden 20 sp o más. El contraste de texto es de 4,5 a 1 o más en los dos temas. |
| RNF-04 | **Sin red.** La app abre, muestra el resumen con los datos guardados y permite dejar un pedido grabado. |
| RNF-05 | **Claves.** Ninguna clave de un proveedor viaja en el APK. Están en el server. |
| RNF-06 | **Privacidad.** El audio sale del teléfono solo en un turno que inició la persona, con un toque o con la frase de activación, o al reenviar un audio que ella dejó guardado. El server no guarda audio ni datos. |
| RNF-07 | **Costo.** Entender mil pedidos cuesta 1 dólar o menos. El costo de la voz de servicio se mide en el research y se anota con su fecha. |
| RNF-08 | **Batería.** Las animaciones no corren en el hilo de JavaScript. El micrófono está abierto solo durante un turno o con manos libres encendido. |
| RNF-09 | **Tamaño.** El APK pesa 100 MB o menos. |
| RNF-10 | **Código.** Cumple la arquitectura y el estilo de `RULES.md`. El autor puede explicar cualquier línea. |
| RNF-11 | **Robustez.** Si falla un proveedor, la app no se rompe: un audio que no se pudo enviar o entender por una falla técnica va a la cola (RF-17), y la voz cae en la del teléfono (RF-24). "No entendió" (RF-18) es solo cuando el modelo contestó que no era un pedido válido. |
| RNF-12 | **Cuidado del server.** El server acepta audios de hasta 2 MB y rechaza lo demás. Cada proveedor tiene un tope de gasto configurado en su panel. Lo que le falta para producción (identificar a quien llama y limitar por usuario) se explica en `DECISIONS.md`. |

## 7. Jornadas de usuario

**J1 · Anotar la lluvia.** Toca el orbe y dice "Llovieron 18 milímetros anoche". El orbe pasa
por escuchando y pensando. Aparece la tarjeta "Voy a anotar: 18 mm, lluvia de ayer" con una
cuenta de 4 segundos. No toca nada. La app anota, dice "Anotado. Van 56 milímetros en el mes"
y el resumen de arriba cambia.

**J2 · Mover animales, con un dato que falta.** Dice "Mové quince terneros". La app pregunta
"¿De qué lote a qué lote?" y vuelve a escuchar sola. Dice "Del dos al siete". Aparece la
propuesta completa, la anota y dice cuántos terneros quedan en el lote 2.

**J3 · Consultar.** Dice "¿Cuántos animales hay en el lote 5?". La app contesta el total en
una oración y la tarjeta muestra el detalle por categoría.

**J4 · Sin señal.** Dice una lluvia sin red. La app contesta "Guardé tu audio" y arriba
aparece "1 guardado". Más tarde, con señal, la app muestra "Grabado sin señal: 18 mm, lluvia
de ayer" con los botones "Anotar" y "Descartar".

**J5 · Manos libres.** Con el interruptor encendido dice la frase de activación. El teléfono
vibra, el orbe pasa a escuchando y dice el pedido sin tocar la pantalla.

**J6 · Primera vez.** Abre la app, ve la entrada con el logo y después el resumen. Toca el
orbe y el teléfono pide permiso de micrófono. Si lo niega, una tarjeta explica cómo darlo.

## 8. Métricas de éxito

- Las cuatro frases de la consigna dan el resultado correcto en un teléfono real, con el APK.
- De la batería de 20 frases de `docs/BATERIA.md`, dichas con voz real en español rioplatense,
  18 o más terminan en el resultado esperado. La batería incluye las cuatro frases de la consigna, tres
  pedidos con datos que faltan, tres que una regla rechaza y cinco dichas con ruido de fondo.
- Los errores de la sección 5.5 terminan todos en una pantalla con salida.
- Ninguna escritura queda anotada sin pasar por una propuesta (M3) y los totales coinciden con
  los datos guardados (M4): los dos se comprueban con tests.
- La latencia de un turno cumple RNF-02.
- Otra persona compila el proyecto desde cero siguiendo solo el README.

## 9. Cronograma

La ventana es de 4 horas. El trabajo se divide en cinco etapas como máximo, una por RFC, en
este orden. Cada etapa deja el proyecto compilando y con sus tests en verde; la app se puede
usar de punta a punta desde la etapa 4.

| Etapa | Minutos | Qué deja |
| --- | --- | --- |
| 1 | 30 | Proyecto armado con todas las librerías, el server mínimo y el research técnico hecho y anotado |
| 2 | 35 | Los datos y las reglas del campo, con sus tests y sin pantalla |
| 3 | 55 | El design system y la pantalla de inicio, con el resumen de hoy sobre los datos reales |
| 4 | 70 | El server y el turno de voz completo: grabar, entender, proponer, anotar y hablar, con todos los errores con salida |
| 5 | 50 | Los extras, el server publicado, la prueba final en un teléfono, el APK y los documentos |

Entra todo lo que lista la sección 5. Si algo queda afuera, se cuenta en `DECISIONS.md`, con
el motivo.

## 10. Supuestos y preguntas abiertas

**Supuestos**

| ID | Supuesto |
| --- | --- |
| S1 | "~450 cabezas por categoría y lote" se lee como 450 cabezas en total, repartidas entre las categorías y los lotes de modo que las frases de la consigna se puedan ejecutar. Es una lectura propia: se anota en `DECISIONS.md` y conviene confirmarla con quien evalúa. |
| S2 | Un server mínimo sin estado, que guarda las claves y reenvía los pedidos a los proveedores, no es el "backend real" que la consigna pide no construir. Se publica con https para que el APK funcione en el teléfono de quien evalúa. |
| S3 | Entender el pedido lo resuelve un modelo de lenguaje que recibe el audio directamente, sin un paso aparte de transcripción. |
| S4 | Hay un solo establecimiento y un solo usuario. |
| S5 | La persona usa la app en vertical, con una mano. |
| S6 | Se usan claves propias de los proveedores; no hace falta pedir una clave de desarrollo. |

**Preguntas abiertas**

| ID | Pregunta | Para cuándo |
| --- | --- | --- |
| Q1 | El server se publica en Railway. ¿Hasta cuándo queda disponible? | Antes de la etapa 5 |
| Q2 | ¿Cuál es la frase de activación de manos libres? Tiene que estar en el vocabulario del detector. | Research de la etapa 1 |
| Q4 | ¿Qué voz de servicio se usa y con qué acento? | Research de la etapa 1 |
| Q5 | ¿Cuánto tarda de verdad un turno en un teléfono de gama media? | Research de la etapa 1 |
| Q7 | ¿Hay un teléfono físico con Android 11 o superior para las pruebas? | Antes de la etapa 1 |
| Q8 | ¿Los minutos por etapa de la sección 9 son los que querés? | Antes de la etapa 1 |

**Preguntas respondidas** (el porqué está en `DECISIONS.md`)

| ID | Pregunta | Respuesta |
| --- | --- | --- |
| Q3 | ¿El orbe se aquieta cuando está en reposo, para cuidar la batería? | No: en esta etapa sigue animado. |
| Q6 | Un pedido que llegó por manos libres, ¿se anota solo a los 4 segundos o pide un toque? | Se anota solo, igual que con el toque. |

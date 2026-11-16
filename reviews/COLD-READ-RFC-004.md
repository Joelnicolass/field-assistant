# Lectura en frío · RFC-004 · Server y turno de voz

Leídos: `CHALLENGE.md`, `PRD.md`, `FEATURES.md`, `RULES.md`, `CLAUDE.md`, RFC-001, RFC-002, RFC-003 y RFC-004.

Pregunta guía: **¿qué tendría que adivinar para implementar este RFC?** Los hallazgos van por
impacto. Los marcados **[BLOQUEA]** impiden empezar o terminar sin inventar un contrato.

Lo que sí cierra bien (para no repetirlo): los tipos de RFC-002 que el RFC usa existen con ese
nombre y forma (`RainProposal`, `MovementProposal`, `CorrectionProposal`, `LastRecord`,
`RainSummary`, `LotStock`, `Failure`, `Result<T, F>`, `ClockService`, los casos de uso
`Preview*`/`Register*`/`Get*`); `OrbState`, `VoiceStageView` e `InfoCardProps` de RFC-003 también.
Las capas de `data/usecases` (R3) están bien: `ResolveRequestUseCaseImpl` recibe contratos de
`domain/usecases` por constructor. La presentación (R4) solo importa de `domain`, `shared` y `di`.

---

## 1. [BLOQUEA] `VoiceEvent`, la tabla de transiciones y el estado del reducer no están definidos

**Qué dice (Presentación, "Fases y transiciones"):** "`VoiceEvent.ts` enum de lo que puede pasar",
"`voiceTransitions` es un objeto `Record<VoicePhase, …>`: de cada fase, a qué fase lleva cada
evento. Un evento que no figura en una fase no cambia nada".

**Qué habría que adivinar:** los eventos, a qué fase lleva cada uno, y qué guarda el reducer.
El RFC solo da cinco fases. Hay destinos que dependen del contexto: al terminar de hablar se va
a `Listening` si lo dicho fue una pregunta, a `Proposing` si fue una propuesta y a `Idle` en lo
demás; con un mismo toque, `Listening` sin voz vuelve a `Idle` pero con voz pasa a `Thinking`. Un
`Record<VoicePhase, Record<VoiceEvent, VoicePhase>>` no puede expresarlo. Tampoco dice qué pasa
con cada evento en cada fase: segundo plano en `Listening`, `Thinking` y `Speaking` (solo está
definido en `Proposing`), toque en `Speaking` si RF-05 se recorta (F16 exige una salida y RF-05
es Should), una respuesta que llega después de cancelar, o un error inesperado (F16).

**Agregar** (sección "Presentación"), esta tabla y el estado:

```ts
export enum VoiceEvent {
  OrbPressed, RecordingFinished, NoSpeechHeard, ResolutionReady, AudioQueued,
  SpeechFinished, CountdownElapsed, ProposalAccepted, ProposalCancelled,
  AppBackgrounded, UnexpectedFailure,
}
export type VoiceState = {
  phase: VoicePhase;
  afterSpeech: VoicePhase.Idle | VoicePhase.Listening | VoicePhase.Proposing; // lo fija ResolutionReady
  cards: VoiceCard[];
  questionsInARow: number;
  statusMessage: string | null;
};
```

| Fase | Evento | Destino y efecto |
| --- | --- | --- |
| `Idle` | `OrbPressed` | `Listening` (si hay permiso; si no, tarjeta "Sin micrófono" y sigue `Idle`) |
| `Listening` | `OrbPressed` / `RecordingFinished` con voz | `Thinking` |
| `Listening` | `OrbPressed` / `RecordingFinished` sin voz, o `NoSpeechHeard` | `Speaking` con "No escuché nada"; no llama al server; `afterSpeech = Idle`. Si había una pregunta pendiente: se descarta el pedido (F15) |
| `Listening` | `AppBackgrounded` | `Idle`; se cancela la grabación, el audio no se guarda |
| `Thinking` | `OrbPressed` | `Idle`; se aborta el pedido y una respuesta tardía se ignora; el audio no se guarda |
| `Thinking` | `ResolutionReady` | `Speaking` |
| `Thinking` | `AudioQueued` | `Speaking` con "Guardé tu audio" |
| `Thinking` | `AppBackgrounded` | sigue en `Thinking` (el pedido está en vuelo) |
| `Speaking` | `OrbPressed` | `Idle` (RF-05). Si RF-05 se recorta, se ignora y rige el tope de 20 s del punto 5 |
| `Speaking` | `SpeechFinished` | `afterSpeech` |
| `Proposing` | `OrbPressed` | descarta la propuesta y `Listening` |
| `Proposing` | `CountdownElapsed` / `ProposalAccepted` | `Speaking` con el comprobante; `afterSpeech = Idle` |
| `Proposing` | `ProposalCancelled` | `Idle` |
| `Proposing` | `AppBackgrounded` | sigue en `Proposing`, cuenta frenada |
| cualquiera | `UnexpectedFailure` | `Idle` con `statusMessage` y una tarjeta de salida |

El test de `voiceTransitions` recorre la tabla (criterio 34) y comprueba además que `AppBackgrounded`
en `Proposing` no lleva a ninguna fase que anote.

---

## 2. [BLOQUEA] La cola reprocesa audios ya entendidos y un audio que nunca se entiende la bloquea para siempre

**Qué dice (`RetryPendingAudiosUseCase`):** "recorre la cola en orden… Si el server no contesta,
corta y deja ese audio y los siguientes. Los que se entienden vuelven con su `Resolution`, y
siguen en la cola hasta que la persona los confirma o los descarta". Y `usePendingAudios`
"reintenta cada `retryQueueMs`".

**Problemas:**
- La entrada del caso de uso es `{ today, lastRecord }`: no puede excluir lo que ya se mostró. Como
  los entendidos siguen en la cola, cada 20 segundos se vuelven a enviar, se cobran otra vez y
  la tarjeta cambia o se duplica.
- "Si el server no contesta, corta": no dice qué errores cortan. Un audio que da `Unreadable`, `400`
  o `413` es determinista: con "corta" frena a todos los que vienen detrás, sin salida. Tampoco
  dice qué pasa si el archivo del audio ya no existe.
- Dos reintentos a la vez (el temporizador y el regreso a primer plano) o un reintento durante un
  turno en vivo no tienen regla.
- No dice si `waiting` cuenta los entendidos que esperan confirmación.

**Agregar** (en `RetryPendingAudiosUseCase`):

> Entrada: `{ today, lastRecord, skipIds: number[] }`; no reenvía los audios cuyo id esté en
> `skipIds`. Devuelve `waiting` = audios que siguen sin entenderse, y `resolved` solo con los
> nuevos. Corta únicamente con `Offline`, `Timeout` o `Server` por un 5xx; con `Unreadable`, `400`
> o `413`, o con un archivo que falta, el audio vuelve como `Resolution.NotUnderstood` y se sigue
> con el siguiente. `usePendingAudios` no inicia un reintento si hay uno en curso o si la fase
> es `Listening` o `Thinking`.

Y un criterio: "Un audio guardado que devuelve `Unreadable` no frena a los siguientes, y uno ya
entendido no se vuelve a enviar".

---

## 3. [BLOQUEA] `VoiceCard` no está definido y no hay política de qué tarjetas conviven

**Qué dice:** "`VoiceCard.ts` las tarjetas del turno, como unión con su enum". `cardView`:
"`VoiceCard` → `InfoCardProps`". `VoiceStageView.cards` (RFC-003) es una lista. RFC-003 dice
"con una tarjeta, se achica y baja".

**Qué habría que adivinar:** las variantes de la unión y sus datos; cuándo se borran las
tarjetas del turno anterior (el comprobante "se cierra con la cruz", así que no se va solo);
cuántas conviven (una propuesta, un comprobante viejo y dos "Grabado sin señal" a la vez); el
orden; qué hace `onClose` en cada una (por ejemplo, cerrar "Pregunta" mientras la app escucha); y
qué tarjeta sale para cada `Resolution` de un audio guardado que no es una escritura válida:
`Rejected`, `Question`, `NotUnderstood` y `CorrectionProposal`. El RFC solo cubre "entendido" y
"consulta". La `key` de cada tarjeta tampoco está dicha (R45).

**Agregar:**

```ts
export enum VoiceCardKind {
  RainProposal, MovementProposal, CorrectionProposal, Receipt, RainAnswer, LotAnswer,
  Question, NotUnderstood, Rejected, NoMicrophone, AudioSaved, RecordedOffline,
}
```

> Una tarjeta de turno por vez: al tocar el orbe para escuchar se quitan todas las de turno. Las
> de cola (`RecordedOffline`, `key = "pending-<id>"`) se acumulan debajo, de la más vieja a la más
> nueva, y no las quita el turno. Cierre (`onClose`) de `Receipt`, `RainAnswer`, `LotAnswer`,
> `AudioSaved`, `NoMicrophone` y `NotUnderstood`: la quita. `Question`: la quita y descarta el
> pedido en curso. Un audio guardado cuyo resultado es `Rejected`, `Question` o `NotUnderstood`
> se muestra como `RecordedOffline` con el mensaje (la explicación, la pregunta o "No se entendió")
> y solo el botón "Descartar". Uno que da `CorrectionProposal` ofrece "Anotar" y "Descartar".

Y un criterio por cada fila: "`cardView` tiene un test por cada `VoiceCardKind`".

---

## 4. [BLOQUEA] El contador "N guardados" no tiene dónde dibujarse

**Qué dice:** F13 y criterio 28: "la pantalla muestra cuántos hay guardados". RFC-004:
"`useVoiceStage` entrega `VoiceStageView` (reemplaza al del RFC-003)". RFC-003: "el RFC-004
reemplaza el contenido del hook… el componente no cambia".

**Problema:** `VoiceStageView` no tiene un campo para el contador y el design system no tiene una
pieza para dibujarlo. La tarjeta "Audio guardado" (RFC-003) es un mensaje que se puede cerrar: al
cerrarla, el contador se pierde, y J4 del PRD lo quiere arriba, visible.

**Agregar** (en este RFC, y marcarlo como cambio a RFC-003):

> `VoiceStageView` suma `pendingCount: number`. `VoiceStage` lo dibuja como un renglón de texto
> ("1 guardado", "2 guardados") sobre el subtítulo, con `AppText`, solo si es mayor que cero. Se
> corrige la frase de RFC-003 "el componente no cambia" por "el componente suma `pendingCount`".

Criterio: "Con un audio guardado, la pantalla muestra '1 guardado' aunque se haya cerrado la tarjeta
'Audio guardado', y el número baja a 0 al anotar o descartar".

---

## 5. [BLOQUEA] `SpeakerService.speak` no puede decir "empezó a sonar", y el fallback de 1,5 s lo necesita

**Qué dice:** `speak(text): Promise<void>; // termina cuando deja de sonar`. Y `FallbackSpeakerService`
"usa la voz del server y, si falla o no empieza a sonar en 1,5 segundos, la del teléfono".

**Problema:** con una promesa que se resuelve al terminar no se distingue "todavía no sonó" de "está
sonando". Para cumplir el criterio 17 la señal de inicio tiene que existir. Tampoco dice cómo
`ServerSpeakerService` reproduce el `audio/mpeg` (R58 pide verificarlo: `expo-audio` y qué se
escribe en disco), cómo convive con la grabación en el mismo módulo, qué hace `stop()` con la
promesa pendiente, ni qué pasa si el motor del teléfono nunca avisa que terminó (F16: ningún estado
dura más de 20 s).

**Agregar** (en el contrato y en la implementación):

```ts
export interface SpeakerService {
  speak(text: string, onStarted?: () => void): Promise<void>; // se resuelve al terminar o al llamar stop()
  stop(): void;
}
```

> `ServerSpeakerService` llama a `onStarted` en el primer instante en que suena el audio.
> `FallbackSpeakerService` arma un temporizador de `speakStartTimeoutMs` desde que llama; si
> `onStarted` no llegó o la voz del server falló, corta esa voz y llama a `PhoneSpeakerService` con
> el mismo texto. Se agrega el ajuste `speechMaxMs` (20000): `useSpeech` lo usa como tope y, al
> cumplirse, llama a `stop()` y avanza como si hubiera terminado.

Criterio nuevo: "`FallbackSpeakerService` tiene tests con dobles: voz del server que falla, voz que
no arranca en `speakStartTimeoutMs` y voz que arranca a tiempo (no llama a la del teléfono)".

---

## 6. La propuesta y su cuenta: cuándo empieza, cómo se dibuja y qué pasa si anotar falla

**Qué dice:** Paso 5 "Aparece la tarjeta y la app dice una oración"; paso 6 "Una propuesta espera 4
segundos"; `useProposal`: "anota al terminar `confirmMs`… Al anotar, se llama al `Register`… se
guarda `lastRecord`".

**Qué habría que adivinar:**
- Si la cuenta corre mientras la app dice la propuesta (`Speaking`) o empieza al terminar. En
  `Speaking`, un toque es "interrumpir" (RF-05) o "descartar la propuesta" (F7): choca.
- La frase hablada de la propuesta no figura en `spokenReply` (los ejemplos son de comprobantes y
  rechazos), aunque F3 pide una oración por turno.
- Cómo llega `progress` (0 a 1) a `AppButton` sin actualizar estado de React cada cuadro, que iría
  contra RNF-08 y R46.
- Qué muestra la tarjeta al volver del segundo plano ("queda esperando un toque": ¿la cuenta se
  reinicia o se oculta?).
- `Register` revalida (RFC-002, criterio 19) y puede devolver una falla ("ya no alcanzan los
  animales"): ¿qué tarjeta sale? Lo mismo para "Anotar" desde la cola.
- Cuándo se actualiza `lastRecord`: el `RainReceipt` y el `MovementReceipt` (RFC-002) no tienen
  discriminante; hay que armar el `LastRecord` y decir si se actualiza también al anotar desde la
  cola.

**Agregar** (sección "La cuenta"):

> La propuesta se dice entera ("Voy a anotar 18 milímetros de lluvia de ayer"); la cuenta de
> `confirmMs` empieza cuando termina de hablar. `useProposal` entrega `progress` en pasos de 100 ms
> (10 actualizaciones por segundo). Al volver del segundo plano la tarjeta muestra los botones sin
> cuenta (`progress` indefinido). Si `Register` devuelve una falla, se muestra `Rejected` con
> `spokenReply` y no se cambia `lastRecord`. `lastRecord` se arma con el recibo (`{ kind: Rain,
> record }` o `{ kind: Movement, movement }`) cada vez que un `Register` o un `ApplyCorrection`
> tiene éxito, incluido el de la cola.

---

## 7. Preguntas: el contador, el reinicio y "nadie contestó" no están precisos

**Qué dice:** "Con `maxQuestionsInARow` preguntas seguidas sin completar, o si nadie contesta,
descarta el pedido, lo dice y muestra la tarjeta de ejemplos" y la tabla de ajustes (`2`).

**Qué habría que adivinar:**
- Con valor 2, ¿se descarta al responder la segunda pregunta (PRD: "después de dos preguntas
  seguidas el pedido sigue incompleto") o antes de hacerla?
- Cuándo vuelve a 0 el contador (pedido completo, pedido nuevo, descarte, toque cancelando).
- Si el historial se vacía al descartar. Si no, el audio siguiente se interpreta como respuesta
  de la pregunta vieja.
- "Nadie habló" en un turno normal vuelve a reposo (criterio 14), pero con una pregunta pendiente
  descarta el pedido (criterio 26): la fase `Listening` necesita saber si hay una pregunta.
- Qué entra al historial y cuándo: la pregunta que se dice, la propuesta, el comprobante, un turno
  cancelado. Y qué pasa si la respuesta a una pregunta cae a la cola por falta de red (esa cola
  entiende sin historial, así que el pedido se pierde).

**Agregar:**

> Se descarta cuando la persona contesta una pregunta y el resultado vuelve a ser `Question`, con
> `questionsInARow` ya en `maxQuestionsInARow`. El contador vuelve a 0 con cualquier resultado que
> no sea `Question`, y con el descarte. Al descartar, al cancelar y al tocar la cruz de la tarjeta
> `Question` se vacía el historial. El historial recibe un turno `{ said: transcript, replied:
> <texto hablado> }` por cada resolución (propuesta, respuesta, pregunta, rechazo); los turnos
> cancelados o que van a la cola no entran. Si el audio de una respuesta cae a la cola, se vacía
> el historial y la tarjeta `AudioSaved` dice que ese audio se entenderá solo.

Criterios: "Con `maxQuestionsInARow` = 2, la tercera vez incompleta no se pregunta: se descarta" y
"Dicha una cosa distinta como respuesta, se trata como pedido nuevo y el contador vuelve a 0"
(F15, que hoy no tiene criterio).

---

## 8. Escuchar: toque durante la apertura del micrófono, 100 ms, permiso y fórmula de volumen

**Qué dice:** Paso 1 "Si falta el permiso se pide". Riesgos: "Un toque mientras se abre el micrófono
no abre otro". F1: "la pantalla lo muestra en menos de 100 ms". `ExpoAudioRecorderService`:
"`level` va de 0 a 1 a partir de los decibeles".

**Qué habría que adivinar:**
- `permission()` y `requestPermission()` devuelven solo `Granted` o `Denied`: no se puede distinguir
  "nunca se preguntó" de "denegado". Si el sistema ya no muestra el diálogo (denegado con "no
  volver a preguntar"), la tarjeta "Sin micrófono" tiene que salir sin loop.
- `permission` + `requestPermission` + `start` son asíncronos. Para cumplir los 100 ms, el orbe debe
  pasar a `Listening` en el toque, antes de que `start` termine. Entonces el segundo toque llega con
  la fase `Listening` y detendría un grabador que todavía no empezó, contra "no abre otro".
- La conversión de decibeles a `level` no está dada y `speechLevel` = 0,65 depende de ella.
- `listeningVerdict`: no hay firma (qué recibe, qué devuelve, si el límite es inclusivo).

**Agregar:**

> El toque en `Idle` pasa a `Listening` en el mismo cuadro y marca `recorderStarting`; mientras
> esté en `true`, `OrbPressed` se ignora. Si el permiso se deniega, vuelve a `Idle` con la tarjeta.
> `permission()` devuelve `Denied` también cuando nunca se preguntó. `level = clamp((decibeles + 60) /
> 60, 0, 1)` (ajustar con el research y dejarlo en `constants.ts`). `listeningVerdict({ elapsedMs,
> sinceLastVoiceMs: number | null, heardVoice })` devuelve `Continue | Stop | CancelNoSpeech`; los
> límites son inclusivos (`>=`).

Criterio nuevo (F1): "Del toque al estado `Listening` en pantalla pasan menos de 100 ms medidos con
una marca de tiempo en el hook".

---

## 9. `ResolveRequestUseCase`: faltan las reglas de dato obligatorio, de `correct`, y la fecha de referencia no llega al modelo

**Qué dice:** "Si `question` no es `null`: `Question`", "Si falta un dato obligatorio y no vino
pregunta: `Question` con `question: null`". Las instrucciones al modelo no mencionan
`X-Reference-Day`.

**Problemas:**
- La lista de datos obligatorios por intención está solo en las instrucciones del modelo (lluvia:
  `millimeters`; movimiento: cuatro campos; consultas: `range` y `lot`). El caso de uso necesita
  la misma lista, y para `correct`, también: ¿qué falta si no vienen ni `quantity` ni `millimeters`?
- El primer punto pone `Question` antes de comprobar si falta algo: si el modelo manda `question`
  con todos los datos completos, la app pregunta de más. Y con `unknown` más una pregunta, nunca da
  `NotUnderstood`.
- Para `correct`, si el último registro es una lluvia, ¿se usa `millimeters` o `quantity`?
- `date` ("2026-11-12") necesita el día de referencia para completar año y mes ("el 12", "el
  martes"), pero las instrucciones no dicen que el server lo pase al modelo.

**Agregar** (en `ResolveRequestUseCase` y en "Instrucciones para el modelo"):

> Orden de decisión: (1) `unknown` → `NotUnderstood`; (2) si falta algún dato obligatorio de la
> intención → `Question` con `question` (o `null`); (3) validar con el `Preview` o la consulta.
> Obligatorios: `RegisterRain` → `millimeters`; `MoveAnimals` → `quantity`, `category`, `fromLot`,
> `toLot`; `RainQuery` → `range`; `LotQuery` → `lot`; `Correct` → `millimeters` si `lastRecord` es
> lluvia y `quantity` si es movimiento. Un `question` con los datos completos se ignora.
> El server incluye `X-Reference-Day` en las instrucciones ("hoy es AAAA-MM-DD") para resolver
> `date`.

Criterio 8 ampliado: "…`correct` con lluvia y con movimiento; un `lot` de más en una lluvia se
ignora; un `question` con datos completos se ignora; `unknown` con `question`".

---

## 10. Varios criterios no se pueden demostrar con un test, un comando o una comprobación concreta

**Qué dice:** `RULES.md` (R48 y R51) pide tests de casos de uso, mappers y transiciones, y deja lo
que solo se ve en el teléfono para probarse a mano y anotarse. El RFC no separa los dos grupos.

**Problemas por criterio:**
- **1 a 4 (server):** el server no tiene `npm test` (criterio 37 pide solo `typecheck`). Hacen falta
  comandos concretos y, para el `502`, una forma de forzarlo.
- **5 y 6:** "ningún archivo versionado contiene las claves" y "no guarda audio" no dicen cómo
  comprobarlo.
- **10:** "la tarjeta y la respuesta correctas" no dice cuáles; dependen de la semilla.
- **11, 13, 14, 19 a 22, 24 a 30, 33, 36:** son comportamiento de hooks y pantalla; no hay test
  (R51) y tampoco dice cómo provocar un server caído, una demora de más de 8 segundos o el
  segundo plano.
- **23:** "no hay camino que llame a un `Register` sin una propuesta, con un test del reducer": el
  reducer no llama a `Register` (lo hace `useProposal`) ni cubre "Anotar" desde la cola. Un test del
  reducer no lo prueba.
- **38:** "queda anotada" no tiene umbral (F4: 5 s como máximo, objetivo 3).

**Agregar** (nueva subsección "Cómo se demuestra"):

> **Server (criterios 1 a 6).** Con `npm start` y la clave real: `curl -i -X POST -H "Content-Type:
> audio/mp4" --data-binary @prueba.m4a http://localhost:8787/interpret-audio` (1);
> sin cuerpo (400), con `Content-Type: text/plain` (400), con un archivo de 2,1 MB (413) (2);
> con `-H "X-History: {{"` (200) (3); con `GEMINI_API_KEY=invalida npm start` (502) (2 y 4); `git grep -nE
> "AIza|sk_"` sin resultados fuera de `.env` y búsqueda de `fs` en `server/src` (5 y 6).
> **Teléfono (criterios 10, 11, 13, 14, 19 a 22, 24 a 30, 33, 36).** Se prueban a mano y se anotan
> en `docs/RESEARCH.md` con dispositivo y fecha. Server caído: parar el proceso. Demora: arrancar
> con `EXPO_PUBLIC_INTERPRET_TIMEOUT_MS=50`. Sin red: `adb shell cmd connectivity airplane-mode
> enable`. Permiso: `adb shell pm revoke com.fieldassistant.app android.permission.RECORD_AUDIO`.
> Segundo plano: `adb shell input keyevent KEYCODE_HOME`.
> **Criterio 10.** Se escribe la tabla de resultados esperados (con los números de `farmSeed`):
> lluvia 18 mm de ayer → "Anotado. Van N milímetros en el mes."; 40 vaquillonas del 3 al 5 →
> "Listo. Quedan 5 vaquillonas en el lote 3."; mes → total y renglones; lote 5 → total y
> categorías, con el valor que dé la semilla después del movimiento.
> **Criterio 23.** Se reemplaza por: "Un test de `useProposal` y `usePendingAudios` con dobles de
> `Register*` comprueba que ninguno se llama sin una propuesta mostrada o una tarjeta
> `RecordedOffline` confirmada".
> **Criterio 38.** "La mediana de diez turnos es de 3 s o menos y el máximo de 5 s o menos; si no,
> se corrige RNF-02 en el PRD antes de seguir".

---

## 11. Lo que el RFC nombra en su prosa y no aparece en ningún criterio

Archivos, comportamientos y restricciones citados en el texto que no tienen criterio:

| Dónde aparece | Falta el criterio |
| --- | --- |
| "Un estado que no es 200: `Server`", "respuesta que el mapper rechaza: `Unreadable`" | Un `Unreadable` y un `5xx` mandan el audio a la cola (RF-21) |
| `pendingAudioMapper`, `PendingAudioDocument` ("con sus tests") | Un documento mal formado devuelve una cola vacía; uno bien formado se lee igual que se guardó |
| `PendingAudioRepositoryImpl`, `FilePendingAudioLocalDataSource` | Un audio guardado se copia a la carpeta propia, y `remove` borra el archivo |
| `DiscardPendingAudioUseCase` y "Anotar" desde la cola | "Descartar" saca el audio de la cola y borra el archivo; "Anotar" llama al `Register` y saca el audio |
| Nueve de los diez ajustes ("pisable con `EXPO_PUBLIC_*`") | Los ajustes existen con esos valores y se pisan con la variable |
| `RefreshSignal` en `shared/presentation/states` | `shared` no importa de `domain`; `useTodaySummary` vuelve a pedir al cambiar la señal |
| `ExpoAudioRecorderService`: "consulta el permiso antes de pedirlo", `heardVoice` | Con permiso concedido no se vuelve a pedir; `heardVoice` es falso si el nivel nunca pasó `speechLevel` |
| `PhoneSpeakerService`: "elige una voz en español por su identificador" | La voz usada es en español (F3) |
| "El historial se pierde al cerrar la app" | Reabrir la app arranca sin historial |
| Riesgo "la app se cierra con una propuesta en cuenta" | Cerrar con una propuesta en cuenta no anota |
| Riesgo "dos toques seguidos" | Dos toques seguidos abren un solo micrófono |
| Línea de registro del server (tamaño, demora, pedido entendido) | Cada pedido deja una línea de registro sin guardar el audio |
| Riesgo "varios audios en la cola" | Tarjetas en el orden en que se grabaron |
| Lint | `npm run lint` pasa y comprueba R3 (`data/usecases` solo importa de `domain`) y R4 (`presentation` no importa `data`) |

**Agregar:** un criterio por fila, con ese texto, en la sección donde corresponda.

---

## 12. Criterios de las features que el RFC dice completar y que no cubre

Revisado contra `FEATURES.md`:

- **F1:** "tocar muestra la escucha en menos de 100 ms". Sin criterio (ver 8).
- **F3:** "la voz del teléfono que se elige es en español" y "no hay lista de mensajes ni burbujas".
  Sin criterio.
- **F4:** "entiende voseo y números dichos con palabras". Las cuatro frases de la consigna no los
  prueban ("Pasé 40", "18 mm"). Agregar al criterio 10 las frases "Mové quince terneros del dos al
  siete" y "Llovieron dieciocho milímetros ayer".
- **F12:** "después de dar el permiso y volver a la app, tocar el botón inicia la escucha". El criterio
  27 solo cubre la tarjeta y el botón. Agregar: "Tras conceder el permiso en los ajustes y volver,
  el toque en el orbe inicia la escucha".
- **F13:** "un audio guardado que es una consulta se contesta en una tarjeta" y "uno que no se
  entiende se muestra como tal, con Descartar". Sin criterio.
- **F15:** "si la respuesta habla de otra cosa, es un pedido nuevo" y "nunca se anota un pedido
  incompleto". Sin criterio (ver 7 y 9). El diálogo de J2 ("Mové quince terneros" → "¿De qué lote a
  qué lote?" → "Del dos al siete") debería ser el criterio 24 con esas frases.
- **F16:** "un error inesperado termina en reposo con un mensaje" y "ningún estado dura más de 20
  segundos sin cambiar o sin que se pueda salir". Sin criterio y sin camino en el flujo (ver 1 y 5).
  Agregar: "Si falla `start()` del grabador o la escritura de la cola, la app vuelve a `Idle` con un
  mensaje y una acción visible" y "`Speaking` termina como máximo en `speechMaxMs`".
- **F7, F11, F14:** cubiertas por 19 a 23 y 32. Mantener.

---

## 13. Server: lo que falta decir de los encabezados, de `/speak` y de la respuesta del proveedor

**Qué dice:** "`X-History`… Si falta o está mal formado, se entiende sin historial"; `X-Reference-Day`
"es el día en que se grabó"; errores `400`, `413`, `502`; `/speak` "hasta 300 caracteres".

**Qué habría que adivinar:**
- `X-Reference-Day` ausente o inválido: ¿`400`, o hoy del server? (El server no conoce la zona
  horaria del teléfono.)
- "Mal formado" de `X-History`: ¿más de 4 turnos se recortan o se descarta todo? ¿Un texto de 301
  caracteres? Además, 4 turnos con acentos codificados pueden superar el límite de encabezados de
  Node (16 KiB) y dar un error `431`.
- `/speak` con más de 300 caracteres, JSON inválido o `text` vacío: no hay código.
- Si el proveedor devuelve un JSON que no cumple la forma fija: ¿`502` o `200` con el JSON roto?
- Dónde viven el identificador del modelo, la voz y el modelo de voz: `.env.example` de RFC-001
  tiene solo tres variables.
- Otras rutas o métodos: `404` y `405`.

**Agregar** (sección "Rutas"):

> `X-Reference-Day` ausente o que no es una fecha real: `400`. `X-History`: si no es una lista, se
> ignora; si tiene más de 4 turnos se usan los últimos 4; cada texto se recorta a 300 caracteres.
> `/speak` con JSON inválido, `text` vacío o de más de 300 caracteres: `400`. Un JSON del proveedor
> que no cumple la forma fija: `502`. Rutas desconocidas: `404`; método distinto del de la ruta:
> `405`. El modelo, la voz y el modelo de voz van como constantes en `data/instructions.ts` y en cada
> proveedor, no en `.env`; las claves son las únicas variables.

Criterio 2 ampliado con estos códigos.

---

## 14. Faltan el cableado en `di`, el proveedor de `RefreshSignal` y cómo llega el teléfono al server local

**Qué dice:** el RFC define 4 casos de uso nuevos, 5 servicios, 1 repositorio y 1 datasource, pero
no dice nada de `di/container.ts`, `Dependencies` ni `App.tsx`. RFC-002 sí lo hace con su criterio 3.
Criterio 10 pide "contra el server local".

**Qué habría que adivinar:** qué se agrega a `Dependencies`, cómo se arma `FallbackSpeakerService`
(servidor y teléfono), dónde se monta el proveedor de `RefreshSignal`, y cómo llega el teléfono a
`localhost:8787` (el valor por defecto de `settings.serverUrl` apunta al propio teléfono).

**Agregar:**

> `di/container.ts` suma `AudioRecorderService`, `SpeakerService` (un `FallbackSpeakerService` con
> `ServerSpeakerService` y `PhoneSpeakerService`), `InterpreterService`, `PendingAudioRepository` y
> los cuatro casos de uso, todos por su contrato. `App.tsx` monta `RefreshSignalProvider` por
> encima de `HomeScreen`. Para probar con el server local: `adb reverse tcp:8787 tcp:8787`.

Criterio nuevo: "`di/container.ts` construye cada pieza nueva una sola vez y la expone por su
contrato; `npm run lint` pasa (R2, R4)".

---

## 15. `spokenReply` y los textos del turno no cubren todos los casos que el RFC obliga a decir

**Qué dice:** "`spokenReply` arma la oración con objetos por `ResolutionKind` y por
`FarmErrorCode`". Criterio 18: "un test por cada `ResolutionKind` y por cada `FarmErrorCode`".

**Problema:** el RFC exige decir cosas que no son un `ResolutionKind` ni un `FarmErrorCode`:
"no escuchó nada" (criterio 14), "guardé tu audio" (28), el pedido descartado tras las preguntas
(26), la frase de cada propuesta, un comprobante de corrección, un error inesperado, y el texto de
estado de la fase `Proposing`. Las tres frases de ejemplo de "No entendió" tampoco están
escritas. Con 7 `FarmErrorCode`, `NothingToCorrect` existe aunque F8 se recorte.

**Agregar:**

> `spokenReply` también cubre `NoSpeech` ("No te escuché, tocá y probá de nuevo."), `AudioSaved`
> ("Guardé tu audio."), `RequestDiscarded` ("No logré entenderte, probá con un ejemplo."),
> `UnexpectedFailure` ("Algo falló, probá de nuevo.") y `ProposalSpoken` por cada propuesta.
> Frases de ejemplo: "Llovieron 18 milímetros anoche", "Pasé 40 vaquillonas del lote 3 al 5",
> "¿Cuántos animales hay en el lote 5?". El texto de estado de `Proposing` es "Anotando…". Si F8
> se recorta, `NothingToCorrect` se quita del mapa junto con el caso de uso.

---

## 16. F8 (corregir): hay piezas sin definir

**Qué dice:** "`CorrectionProposal`", `PreviewCorrectionUseCase` con `lastRecord`; "`cardView` arma
cada tarjeta de la tabla del RFC-003".

**Problemas:**
- La tabla de tarjetas de RFC-003 no tiene "Propuesta de corrección", y RFC-004 la necesita.
- `ApplyCorrectionUseCase` devuelve `RainReceipt | MovementReceipt` sin discriminante: `cardView` y
  `spokenReply` tendrían que preguntar `'record' in receipt`, contra R30.
- `NothingToCorrect` con `lastRecord = null` debe pasar por `Rejected`, y esa frase no está escrita.

**Agregar:** una fila en la tabla de RFC-003 ("Propuesta de corrección · Marca · cantidad nueva
(grande), qué registro se corrige y 'Anotar' (con la cuenta) y 'Cancelar'"), y en RFC-004: "Para
distinguir un `RainReceipt` de un `MovementReceipt` se usa el `kind` del `LastRecord` que dio origen
a la corrección, no el tipo del recibo".

---

## 17. Reglas de capas: dos casos de uso que solo reenvían y la regla de un símbolo por archivo

**Qué dice:** `KeepAudioForLaterUseCase` ("guarda un audio en la cola") y
`DiscardPendingAudioUseCase` ("saca un audio de la cola"). `rules/requestDates.ts` ("la fecha de un
pedido").

**Problemas:**
- R14 prohíbe casos de uso que "solo reenvían una llamada a un service". Los dos de arriba llaman a
  un solo método del repositorio. R14 habla de services, no de repositorios, así que no la viola
  literalmente, pero se acerca. Hay que justificarlo en el RFC ("pasan por un caso de uso porque
  el repositorio toca el archivo y lo coordina con el datasource") o los hooks usan el repositorio.
- La política "si el server falla, el audio va a la cola" vive en `useUnderstanding` (un hook), y
  `RetryPendingAudiosUseCase` repite la mitad. Con R21 ("la lógica vive en hooks") es aceptable,
  pero dice solo "sube, resuelve y el historial".
- `requestDates.ts` tiene dos funciones (fecha de una lluvia, fecha de un movimiento): R17 pide un
  archivo por símbolo.

**Agregar:** "Los casos de uso `KeepAudioForLater` y `DiscardPendingAudio` existen porque el
repositorio de la cola persiste y copia archivos; los hooks no importan el repositorio (R14)".
Separar `requestDates.ts` en `rainDate.ts` y `movementDate.ts`, o dejar una sola función
`requestDate(kind, …)`.

---

## 18. Medir la latencia: nadie instrumenta el turno

**Qué dice:** criterio 38: "La latencia de diez turnos, desde que termina la escucha hasta la tarjeta,
queda anotada en `docs/RESEARCH.md`".

**Problema:** el server solo registra su propia demora (tamaño, demora, pedido), no la del teléfono;
la marca de "termina la escucha" y de "aparece la tarjeta" está en la app y no hay lugar para ella.

**Agregar:** "`useVoiceTurn` deja en el registro de desarrollo una línea por turno con los
milisegundos entre `RecordingFinished` y la primera vez que se dibuja la tarjeta; se anotan los
diez en `RESEARCH.md`".

---

**Veredicto:** no se puede implementar sin adivinar. El server, los casos de uso y los mappers
están bien definidos, pero el flujo del turno (eventos, transiciones, tarjetas, cola y voz) tiene
cinco contratos sin cerrar y varios criterios que no se pueden demostrar; con los cambios de los
hallazgos 1 a 5 y los criterios de 10 a 12 queda listo.

## Qué se hizo con estos hallazgos

Se reescribió el RFC-004. Aplicados: 1 (eventos, tabla de transiciones y estado del reducer), 2 (la cola no reenvía lo entendido, y una falla definitiva no frena a los demás), 3 (`VoiceCardKind` y qué tarjetas conviven), 4, 5 (`onStart` y tope al hablar), 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 (la tabla de textos), 16 y 18. De 17: se mantienen los dos casos de uso chicos de la cola, porque van a un repositorio y la presentación no accede a repositorios.

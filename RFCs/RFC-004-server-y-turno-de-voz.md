# RFC-004 · Server y turno de voz

| | |
| --- | --- |
| **Estado** | Pendiente |
| **Features** | F1, F3, F4, F12, F13, F14, F15 y F16 completas. El flujo de F5, F6, F7, F8, F9, F10 y F11. F2 conectada |
| **Predecesores** | RFC-001, RFC-002 y RFC-003 |
| **Sucesores** | RFC-005 |
| **Complejidad** | Alta |

## Resumen

Conecta todo: la persona toca el orbe, habla, y la app entiende, propone, anota, contesta en
voz alta y muestra la tarjeta. Incluye el server que guarda las claves y los errores con
salida. Al terminar, lo obligatorio de la consigna funciona de punta a punta contra el server
local. El teléfono llega al server con `adb reverse tcp:8787 tcp:8787`.

## El turno

### Paso a paso

1. **Tocar.** Si el permiso de micrófono nunca se pidió, se pide. Si está denegado, tarjeta
   "Sin micrófono" (F12).
2. **Escuchar.** El orbe pasa a escuchando y reacciona al volumen. Termina por silencio, por
   tope de tiempo o con otro toque (F1). Si nadie habló, la app lo dice y vuelve a reposo.
3. **Pensar.** El audio va al server con los últimos turnos. Si no hay red, tarda más de 8
   segundos o el server falla, el audio va a la cola (F13). Un toque cancela.
4. **Resolver.** Con lo entendido, un caso de uso decide: proponer una escritura, contestar
   una consulta, preguntar un dato, rechazar o "no entendí".
5. **Mostrar y hablar.** Aparece la tarjeta y la app dice una oración, con el mismo texto de
   subtítulo (F3).
6. **Anotar.** Cuando la app termina de decir la propuesta empieza una cuenta de 4 segundos; al
   terminar se anota sola, salvo que se cancele (F7). La tarjeta pasa a comprobante, la app
   dice el resultado y el resumen de arriba se actualiza (F11).

### Quién decide qué

- **El modelo de lenguaje** dice qué se pidió y con qué datos, y redacta la pregunta cuando
  falta un dato. Nunca aporta un número del campo.
- **Los casos de uso del RFC-002** validan y calculan.
- **La presentación** redacta lo que la app dice y arma las tarjetas, a partir de números y
  códigos.

### Fases y eventos

```ts
export enum VoicePhase { Idle = 'idle', Listening = 'listening', Thinking = 'thinking', Speaking = 'speaking', Proposing = 'proposing' }

export enum VoiceEvent {
  OrbPressed = 'orb_pressed',
  PermissionDenied = 'permission_denied',
  ListeningFinished = 'listening_finished',   // hay audio con voz
  NothingHeard = 'nothing_heard',
  Understood = 'understood',                  // hay una resolución
  UnderstandingFailed = 'understanding_failed', // el audio fue a la cola
  SpeechFinished = 'speech_finished',
  ProposalConfirmed = 'proposal_confirmed',   // un toque en "Anotar" o el fin de la cuenta
  ProposalCancelled = 'proposal_cancelled',
  WentToBackground = 'went_to_background',
  Failed = 'failed',                          // un error que nadie esperaba
}
```

De cada fase, a qué fase lleva cada evento. Un evento que no figura no cambia nada.

| Fase | Evento | Pasa a | Qué más pasa |
| --- | --- | --- | --- |
| Reposo | `OrbPressed` | Escuchando | Abre el micrófono |
| Reposo | `PermissionDenied` | Reposo | Tarjeta "Sin micrófono" |
| Escuchando | `OrbPressed` o `ListeningFinished` | Pensando | Cierra el micrófono y sube el audio |
| Escuchando | `NothingHeard` | Hablando | Dice que no escuchó. Después, reposo |
| Escuchando | `WentToBackground` | Reposo | Descarta la grabación |
| Pensando | `Understood` | Hablando | Muestra la tarjeta y dice la respuesta |
| Pensando | `UnderstandingFailed` | Hablando | Dice que guardó el audio. Después, reposo |
| Pensando | `OrbPressed` | Reposo | Cancela el turno; una respuesta que llegue tarde se ignora |
| Hablando | `SpeechFinished` u `OrbPressed` | La que quedó anotada como siguiente | Si fue un toque, corta la voz |
| Proponiendo | `ProposalConfirmed` | Hablando | Anota, muestra el comprobante y dice el resultado. Después, reposo |
| Proponiendo | `ProposalCancelled` | Reposo | Descarta la propuesta |
| Proponiendo | `OrbPressed` | Escuchando | Descarta la propuesta y abre el micrófono |
| Proponiendo | `WentToBackground` | Proponiendo | Frena la cuenta: queda esperando un toque |
| Cualquiera | `Failed` | Reposo | Dice que algo salió mal |

**La fase siguiente a hablar** la fija lo que se dijo, con un objeto por `ResolutionKind`: una
propuesta lleva a proponiendo, una pregunta lleva a escuchando, y todo lo demás a reposo.

El estado del reducer:

```ts
export type VoiceState = {
  phase: VoicePhase;
  afterSpeech: VoicePhase;         // a qué fase se va cuando la app termina de hablar
  turn: number;                    // sube con cada turno; sirve para ignorar una respuesta tardía
  card: VoiceCard | null;          // la tarjeta del turno en curso
  subtitle: string;
  questionsInARow: number;
  lastRecord: LastRecord | null;
  history: ConversationTurn[];
};
```

- Tocar el orbe mientras la app habla corta la voz siempre: eso cubre RF-05.
- Ninguna fase dura más de 20 segundos sin poder salir: escuchando tiene su tope, pensando
  tiene el corte de 8 segundos y hablando corta a los 15 (`maxSpeakingMs`).
- Si la app se cierra con una propuesta en cuenta, la propuesta se pierde: no se anota.

## El server

### Rutas

| Ruta | Entrada | Salida |
| --- | --- | --- |
| `POST /interpret-audio` | El cuerpo es el audio, con `Content-Type: audio/*`. Encabezados `X-History` y `X-Reference-Day` | `200` con el JSON de abajo |
| `POST /speak` | JSON `{ "text": string }`, hasta 300 caracteres | `200` con `audio/mpeg` |
| `GET /health` | | `200 { "ok": true }` |

Errores, siempre con el cuerpo `{ "error": string }`:

| Código | Cuándo |
| --- | --- |
| `400` | Cuerpo vacío, otro `Content-Type`, o un `text` vacío o de más de 300 caracteres |
| `413` | Audio de más de 2 MB |
| `502` | El proveedor falló, tardó de más o devolvió algo que no cumple la forma |

- **`X-History`:** los últimos turnos como JSON codificado para URL: una lista de hasta 4
  objetos `{ "said": string, "replied": string }`. Se toman los últimos 4 y cada texto se corta
  a 300 caracteres. Si falta o está mal formado, se entiende sin historial.
- **`X-Reference-Day`:** la fecha `AAAA-MM-DD` del día en que se grabó el audio. Se le pasa al
  modelo como "hoy". Si falta o está mal formada, se usa la fecha del server.
- El server no guarda audio ni datos en disco. Deja una línea de registro por pedido, con el
  tamaño, la demora y el pedido entendido, sin el audio ni el texto.
- El identificador del modelo y el de la voz son constantes en `data/providers.ts`, con los
  valores que anotó el research (I2 e I3).

### Lo que devuelve `/interpret-audio`

```json
{
  "intent": "register_rain | move_animals | rain_query | lot_query | correct | unknown",
  "transcript": "lo que se escuchó",
  "millimeters": 18,
  "day": "today | yesterday",
  "date": "2026-11-12",
  "quantity": 40,
  "category": "cow | heifer | calf | steer | bull",
  "fromLot": 3,
  "toLot": 5,
  "lot": 5,
  "range": "today | yesterday | week | month",
  "question": "¿De qué lote a qué lote?"
}
```

Todos los campos salvo `intent` y `transcript` pueden ser `null`.

### Instrucciones para el modelo

El pedido al proveedor lleva el audio, estas instrucciones y la forma fija de la respuesta:

- Qué es cada `intent` y sus datos obligatorios (la tabla de "Datos obligatorios", abajo).
- Si falta un dato obligatorio, `question` lleva una pregunta corta en español rioplatense
  que pide solo lo que falta. Si no falta nada, `question` es `null`.
- `day` cuando se dijo "hoy", "ayer" o "anoche" ("anoche" es `yesterday`); `date` cuando se
  dijo una fecha, resuelta contra el día de referencia. Si no se dijo el día, los dos van `null`.
- Los números dichos con palabras se devuelven como números. Entiende el voseo ("Mové", "Pasá").
- No inventa datos: lo que no se dijo va `null`.
- Con historial: si lo último que contestó la app fue una pregunta, la respuesta de la persona
  completa ese pedido y se devuelve el pedido entero. Si habla de otra cosa, es un pedido nuevo.
- Lo que no es ninguno de los pedidos es `unknown`.

### Estructura

```
server/src/
  domain/      Interpretation.ts  AudioInterpreter.ts  SpeechSynthesizer.ts
  data/        GeminiAudioInterpreter.ts  ElevenLabsSpeechSynthesizer.ts  instructions.ts  providers.ts
  http/        interpretAudio.ts  speak.ts  health.ts  readHistory.ts  readReferenceDay.ts  respond.ts
  main.ts
server/eval/   battery.ts  cases.ts  audios/
```

Los conjuntos cerrados del server son objetos `as const` (R55).

## La app

### Contratos nuevos (`domain`)

```ts
// enums
export enum IntentKind {
  RegisterRain = 'register_rain', MoveAnimals = 'move_animals', RainQuery = 'rain_query',
  LotQuery = 'lot_query', Correct = 'correct', Unknown = 'unknown',
}
export enum RelativeDay { Today = 'today', Yesterday = 'yesterday' }
export enum MicrophonePermission { Granted = 'granted', Denied = 'denied', NotAsked = 'not_asked' }
export enum InterpreterErrorCode {
  Offline = 'offline', Timeout = 'timeout', Server = 'server',   // pasajeras: se reintenta
  Refused = 'refused', Unreadable = 'unreadable',                // definitivas: no se reintenta
}
export enum ResolutionKind {
  RainProposal = 'rain_proposal', MovementProposal = 'movement_proposal',
  CorrectionProposal = 'correction_proposal', RainAnswer = 'rain_answer', LotAnswer = 'lot_answer',
  Question = 'question', Rejected = 'rejected', NotUnderstood = 'not_understood',
}

// entities
export type Interpretation = {
  intent: IntentKind; transcript: string;
  millimeters: number | null; day: RelativeDay | null; date: DateText | null;
  quantity: number | null; category: AnimalCategory | null;
  fromLot: number | null; toLot: number | null; lot: number | null;
  range: RainRange | null; question: string | null;
};
export type ConversationTurn = { said: string; replied: string };
export type RecordedAudio = { uri: string; mimeType: string; heardVoice: boolean };
export type PendingAudio = { id: number; uri: string; mimeType: string; recordedOn: DateText };
export type InterpreterFailure = { code: InterpreterErrorCode };
export type Resolution =
  | { kind: ResolutionKind.RainProposal; proposal: RainProposal }
  | { kind: ResolutionKind.MovementProposal; proposal: MovementProposal }
  | { kind: ResolutionKind.CorrectionProposal; proposal: CorrectionProposal }
  | { kind: ResolutionKind.RainAnswer; summary: RainSummary }
  | { kind: ResolutionKind.LotAnswer; stock: LotStock }
  | { kind: ResolutionKind.Question; question: string | null }   // null: pregunta genérica
  | { kind: ResolutionKind.Rejected; failure: Failure }
  | { kind: ResolutionKind.NotUnderstood };

// services
export interface AudioRecorderService {
  permission(): Promise<MicrophonePermission>;
  requestPermission(): Promise<MicrophonePermission>;
  start(onLevel: (level: number) => void): Promise<void>;   // level de 0 a 1
  stop(): Promise<RecordedAudio>;
  cancel(): Promise<void>;
}
export interface SpeakerService {
  speak(text: string, onStart?: () => void): Promise<void>;   // termina cuando deja de sonar
  stop(): void;
}
export interface InterpreterService {
  interpret(input: {
    audio: { uri: string; mimeType: string };
    history: ConversationTurn[];
    referenceDay: DateText;
  }): Promise<Result<Interpretation, InterpreterFailure>>;
}

// repositories y datasources
export interface PendingAudioRepository {
  list(): Promise<PendingAudio[]>;
  add(audio: RecordedAudio, recordedOn: DateText): Promise<PendingAudio>;
  remove(id: number): Promise<void>;
}
export interface PendingAudioLocalDataSource {
  read(): Promise<unknown | null>;
  write(document: unknown): Promise<void>;
  keep(uri: string): Promise<string>;      // copia el audio a la carpeta de la app y devuelve la ruta nueva
  discard(uri: string): Promise<void>;
}
```

### Casos de uso

| Contrato | Entrada | Devuelve | Qué hace |
| --- | --- | --- | --- |
| `ResolveRequestUseCase` | `{ interpretation, referenceDay, today, lastRecord }` | `Resolution` | Decide qué hacer con lo entendido |
| `KeepAudioForLaterUseCase` | `{ audio, recordedOn }` | `PendingAudio` | Guarda un audio en la cola |
| `RetryPendingAudiosUseCase` | `{ today, lastRecord, alreadyResolved: number[] }` | `{ waiting: number; resolved: ResolvedAudio[] }` | Reintenta los audios que todavía no se entendieron |
| `DiscardPendingAudioUseCase` | `{ id }` | nada | Saca un audio de la cola y borra su archivo |

`ResolvedAudio` es `{ pending: PendingAudio; resolution: Resolution }`.

**Datos obligatorios de cada pedido:**

| `intent` | Obligatorios | La fecha |
| --- | --- | --- |
| `register_rain` | `millimeters` | `date`; o el día de referencia si `day` es hoy o `null`; o el día anterior si es ayer |
| `move_animals` | `quantity`, `category`, `fromLot`, `toLot` | El día de referencia |
| `rain_query` | `range` | |
| `lot_query` | `lot` | |
| `correct` | `quantity` o `millimeters` (se usa el que venga) | |

**`ResolveRequestUseCase`** recibe por constructor los casos de uso del RFC-002. Elige qué
hacer con un objeto `Record<IntentKind, …>`. En este orden:

1. `unknown`: `NotUnderstood`.
2. `question` no es `null`: `Question` con esa pregunta.
3. Falta un dato obligatorio: `Question` con `question: null`.
4. Lluvia y movimiento llaman a su `Preview`. Si falla: `Rejected` con la falla.
5. Las consultas llaman a su caso de uso. Un lote que no existe: `Rejected`.
6. `correct` llama a `PreviewCorrectionUseCase` con `lastRecord`.

Cada pedido lee solo sus campos: un `lot` que venga en una lluvia se ignora.

**`RetryPendingAudiosUseCase`** recorre la cola en orden y saltea los de `alreadyResolved`.
Entiende cada audio con su `recordedOn` como día de referencia y sin historial.

- Con una falla pasajera (`Offline`, `Timeout`, `Server`) corta: ese audio y los siguientes
  quedan esperando.
- Con una falla definitiva (`Refused`, `Unreadable`) el audio vuelve como `NotUnderstood`, y
  sigue con el próximo.
- Los que se entienden vuelven con su `Resolution`. Siguen en la cola hasta que la persona los
  confirma o los descarta.
- `waiting` es cuántos quedan sin entender.

### Implementación (`data`)

```
data/
  usecases/      ResolveRequestUseCaseImpl.ts  KeepAudioForLaterUseCaseImpl.ts
                 RetryPendingAudiosUseCaseImpl.ts  DiscardPendingAudioUseCaseImpl.ts
                 rules/requestDates.ts          la fecha de un pedido
                 rules/requiredData.ts          qué datos pide cada pedido
                 (cada uno con su test)
  services/      ExpoAudioRecorderService.ts    graba con expo-audio y mide el volumen
                 ServerSpeakerService.ts        pide el audio a /speak y lo reproduce
                 PhoneSpeakerService.ts         la voz del teléfono, con expo-speech
                 FallbackSpeakerService.ts      prueba una voz y, si falla o tarda, usa la otra
                 ServerInterpreterService.ts    sube el audio a /interpret-audio
                 ScriptedAudioRecorderService.ts  audio de prueba en lugar del micrófono
                 spanishVoice.ts                función pura: elige una voz en español de una lista (con su test)
  repositories/  PendingAudioRepositoryImpl.ts  (con su test)
  datasources/   FilePendingAudioLocalDataSource.ts
  models/        InterpretationResponse.ts  PendingAudioDocument.ts
  mappers/       interpretationMapper.ts  pendingAudioMapper.ts   (con sus tests)
```

- **`ExpoAudioRecorderService`** graba en AAC. La librería entrega el volumen en decibeles, y
  `level` es `(decibeles + 60) / 60`, acotado entre 0 y 1. `heardVoice` dice si el nivel pasó
  `speechLevel` en algún momento. `permission()` consulta sin pedir.
- **`ServerInterpreterService`** sube el archivo con los dos encabezados y corta a los 8
  segundos (`Timeout`). Sin red: `Offline`. Un `5xx`: `Server`. Un `4xx`: `Refused`. Una
  respuesta que el mapper rechaza: `Unreadable`.
- **`interpretationMapper`** comprueba cada campo de la respuesta: es el borde donde se valida
  (R35). Un valor fuera de los enums o de otro tipo invalida la respuesta.
- **`FallbackSpeakerService`** usa la voz del server. Si falla, o si `onStart` no llegó en
  `speakStartTimeoutMs`, la corta y usa la del teléfono con el mismo texto.
- **`PhoneSpeakerService`** elige con `spanishVoice` una voz cuyo idioma empieza con `es`, y la
  pide por su identificador.
- **`FilePendingAudioLocalDataSource`** guarda la lista en `pending.json` y los audios en una
  carpeta propia, dentro de los documentos de la app.
- **`di`:** `Dependencies` suma `recorder`, `speaker`, `interpreter`, `resolveRequest`,
  `keepAudioForLater`, `retryPendingAudios` y `discardPendingAudio`.

### Ajustes

Se suman a `core/configs/settings.ts`, cada uno con su variable `EXPO_PUBLIC_*`, leída con su
nombre literal. Los números pasan por `readNumber(raw: string | undefined, fallback: number)`,
que devuelve `fallback` si el valor falta, está vacío o no es un número finito.

| Ajuste | Valor | Para qué |
| --- | --- | --- |
| `speechLevel` | 0,65 | Volumen, de 0 a 1, a partir del cual hay voz. Lo corrige el research (I1) |
| `silenceMs` | 2500 | Silencio que cierra la escucha |
| `noSpeechMs` | 8000 | Sin voz en este tiempo, se cancela |
| `maxRecordingMs` | 20000 | Tope de una escucha |
| `interpretTimeoutMs` | 8000 | Espera máxima al server |
| `speakStartTimeoutMs` | 1500 | Espera a que suene la voz del server |
| `maxSpeakingMs` | 15000 | Tope de una respuesta hablada |
| `confirmMs` | 4000 | La cuenta de una propuesta |
| `historyTurns` | 4 | Turnos que viajan con cada audio |
| `retryQueueMs` | 20000 | Cada cuánto se reintenta la cola |
| `maxQuestionsInARow` | 2 | Preguntas seguidas que se toleran |

### Presentación: feature `voice`

```
presentation/features/voice/
  states/
    VoicePhase.ts  VoiceEvent.ts  VoiceState.ts
    voiceTransitions.ts      objeto: fase + evento → fase
    voiceReducer.ts
    VoiceCard.ts             las tarjetas del turno, como unión con su enum
    listeningVerdict.ts      función pura: seguir, cortar o cancelar
    (cada uno con su test)
  hooks/
    useVoiceTurn.ts          arma el turno con los hooks de abajo
    useListening.ts          permiso, grabar y cuándo cortar
    useUnderstanding.ts      subir, resolver y el historial de turnos
    useProposal.ts           la cuenta, anotar y cancelar
    usePendingAudios.ts      la cola: guardar, reintentar, confirmar y descartar
    useSpeech.ts             decir un texto y poder cortarlo
    soundQueue.ts            la cola: un sonido a la vez (con su test)
    useVoiceStage.ts         entrega VoiceStageView (reemplaza al del RFC-003)
    replies/
      spokenReply.ts         función pura: lo que la app dice en cada caso
      cardView.ts            función pura: VoiceCard → InfoCardProps
      (con sus tests)
    constants.ts             todos los textos que la app dice o muestra
```

**Tarjetas.**

```ts
export enum VoiceCardKind {
  Proposal = 'proposal', Receipt = 'receipt', RainAnswer = 'rain_answer', LotAnswer = 'lot_answer',
  Question = 'question', Rejected = 'rejected', NotUnderstood = 'not_understood',
  MicrophoneDenied = 'microphone_denied', AudioSaved = 'audio_saved',
  SavedProposal = 'saved_proposal', SavedAnswer = 'saved_answer', SavedNotUnderstood = 'saved_not_understood',
}
```

`VoiceCard` es una unión con `kind` y los datos que cada tarjeta necesita. `cardView` arma el
`InfoCardProps` de cada una con un objeto por `VoiceCardKind`, según la tabla del RFC-003.

- **Una sola tarjeta del turno a la vez:** la del turno nuevo reemplaza a la anterior.
- **Debajo, una tarjeta por cada audio guardado que ya se entendió**, en el orden en que se
  grabaron:

| El audio guardado resultó | Tarjeta | Botones |
| --- | --- | --- |
| Una propuesta | "Grabado sin señal", con lo entendido | "Anotar" y "Descartar", sin cuenta |
| Una consulta | Su respuesta | La cruz, que lo saca de la cola |
| Un rechazo | El rechazo, con su explicación | "Descartar" |
| Una pregunta, una corrección o no entendido | "No se entendió lo que grabaste" | "Descartar" |

**`listeningVerdict`** recibe `{ elapsedMs, msSinceVoice, heardVoice }` y los ajustes, y
devuelve un enum: seguir, terminar o cancelar.

- Termina si ya hubo voz y pasaron `silenceMs` de silencio, o si se llegó a `maxRecordingMs`.
- Cancela si no hubo voz y pasaron `noSpeechMs`.

**Las reglas del turno.**

- **Un toque mientras se abre el micrófono** no abre otro: la fase ya es escuchando.
- **Un sonido a la vez.** Todo lo que suena pasa por una sola cola: un sonido que se pide
  mientras otro suena espera a que termine, en vez de pisarlo. Empezar un turno o cancelar
  corta lo que suena y descarta lo que esperaba. Un sonido que no avisa que terminó en 20
  segundos no traba la cola. La cola es una función sin React, `soundQueue.ts`, que usa
  `useSpeech`.
- **Historial.** Se guardan en memoria los últimos `historyTurns` turnos: lo que se escuchó
  (`transcript`) y lo que la app contestó. Viajan con cada audio. Se pierden al cerrar la app.
- **Preguntas.** Después de decir una pregunta, la app vuelve a escuchar sola.
  `questionsInARow` sube con cada pregunta y vuelve a 0 con cualquier otra respuesta. Si hay que
  preguntar por tercera vez seguida, o si nadie contesta una pregunta, la app descarta el
  pedido, lo dice y muestra la tarjeta "No entendió" con los ejemplos.
- **Un pedido nuevo en lugar de la respuesta** reemplaza al pendiente: el modelo lo devuelve
  como pedido nuevo.
- **La cuenta.** Empieza cuando la app termina de decir la propuesta. El botón "Anotar" recibe
  `countdown: { durationMs: confirmMs, paused }`. `useProposal` tiene su propio temporizador y,
  al terminar, despacha `ProposalConfirmed`. En segundo plano frena el temporizador y pone
  `paused` en verdadero.
- **Anotar** llama al `Register` que corresponde. Si falla porque los datos cambiaron, la
  tarjeta pasa a rechazo y la app lo dice. Si sale bien: la tarjeta pasa a comprobante, el
  comprobante queda como `lastRecord`, y se avisa para que el resumen se actualice.
- **Un único lugar llama a `Register`:** la función `confirm` de `useProposal`, que recibe una
  tarjeta `Proposal` o `SavedProposal`. Ningún otro archivo de la presentación lo llama.
- **El resumen se actualiza** con una señal que vive en `shared/presentation/states`
  (`RefreshSignal`): un número que sube con cada escritura, y un proveedor que `App.tsx` monta.
  `useTodaySummary` vuelve a pedir el resumen cuando cambia. No conoce el dominio.
- **La cola.** `usePendingAudios` reintenta cada `retryQueueMs` y cuando la app vuelve a estar
  a la vista. Recuerda en memoria los audios ya entendidos y se los pasa a
  `RetryPendingAudiosUseCase` como `alreadyResolved`, para no volver a enviarlos.
  `pendingCount` es cuántos audios hay en la cola.
- **Sin micrófono.** El botón de la tarjeta abre los ajustes de la app en el teléfono. Al
  volver con el permiso dado, tocar el orbe escucha.
- **La latencia.** El hook deja en el registro, por cada turno, los milisegundos entre el fin
  de la escucha y la tarjeta.

**Lo que la app dice.** `spokenReply` arma la oración con objetos por `ResolutionKind` y por
`FarmErrorCode`. Todos los textos viven en `constants.ts`:

| Caso | Texto |
| --- | --- |
| Propuesta de lluvia | "Voy a anotar 18 milímetros, lluvia de ayer." |
| Propuesta de movimiento | "Voy a pasar 40 vaquillonas del lote 3 al 5." |
| Lluvia anotada | "Anotado. Van 56 milímetros en el mes." |
| Movimiento anotado | "Listo. Quedan 5 vaquillonas en el lote 3." |
| Respuesta de lluvia | "Este mes llovieron 56 milímetros." / "Este mes no llovió." |
| Respuesta de lote | "En el lote 5 hay 105 animales." |
| No alcanzan los animales | "En el lote 3 hay 12 novillos, no 500." |
| Lote que no existe | "El lote 12 no existe." |
| Pregunta sin texto | "¿Me lo decís de nuevo, con todos los datos?" |
| No entendió | "Eso no lo sé." |
| Nadie habló | "No te escuché." |
| Audio guardado | "Guardé tu audio. Lo anoto cuando vuelva la señal." |
| Pedido descartado | "No llegué a entenderlo. Probá decirlo de una." |
| Error inesperado | "Algo salió mal. Probá de nuevo." |
| Ejemplos | "Llovieron 18 milímetros anoche", "Pasé 40 vaquillonas del lote 3 al 5", "¿Cuánto llovió este mes?" |

Los números de la tabla son de ejemplo: salen de los datos. Hay un texto por cada
`FarmErrorCode`.

**De fase a pantalla.** Dos objetos `Record<VoicePhase, …>` traducen la fase al estado del
orbe y al texto de estado. Proponiendo se ve como reposo.

## Herramientas de prueba

Sin estas dos, cada criterio de voz depende de que una persona hable.

### Audio de prueba en lugar del micrófono

- **`ScriptedAudioRecorderService`** (`data/services`) cumple `AudioRecorderService` sin abrir
  el micrófono. Cada "grabación" baja el audio que haya en ese momento en la dirección del
  ajuste `scriptedAudioUrl` (`EXPO_PUBLIC_SCRIPTED_AUDIO_URL`). El resto del turno corre igual.
  - El permiso siempre está dado.
  - Si hay un audio en la dirección, informa niveles por encima de `speechLevel` durante dos
    segundos y después silencio, y devuelve el archivo con `heardVoice` en verdadero.
  - Si no hay ninguno, informa silencio: el turno termina como "nadie habló".
- `di/container.ts` lo elige cuando el ajuste tiene valor; sin el ajuste, usa el micrófono.
- **Cómo se usa:** se sirve una carpeta en el puerto 8899 de la computadora, se conecta con
  `adb reverse tcp:8899 tcp:8899` y se levanta Metro con
  `EXPO_PUBLIC_SCRIPTED_AUDIO_URL=http://localhost:8899/next.m4a`. Para decir una frase se
  copia su audio como `next.m4a`.
- **`scripts/make-audio.sh "frase" archivo.m4a`**, en la raíz del repositorio, arma un audio
  con la voz de la computadora (`say` y `afconvert`, solo en macOS).
- Con esto el agente `qa` puede probar un turno completo en el emulador.

### Batería automática del server

- **`server/eval/battery.ts`**, que corre con `npm run eval`: le manda al modelo real una lista
  de casos y compara lo entendido con lo esperado. Usa el mismo `AudioInterpreter` que la ruta.
- **`server/eval/cases.ts`** tiene los casos: el audio, el historial si lo lleva, y lo
  esperado (el pedido, sus datos y si tiene que venir una pregunta). Como mínimo, las frases de
  `docs/BATERIA.md` que no dependen de lo anotado antes, más cinco de conversación: una
  respuesta que completa un pedido, un "¿y en el cuatro?", una corrección y dos cambios de tema.
- Los audios viven en `server/eval/audios/`, hechos con `scripts/make-audio.sh`, y se versionan.
- Imprime una tabla (lo dicho, lo transcripto, el pedido, los datos, la pregunta, la demora y
  si acertó) y un renglón de resumen con los aciertos y la latencia mínima, mediana y máxima.
- Espera entre un caso y otro para no pasar el límite de pedidos por minuto del proveedor. La
  espera es una variable del script.
- Se corre después de cada cambio en las instrucciones, en la forma del JSON o en el modelo, y
  el resultado se pega en `docs/RESEARCH.md`.

## Criterios de aceptación

**Server (F4)**

1. `POST /interpret-audio` con un audio válido devuelve `200` y un JSON con todos los campos
   de "Lo que devuelve". Se demuestra con `curl` y uno de los audios de prueba.
2. Con `curl`: sin cuerpo o con otro `Content-Type` devuelve `400`; con más de 2 MB, `413`; con
   una clave inválida en `.env`, `502`.
3. Un `X-History` mal formado o un `X-Reference-Day` ausente no hacen fallar el pedido.
4. `POST /speak` con un texto devuelve audio. Sin texto o con más de 300 caracteres, `400`.
5. Las claves se leen solo de `.env`: buscarlas en el repositorio y en `app/` no da resultados.
6. El server no escribe archivos: ningún archivo de `server/src` usa el sistema de archivos.
7. La línea de registro de cada pedido no trae el audio ni el texto escuchado.

**Entender y resolver (F4, F5, F6, F9, F10, F14)**

8. `interpretationMapper` acepta una respuesta bien formada y rechaza una con un campo fuera
   de los enums o de otro tipo.
9. `ResolveRequestUseCase` tiene tests para: lluvia de hoy, de ayer y con fecha; movimiento
   válido; movimiento rechazado; consulta de lluvia; consulta de un lote que no existe; dato
   que falta con pregunta y sin pregunta; corrección; `unknown`; y un campo de más, que se ignora.
10. Con `day` ayer y un día de referencia dado, la fecha de la lluvia es el día anterior a ese.
11. Con el campo recién instalado, dichas en este orden al teléfono contra el server local:
    - "Llovieron 18 milímetros anoche" propone 18 mm de ayer y, al anotar, dice el total del mes.
    - "Pasé 40 vaquillonas del lote 3 al 5" propone el movimiento y, al anotar, dice que quedan
      5 vaquillonas en el lote 3.
    - "¿Cuánto llovió este mes?" dice el total del mes y muestra un renglón por día.
    - "¿Cuántos animales hay en el lote 5?" dice 105 y muestra el detalle por categoría.
12. "Mové quince terneros del dos al siete" propone mover 15 terneros del lote 2 al 7: entiende
    el voseo y los números dichos con palabras.

**Escuchar (F1, F2)**

13. Tocar el orbe en reposo lo pasa a escuchando en el momento, y el orbe reacciona al volumen.
14. `listeningVerdict` tiene tests para: terminar tras `silenceMs` de silencio después de voz,
    cancelar tras `noSpeechMs` sin voz, y terminar en `maxRecordingMs`.
15. Tocar el orbe mientras escucha termina la escucha.
16. Si nadie habló, la app dice "No te escuché" y vuelve a reposo, sin llamar al server.
17. Dos toques seguidos al orbe abren una sola escucha.
18. El orbe muestra el estado que corresponde a cada fase.

**Hablar (F3)**

19. Cada turno termina con una oración dicha y el mismo texto en el subtítulo.
20. `FallbackSpeakerService` tiene tests con dobles: usa la segunda voz si la primera falla, y
    si la primera no empezó en `speakStartTimeoutMs`.
21. `spanishVoice` tiene tests: elige una voz en español, y devuelve `null` si no hay ninguna.
22. `spokenReply` tiene un test por cada `ResolutionKind`, por cada `FarmErrorCode` y por cada
    texto fijo de la tabla.
23. Tocar el orbe mientras la app habla corta la voz.

**Proponer y anotar (F7, F11)**

24. Una escritura muestra la tarjeta de propuesta. La cuenta empieza cuando la app termina de
    hablar. "Anotar" anota ya, "Cancelar" descarta, y al terminar la cuenta se anota sola.
25. Al anotar, la tarjeta pasa a comprobante y el resumen de hoy cambia sin recargar.
26. Tocar el orbe durante la cuenta descarta la propuesta y empieza a escuchar.
27. Si la app pasa a segundo plano durante la cuenta, no se anota sola: al volver, la propuesta
    sigue ahí esperando un toque.
28. Si los datos cambiaron y `Register` falla, la tarjeta pasa a rechazo y no se anota nada.
29. `Register` se llama solo desde `confirm`, en `useProposal`: buscar las llamadas en
    `presentation/` da ese único lugar, y su test comprueba que anota con una tarjeta de
    propuesta.
30. Lo anotado sigue ahí después de cerrar y volver a abrir la app.

**Preguntar (F15)**

31. Con un dato que falta, la app dice la pregunta y vuelve a escuchar sola.
32. La respuesta completa el pedido: con cada audio viajan los últimos `historyTurns` turnos.
33. Si en lugar de contestar se dice otro pedido, la app sigue con el pedido nuevo.
34. A la tercera pregunta seguida, o sin respuesta a una pregunta, la app descarta el pedido,
    lo dice y muestra la tarjeta de ejemplos. El reducer tiene tests para el contador.
35. Nunca se anota un pedido incompleto: `ResolveRequestUseCase` no llama a un `Preview` si
    falta un dato obligatorio.

**Errores con salida (F12, F13, F14, F16)**

36. Con el permiso denegado, tocar el orbe muestra la tarjeta "Sin micrófono", y su botón abre
    los ajustes. Después de dar el permiso, tocar el orbe escucha.
37. En modo avión, o con el server apagado, el audio se guarda, la app lo dice y la pantalla
    muestra cuántos hay guardados. Con `EXPO_PUBLIC_INTERPRET_TIMEOUT_MS=1` pasa lo mismo por
    demora.
38. Los audios guardados siguen ahí después de cerrar y abrir la app.
39. Al volver el server, en `retryQueueMs` o al volver a la app, aparece la tarjeta "Grabado
    sin señal" con "Anotar" y "Descartar". No se anota sola. "Descartar" la saca de la cola.
40. `RetryPendingAudiosUseCase` tiene tests para: el orden, la fecha de grabación como día de
    referencia, el corte con una falla pasajera, el audio con falla definitiva que vuelve como
    no entendido sin frenar a los demás, y los de `alreadyResolved`, que no se vuelven a enviar.
41. Un audio guardado que era una consulta muestra su respuesta, y uno que no se entiende
    muestra "No se entendió lo que grabaste" con "Descartar".
42. `pendingAudioMapper` acepta un documento bien formado y rechaza uno mal formado.
43. "No entendí" muestra la tarjeta con tres frases de ejemplo y no anota nada.
44. Un toque mientras la app piensa cancela el turno. Una respuesta que llega después se ignora.
45. `voiceTransitions` tiene tests: de toda fase se puede volver a reposo, `Failed` lleva a
    reposo desde cualquier fase, y un evento que no figura no cambia la fase.

**Corregir (F8, Should)**

46. "No, eran veinte" después de anotar propone la corrección, que pasa por la cuenta.

**Chequeos**

47. `npm run typecheck`, `npm run lint` y `npm test` pasan en `app/`, y `npm run typecheck` en
    `server/`.
48. Existen los once ajustes de la tabla, y `readNumber` tiene tests para: un número, sin
    valor, vacío y un texto que no es número.
49. La latencia de diez turnos, tomada del registro de la app, queda anotada en
    `docs/RESEARCH.md` con el dispositivo. Si la mediana pasa de 5 segundos, se anota y decide
    el usuario (RNF-02).

**Herramientas de prueba**

50. Con `EXPO_PUBLIC_SCRIPTED_AUDIO_URL` y un audio en esa dirección, tocar el orbe corre un
    turno completo sin abrir el micrófono. Sin audio en la dirección, termina como "nadie habló".
51. Sin esa variable, la app usa el micrófono.
52. `scripts/make-audio.sh` genera un `.m4a` a partir de una frase.
53. `npm run eval` corre todos los casos de `server/eval/cases.ts` y deja la tabla y el resumen.
54. El resultado de la batería quedó pegado en `docs/RESEARCH.md`. Si acierta menos de nueve de
    cada diez casos, se anota y se revisan las instrucciones antes de seguir.

**Un sonido a la vez**

55. `soundQueue` tiene tests: dos sonidos pedidos seguidos suenan uno después del otro; pedir
    silencio corta el que suena y descarta el que esperaba; y un sonido que nunca termina no
    traba al siguiente.

## Reglas que aplican

R1 a R18 (arquitectura y nombres), R19 a R23 (componentes), R29 a R39 (estilo), R40 a R47
(React), R48 a R51 (tests), R52 a R55 (server) y R58 (verificar las APIs).

## Riesgos y casos límite

- **Ruido de fondo por encima del umbral.** La escucha corta en `maxRecordingMs`. El umbral se
  ajusta con lo que midió el research.
- **Varios audios en la cola.** Se muestran todos, en el orden en que se grabaron.
- **Límite de pedidos del proveedor.** Si responde que hay demasiados pedidos, el server
  devuelve `502` y el audio va a la cola.
- **El server tarda en despertar.** El primer pedido puede pasar de 8 segundos e ir a la cola:
  se resuelve solo en el reintento.

# Plan · RFC-004 · Server y turno de voz

Seis pasos. Cada uno se detiene para la revisión del autor. Los pasos chicos (A, B y D) los
implementa y prueba el orquestador; los grandes (C, E y F) van por `dev` y `qa`.

| Paso | Objetivo | Estado |
| --- | --- | --- |
| A | El server: `/interpret-audio`, `/speak` y los errores | pendiente |
| B | Audios de prueba y la batería automática del server | pendiente |
| C | La app entiende y resuelve: contratos, ajustes, intérprete, `ResolveRequest` y la cola de audios | pendiente |
| D | Grabar y hablar: los servicios de micrófono, voces y la cola de sonidos | pendiente |
| E | El turno en pantalla: escuchar, pensar, hablar, proponer, anotar y preguntar | pendiente |
| F | Errores con salida, audios guardados, corrección, latencia y la prueba de punta a punta | pendiente |

Rama por paso, con su PR a `feature/rfc-004`: `feature/rfc-004-A` a `-F`.

**Builds:** ninguno previsto. `expo-audio` y `expo-speech` ya están en el APK desde el RFC-001,
y los ajustes de Android para abrir la configuración de la app vienen con React Native
(`Linking.openSettings`). El teléfono llega al server con `adb reverse tcp:8787 tcp:8787`.

---

## Paso A · El server

```
server/src/
  domain/   [+] Interpretation.ts  AudioInterpreter.ts  SpeechSynthesizer.ts
  data/     [+] GeminiAudioInterpreter.ts      un pedido con el audio, las instrucciones y la forma fija
            [+] ElevenLabsSpeechSynthesizer.ts el texto a mp3, con la voz "Sarah"
            [+] instructions.ts                lo que se le dice al modelo (RFC, "Instrucciones")
            [+] providers.ts                   modelo, voz y límite de tiempo, como constantes
  http/     [+] interpretAudio.ts  speak.ts  readHistory.ts  readReferenceDay.ts  respond.ts
            [~] health.ts (antes healthRouter.ts)  createApp.ts (las rutas y un manejo de errores en JSON)
  [~] main.ts
[-] server/scripts/interpret.ts  speak.ts (los reemplaza la batería del paso B y la ruta)
```

**Criterios:** 1 a 7.

**Cómo se comprueba:** `npm run typecheck` en `server/`, y `curl` contra el server local: un
audio de `server/scripts/samples/` da `200` con todos los campos; sin cuerpo y con otro
`Content-Type` dan `400`; un cuerpo de más de 2 MB da `413`; con una clave inválida, `502`;
`/speak` devuelve `audio/mpeg`, y `400` sin texto o con más de 300 caracteres. Buscar las claves
en el repositorio y el uso de `fs` en `server/src`.

---

## Paso B · Audios de prueba y la batería

```
[+] scripts/make-audio.sh         "frase" archivo.m4a, con say y afconvert (macOS)
server/eval/
  [+] battery.ts                  manda cada caso al modelo real y compara
  [+] cases.ts                    las frases de docs/BATERIA.md y cinco de conversación
  [+] audios/                     los .m4a de cada caso, versionados
server/package.json  [~] script "eval"
docs/RESEARCH.md     [~] el resultado de la batería
```

**Criterios:** 52 a 54.

**Cómo se comprueba:** `scripts/make-audio.sh` arma un `.m4a`; `npm run eval` imprime la tabla
y el resumen. Si acierta menos de 9 de cada 10, se frena y se revisan las instrucciones.

---

## Paso C · La app entiende y resuelve

```
app/src/domain/
  [+] enums/       IntentKind  RelativeDay  MicrophonePermission  InterpreterErrorCode  ResolutionKind
  [+] entities/    Interpretation  ConversationTurn  RecordedAudio  PendingAudio  InterpreterFailure  Resolution  ResolvedAudio
  [+] services/    AudioRecorderService  SpeakerService  InterpreterService
  [+] repositories/PendingAudioRepository   datasources: PendingAudioLocalDataSource
  [+] usecases/    ResolveRequest  KeepAudioForLater  RetryPendingAudios  DiscardPendingAudio
app/src/data/
  [+] usecases/    las cuatro implementaciones; rules/requestDates.ts  rules/requiredData.ts (con tests)
  [+] services/    ServerInterpreterService.ts (sube el audio, corta a los 8 s)
  [+] repositories/PendingAudioRepositoryImpl.ts (con test)
  [+] datasources/ FilePendingAudioLocalDataSource.ts (pending.json y una carpeta de audios)
  [+] models/      InterpretationResponse.ts  PendingAudioDocument.ts
  [+] mappers/     interpretationMapper.ts  pendingAudioMapper.ts (con tests)
app/src/core/configs/
  [~] settings.ts  los once ajustes y readNumber (con test)
app/src/di/        [~] Dependencies y container: interpreter, resolveRequest y la cola
```

**Criterios:** 8 a 10, 35, 40, 42 y 48.

**Cómo se comprueba:** los tests de `ResolveRequestUseCase` (cada caso del criterio 9),
`requestDates`, `RetryPendingAudiosUseCase` (criterio 40), los dos mappers y `readNumber`;
typecheck y lint.

---

## Paso D · Grabar y hablar

```
app/src/data/services/
  [+] ExpoAudioRecorderService.ts     graba en AAC, el volumen de 0 a 1 y heardVoice
  [+] ScriptedAudioRecorderService.ts baja un audio de prueba en lugar de grabar
  [+] ServerSpeakerService.ts         pide /speak y lo reproduce
  [+] PhoneSpeakerService.ts          expo-speech con una voz en español
  [+] FallbackSpeakerService.ts       la del server y, si falla o tarda, la del teléfono (con test)
  [+] spanishVoice.ts                 elige la voz (con test)
app/src/presentation/features/voice/hooks/
  [+] soundQueue.ts                   un sonido a la vez (con test)
app/src/di/   [~] recorder (micrófono o el de prueba según el ajuste) y speaker
```

**Criterios:** 20, 21, 51 y 55.

**Cómo se comprueba:** los tests de `FallbackSpeakerService`, `spanishVoice` y `soundQueue`;
typecheck y lint. En el teléfono, desde el catálogo, una grabación y una frase dicha con cada
voz.

---

## Paso E · El turno en pantalla

```
app/src/presentation/features/voice/
  states/   [+] VoicePhase  VoiceEvent  VoiceState  VoiceCard  voiceTransitions  voiceReducer
                listeningVerdict (cada uno con su test)
  hooks/    [+] useVoiceTurn  useListening  useUnderstanding  useProposal  useSpeech
            [~] useVoiceStage (deja el reposo fijo y arma la vista del turno real)
            [+] replies/spokenReply.ts  replies/cardView.ts (con tests)
            [+] constants.ts (todo lo que la app dice o muestra)
app/src/shared/presentation/states/
  [+] RefreshSignal (el número que sube con cada escritura y su proveedor)
app/src/presentation/features/home/hooks/
  [~] useTodaySummary (vuelve a pedir el resumen cuando cambia la señal)
app/src/App.tsx  [~] monta el proveedor de RefreshSignal
```

**Criterios:** 11 a 19, 22 a 26, 28, 29, 31 a 35, 43 a 45 y 50.

**Cómo se comprueba:** los tests de estados y respuestas; typecheck y lint. Turnos completos en
el teléfono con el audio de prueba (criterio 50) para las cuatro frases de la consigna, una
pregunta, "no entendí" y la cancelación al pensar. Las mismas con voz real quedan `MANUAL`.

---

## Paso F · Errores con salida, audios guardados y corrección

```
app/src/presentation/features/voice/hooks/
  [+] usePendingAudios.ts   guardar, reintentar cada retryQueueMs y al volver, confirmar y descartar
  [~] useVoiceTurn          la cola, el permiso denegado con su botón a los ajustes, el segundo plano
                            y la corrección; la latencia de cada turno en el registro
app/src/presentation/features/home/   [~] pendingCount en el encabezado
docs/RESEARCH.md   [~] la latencia de diez turnos, desde el teléfono
```

**Criterios:** 27, 30, 36 a 39, 41, 44, 46, 47 y 49.

**Cómo se comprueba:** typecheck, lint y todos los tests en `app/` y `server/`. En el teléfono:
modo avión y server apagado (guarda, avisa, cuenta y reintenta), `EXPO_PUBLIC_INTERPRET_TIMEOUT_MS=1`,
la cola después de cerrar y abrir, el permiso denegado, el segundo plano durante la cuenta y
"No, eran veinte". Diez turnos medidos para la latencia. Lo que pide voz real o tocar ajustes del
teléfono queda `MANUAL` con los pasos para probarlo.

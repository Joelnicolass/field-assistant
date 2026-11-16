# Lectura en frío · RFC-005 Extras y entrega

Pregunta: **¿qué tendría que adivinar para implementar este RFC?**
Leídos: `CHALLENGE.md`, `PRD.md`, `FEATURES.md`, `RULES.md`, `CLAUDE.md`, `RFCS.md`, los cinco RFC.
`VISUAL.md` no existe todavía: lo visual que delega en él no se cuenta como hueco (ver la lista al final).

Hallazgos ordenados por impacto. `[BLOQUEA]` = no se puede implementar (o el RFC mismo dice que no arranca) sin resolverlo.

---

## 1. [BLOQUEA] `VoicePhase.Waiting` es la sexta fase, y la condición de arranque del detector se contradice con entrar en esa fase

**Qué dice.** "Manos libres" → "**Quinta fase:** `VoicePhase.Waiting`". Y en `useHandsFree`: "Arranca el detector cuando está encendido, la app está a la vista y la fase es reposo; lo frena en cualquier otro caso."

**Problema.**
- RFC-004 ya define cinco fases: `Idle, Listening, Thinking, Speaking, Proposing`. `Waiting` sería la sexta. (El OrbState sí es el quinto.)
- Si `Waiting` es una fase del reducer distinta de `Idle`, apenas el detector arranca la fase pasa a `Waiting`, la condición "fase es reposo" deja de cumplirse y el hook frena el detector: bucle. Habría que adivinar si `Waiting` es una fase real o un derivado de (`Idle` + interruptor + detector activo).
- RFC-004 deja `VoiceEvent` como "enum de lo que puede pasar", sin lista. El RFC no dice qué eventos entran ni qué hace `Waiting` ante un toque, ni cómo vuelve a `Idle` (RFC-004 criterio 34 exige que de toda fase se pueda volver a `Idle`).
- Los "objetos de traducción a orbe y a texto de estado" no tienen archivo nombrado en RFC-004; hay que saber dónde tocarlos.
- Mientras Vosk tiene el micrófono, `expo-audio` no puede grabar bien: no dice que hay que `await stop()` antes de grabar, ni qué pasa con las primeras palabras tras la frase (la persona dice "frase, pedido" sin pausa o espera la vibración).
- `useHandsFree` necesita la fase y un "empezar escucha" de `useVoiceTurn`; la firma no está.

**Propongo agregar** (en "Manos libres"):
> `Waiting` es la **sexta** fase de `VoicePhase` (después de `Proposing`). Mientras el interruptor está encendido y la app a la vista, la fase en reposo es `Waiting`, no `Idle`. El detector corre en `Idle` y en `Waiting`, y solo ahí; en `Listening`, `Thinking`, `Speaking` y `Proposing` está parado. Eventos nuevos en `VoiceEvent`: `HandsFreeEnabled`, `HandsFreeDisabled`, `WakePhraseDetected`. Transiciones: `Idle + HandsFreeEnabled → Waiting`; `Waiting + HandsFreeDisabled → Idle`; `Waiting + (WakePhraseDetected | toque del orbe) → Listening`; el resto de las fases vuelve a `Waiting` si el interruptor sigue encendido y a `Idle` si no. Antes de empezar a grabar se espera a que `stop()` del detector termine. La escucha empieza **al vibrar**: la persona dice la frase, siente la vibración y habla; `noSpeechMs` cuenta desde ahí. Firma: `useHandsFree({ phase, appVisible, onWake })`. Los objetos `Record<VoicePhase, OrbState>` y `Record<VoicePhase, string>` están en `<archivo que fije RFC-004>`.

Y un criterio: **"El test de `voiceTransitions` recorre `Waiting` y comprueba que de ella se vuelve a `Idle`."**

---

## 2. [BLOQUEA] La batería de 20 frases no existe en ningún documento

**Qué dice.** "Prueba final" → "se corre la batería de 20 frases de la sección 8 del PRD"; criterio 6: "se corrió con voz real y el resultado quedó anotado."

**Problema.** La sección 8 del PRD no trae las frases: solo su composición (4 de la consigna, 3 con datos que faltan, 3 que una regla rechaza, 5 con ruido: son 15; las otras 5 no están definidas) y el umbral de 18 o más. Ningún RFC (ni el 004) manda escribirlas. Habría que inventar la lista, cuáles son las 5 restantes, qué es "dio bien" en cada una y dónde se anota. El criterio 6 tampoco repite el umbral ni dice qué hacer si da menos de 18.

**Propongo agregar:**
> **Batería.** Se escribe en `docs/BATERIA.md` antes de usar el teléfono: 20 frases, cada una con la frase, el resultado esperado (tarjeta y oración) y la categoría. Composición: las 4 de la consigna; 3 con dato faltante (por ejemplo "Mové quince terneros"); 3 que una regla rechaza ("Pasá 500 novillos del 3 al 5", "Del lote 12 al 3", "Pasá 10 vacas del 3 al 3"); 5 dichas con ruido de fondo; 5 libres (consulta de otro período, "hoy" y una fecha explícita para lluvia, una corrección si F8 entró, una frase que no es un pedido, una consulta de lote inexistente). Resultado: tabla en `docs/RESEARCH.md` con frase, qué pasó, "bien/mal" y la causa si falló.

Criterio 6 pasa a:
> 6. `docs/BATERIA.md` tiene las 20 frases con el reparto del PRD; se dijeron con voz real en el APK de release; `docs/RESEARCH.md` anota cuántas dieron el resultado esperado. Son 18 o más; si son menos, se anota la causa de cada fallo y qué se corrigió o se resignó en `DECISIONS.md`.

---

## 3. [BLOQUEA] Servidor publicado: Q1 abierta y el paso 1 no dice qué entrega ni cómo se comprueba

**Qué dice.** "Server publicado (F24)": "con https en el servicio que elija el usuario (Q1). Sin esa respuesta, el paso 1 no empieza." Criterio 1: "`GET /health` en una dirección https pública."

**Problema.**
- Q1 está abierta; el RFC mismo dice que bloquea. Hay que preguntarla antes de empezar.
- No dice qué archivos de despliegue quedan versionados (Dockerfile, `render.yaml`, etc.), en qué puerto escucha (RFC-001: 8787 fijo; los servicios dan `PORT`), ni que hace falta escuchar en `0.0.0.0`.
- RF-35 pide disponibilidad "mientras dure la evaluación": ningún criterio. Un plan gratuito que se duerme choca con el corte de 8 s de la app (`interpretTimeoutMs`): el primer pedido del evaluador iría a la cola.
- Criterio 1 solo prueba `/health`; `/interpret-audio` y `/speak` por https no se prueban.
- Prosa sin criterio: claves como variables del servicio; tope de gasto en cada proveedor (RNF-12).

**Propongo agregar** (paso 1):
> Antes de empezar se responde Q1 y se anota en `DECISIONS.md`: servicio, plan, hasta cuándo queda y qué pasa si se duerme (ping o plan sin dormir). El server escucha en `process.env.PORT` y en `0.0.0.0`. El archivo de despliegue queda versionado. Variables del servicio: `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, `PORT`.

Criterios nuevos:
> 1b. `curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: audio/m4a" --data-binary @prueba.m4a https://<server>/interpret-audio` da `200`, y `POST /speak` con `{"text":"hola"}` da `200` con `audio/mpeg`.
> 1c. Después de 30 minutos sin pedidos, `/interpret-audio` contesta en menos de `interpretTimeoutMs` (8 s), o el README/`DECISIONS.md` dice cómo se despierta.
> 1d. `git log -p -S"<primeros 6 caracteres de cada clave>"` no encuentra nada, y el panel de cada proveedor muestra un tope de gasto (captura en `docs/`, sin la clave).

---

## 4. Pasos 1 y 2 "dejan el proyecto entregable", pero los criterios Must 5, 6, 7 y 11 caen en el paso 7

**Qué dice.** "Primero se arma la entrega con lo que ya existe (pasos 1 y 2), para que el proyecto sea entregable aunque el tiempo se acabe." La tabla pone el Release y la prueba en el paso 7 ("APK final, prueba en teléfono, Release y documentos al día").

**Problema.** Si el tiempo se acaba tras el paso 2 no existe Release publicado, ni prueba de RF-36, ni batería, ni el push a GitHub. Falta el APK probado antes de empezar los extras. R61 dice primero lo obligatorio.

**Propongo cambiar** la tabla de pasos:
> | 1 | Server publicado y APK de release que apunta a él | F24 |
> | 2 | Prueba en teléfono (las cuatro frases y la batería) y Release de GitHub con ese APK | F24 |
> | 3 | README, DECISIONS.md y AI-USAGE.md completos, con el repositorio en GitHub | F25 |
> | 4 a 8 | extras (manos libres, entrada, splash, aviso/tema/brillo) | |
> | 9 | APK final: se repiten las cuatro frases en el teléfono, se reemplaza el archivo del Release y se actualizan los documentos | F24, F25 |

Y en el paso final: "si el último APK difiere del probado por más que los extras, se repite la batería".

---

## 5. El README promete "apuntar la app a un server local", pero el RFC quita el tráfico sin cifrar

**Qué dice.** "Con el server en https se quita de `app.json` el permiso de tráfico sin cifrar" (criterio 4), y el README debe explicar "cómo apuntar la app a un server local" (RF-35 / F25 / criterio 8). RFC-001 lo había puesto en `expo-build-properties` "mientras el server de desarrollo sea `http`".

**Problema.** Un server local es `http://…`. Sin el permiso, Android lo bloquea y la instrucción del README no funciona. Cualquier cosa que se pruebe en pasos 3 a 8 con server local también falla. Se contradice con "los comandos que cita funcionan".

**Propongo agregar:**
> En el README: "Para un server local `http` hay que sumar `usesCleartextTraffic: true` en el plugin `expo-build-properties` de `app.json` y compilar de nuevo en debug; el APK de release sale sin ese permiso." El paso 1 comprueba (R58) si `adb reverse` + `localhost` necesita ese permiso o no, y lo anota en `docs/RESEARCH.md`.

Criterio 4:
> 4. En el APK de release, `aapt dump xmltree app-release.apk AndroidManifest.xml | grep usesCleartextTraffic` no muestra `true`, y el README tiene la receta de arriba.

---

## 6. Criterios de entrega que no se pueden demostrar con un comando concreto

**Problema y propuesta por criterio.**

- **2 y 3 (APK):** "abre sin servidor de desarrollo", "la dirección está dentro", "ninguna clave". Falta el cómo.
  > 2. `ls -l app-release.apk` ≤ 104857600 bytes. `aapt dump badging app-release.apk | grep -E "sdkVersion|native-code"` muestra `minSdkVersion` ≤ 30 y `native-code: 'arm64-v8a'`. Se instala con Metro apagado y `adb reverse --remove-all`, y abre en el resumen.
  > 3. `unzip -p app-release.apk assets/index.android.bundle | strings | grep -c "<https://server>"` ≥ 1. Para cada valor de `server/.env`: `unzip -o app-release.apk -d /tmp/apk && grep -rl "<valor>" /tmp/apk` no devuelve nada. Ninguna variable `EXPO_PUBLIC_*` contiene una clave.
  Hay que decir también cuál es la receta de I8 en `RESEARCH.md` y que se usó (cache de Metro limpia).
- **5 (las cuatro frases):** "dan el resultado correcto" no dice cuál es. Hay que decir el estado de partida (instalación limpia: lote 3 con 45 vaquillonas), si se deja correr la cuenta de 4 s, y el resultado esperado de cada frase con los números de la semilla (frase 3 incluye los 18 mm; frase 4 incluye las 40 vaquillonas que entraron al lote 5). Y qué hacer si una falla: se corrige y se vuelve a empezar desde instalación limpia; el intento fallido también se anota. Si no hay teléfono físico (Q7), RNF-01 pide anotarlo: "se probó en el emulador; no cumple RF-36".
- **8 (README):** "los comandos que cita funcionan" no tiene método. La métrica del PRD es "otra persona compila desde cero siguiendo solo el README".
  > 8. En un directorio nuevo (clon limpio, sin `node_modules`, `android/` ni `assets/model-es`) se sigue el README línea por línea hasta tener el APK de debug y el server local contestando `/health`; lo que falló se corrige en el README y se anota.
  El README también debe decir los requisitos reales (versión de Node, JDK, Android SDK/NDK, `curl`/`unzip` que usa el script del modelo, Python 3 para `vosk-words.py`), cómo bajar el APK del Release e instalarlo, y la URL pública del server.
- **9 (DECISIONS):** "una entrada por cada punto" está bien, pero escalabilidad debe verificar sus cinco sub-puntos (costo por pedido con la cifra medida, límites del server, datos en el teléfono o en un servicio, identificar a quien llama, qué cambiaría primero) y las decisiones de este RFC: Q1, Q6 y cada extra recortado.

---

## 7. El orbe: lo que el RFC supone del componente no coincide con RFC-003, y el criterio 17 choca con el criterio 14

**Qué dice.**
- Criterio 14: `Waiting` distinto "en color, movimiento, dibujo y texto". Criterio 17: se agrega "sin tocar el componente del orbe: solo el enum, la ficha, los colores y los objetos de traducción".
- `OrbIntro` tiene `sphereScale`, `ringScale`, `haloScale`, `glyphOpacity`, `glyphScale`, `swirlBoost`, y "`AnimatedNumber` es el tipo de un valor animado de solo lectura de Reanimated".

**Problema.**
- RFC-003 define `OrbGlyph` con tres valores (`Microphone`, `Bars`, `Dots`) para cuatro estados. Un dibujo del centro "distinto" para `Waiting` obliga a un cuarto glifo y a tocar el dibujo del orbe, o a reutilizar uno y diferenciarse solo por los otros ejes. Hay que elegir.
- RFC-003 nunca nombra esfera, aro, halo ni remolino como capas del orbe: `OrbIntro` apunta a capas que ahí no existen. O RFC-003 las define o RFC-005 dice que las agrega.
- `AnimatedNumber` no es un tipo exportado por Reanimated; hay que definirlo (¿`SharedValue<number>`?) y dónde. Verificar el nombre en `node_modules` (R58).
- `useLogoIntro` devuelve `behind` e `inside` como `ReactNode`: un hook que devuelve dibujo es un componente disfrazado (R20/R21).
- Agregar la prop `intro` sí toca el componente del orbe (paso 4), así que el criterio 17 solo vale para el paso 3.

**Propongo:**
> `Waiting` reutiliza el glifo `Microphone` pero con el aro abierto y un movimiento propio (o: se suma `OrbGlyph.Ear` al enum y a su tabla de dibujos en este paso, y el criterio 17 lo cuenta). Decisión de `VISUAL.md`.
> `type AnimatedNumber = SharedValue<number>` en `shared/presentation/components/Orb/types.ts`. `OrbIntro.behind` e `inside` son componentes (`BehindLayer`, `InsideLayer`) que la feature le pasa al orbe, no `ReactNode` creados dentro de un hook.
> RFC-003 / este RFC: el orbe se compone de esfera, aro, halo, remolino y glifo; cada capa lee su escala desde los valores de `intro`.

Criterio 17: "El `git diff` del commit que agrega `Waiting` no toca `Orb.tsx` ni `styles.ts` del orbe." Más: "Un test comprueba que la ficha, la paleta (claro y oscuro) y el texto de `Waiting` difieren de los de `Idle`."

---

## 8. Entrada con el logo: cuándo está "ready", qué pasa si falla, y choques con tema, splash y tarjetas

**Qué dice.** `useLogoIntro({ size, enabled, ready, onEnd })`; "empieza cuando `ready` es verdadero: cuando el orbe ya está a la vista"; "el resto de la pantalla no se ve; aparece cuando la entrada avisa con `onEnd`"; apagada, "la pantalla aparece directamente".

**Problema.**
- Qué señal es `ready` (¿`onLayout` del orbe, fuentes cargadas, `SplashScreen.hide` ya llamado?) y quién llama a `SplashScreen.hide()`. Sin definirlo no se sabe cuándo empieza.
- Si `ready` nunca llega, o `enabled` es falso y `onEnd` no se dispara, el resto de la pantalla no aparece nunca: pantalla en blanco, contra F16.
- "No se ve" el resto: si se desmonta, el orbe (que se centra en el espacio libre) salta de lugar cuando aparece el resumen. Hay que reservar el espacio con opacidad cero.
- Si la persona toca el orbe durante la entrada: no dice si se ignora.
- El tema: F21 puede cambiar a oscuro/claro en plena entrada (el sensor da la primera lectura segundos después de abrir). El splash tiene un solo color. Choca con F23 ("sin salto").
- "Una tarjeta al abrir no debe mover el orbe durante la entrada" está solo en Riesgos; no hay criterio. `useSpanishVoiceNotice` y `usePendingAudios` no reciben "la entrada ya terminó".
- Dónde vive `useLogoIntro` (feature) y quién guarda "la entrada terminó": no está.

**Propongo agregar:**
> `ready` = fuentes cargadas y primer `onLayout` del orbe. Un tope de 1,5 s: si no llega, la entrada se salta. Con `enabled: false` el hook no devuelve entrada y `introDone` empieza en `true`. El resto de la pantalla usa opacidad (no se desmonta): el orbe no cambia de lugar al terminar. Durante la entrada el toque del orbe se ignora. El tema no cambia hasta que termina la entrada, y el color de fondo del splash es el del tema del sistema (claro u oscuro; `expo-splash-screen` admite las dos variantes). `useLogoIntro` vive en `presentation/features/voice/hooks/`; `introDone` baja a `useSpanishVoiceNotice` y `usePendingAudios` por parámetro.

Criterios nuevos:
> 18b. Con `ready` que nunca llega, la pantalla aparece a los 1,5 s.
> 19b. El orbe tiene las mismas coordenadas (`onLayout`) antes y después de `onEnd`.
> 19c. Con un audio guardado y sin voz en español, ninguna tarjeta aparece hasta `onEnd`.
> 19d. Durante la entrada, tocar el orbe no inicia una escucha.
> 19e. El tiempo total de la entrada es una constante en `constants.ts`; un test comprueba que no supera 3500 ms. Además, una grabación de pantalla (`adb shell screenrecord`) mide la duración real.

---

## 9. Manos libres: Vosk, permisos, vibración y Q6 sin resolver

**Qué dice.** `VoskWakePhraseService` "carga el modelo una sola vez… avisa cuando lo que Vosk cree oír contiene la frase entera"; "vibra"; "se pide un toque… salvo que la respuesta a Q6 diga otra cosa".

**Problema (cada uno obliga a adivinar):**
- **Vibración:** es una capacidad del teléfono; R14 exige un contrato en `domain/services`, y no hay uno. (¿`Vibration` de `react-native` directo desde un hook? Rompe R14. ¿El permiso `VIBRATE` está en el manifiesto de la plantilla?)
- **Permiso de micrófono:** al encender el interruptor la primera vez, no dice si se pide con `AudioRecorderService.requestPermission()` ni qué se ve si está denegado (¿la tarjeta "Sin micrófono" de F12 o el "no pudo arrancar"?).
- **Qué evento de Vosk dispara:** parcial o final. Un parcial se repite y dispara varias veces; no dice que tras la primera detección se frena.
- **Modelo:** "carga una sola vez" y "se carga recién al encender": ¿se descarga al apagar? Los ~100 MB (I6) dependen de eso. La carga tarda: qué se ve mientras tanto.
- **Fallo del detector:** "el interruptor se apaga y la app lo dice": falta saber cómo (tarjeta de aviso, subtítulo hablado, ambos) y con qué texto. Los fallos esperados deberían ser valores (R37): `start` devuelve `Promise<Result<void, …>>` o rechaza; hay que fijarlo.
- **Lista de palabras comunes:** "vive en `constants`" pero RFC-001 I5 solo anota que se usa una; no manda anotar cuáles. Cada palabra tiene que estar en el vocabulario (se comprueba con `vosk-words.py`); sin lista registrada hay que adivinarla.
- **Q6:** abierta, y el RFC no dice qué archivo cambia si la respuesta es "pide un toque". `useProposal` (RFC-004) no sabe de dónde vino el pedido; haría falta un `origin` en el estado o un evento.
- **Persistencia:** "guarda si el interruptor está encendido": criterio 12 dice que está apagado al abrir, o sea solo en memoria. Conviene decirlo.

**Propongo agregar:**
> Contrato `VibrationService { vibrate(): void }` en `domain/services`, implementado con `Vibration` de React Native (`RnVibrationService`); sumar `VIBRATE` si el manifiesto no lo trae. El detector reacciona al resultado final de Vosk; tras la primera detección llama a `stop()`. `start()` devuelve `Promise<Result<void, WakeError>>`; ante `Err`, el interruptor se apaga y aparece una tarjeta de tono aviso con "No pude activar manos libres" y la cruz. Al encender se llama a `requestPermission()`; si está denegado, tarjeta "Sin micrófono". El modelo se carga al primer encendido y se descarga al apagar. El interruptor vive en memoria: no persiste. Q6: **por defecto, igual que un toque**, y se anota en `DECISIONS.md`; si el usuario elige "pide un toque", `WakePhraseDetected` pasa a la propuesta con `origin: HandsFree` y `useProposal` no corre la cuenta.
> `RESEARCH.md` (I5) anota la lista exacta de palabras comunes y la comprobación de `vosk-words.py` por cada una.

Criterios nuevos (la prosa los pide y no están):
> 13b. Mientras espera la frase no se crea ningún archivo de audio ni se llama a `/interpret-audio` (log del server vacío durante 60 s).
> 13c. Las dos palabras de `wakePhrase` y cada palabra de la lista de comunes pasan `vosk-words.py`.
> 13d. El modelo se carga solo al encender: `adb shell dumpsys meminfo` antes y después del primer encendido.
> 13e. Un pedido por manos libres pasa por la propuesta; con la respuesta de Q6 elegida, el comportamiento observado coincide.

---

## 10. Dónde van el interruptor, `ToggleChip` y el cableado de `useHandsFree`

**Qué dice.** "El interruptor 'Manos libres' es un componente del design system (`ToggleChip`)… Dónde va lo define `VISUAL.md`."

**Problema (lo visual no es hueco; lo estructural sí).**
- `VoiceStageView` (RFC-003/004) no tiene campos para el interruptor. Hay que agregarlos al tipo, o `HomeScreen` lo dibuja con otro hook. El RFC-003 dice que al cambiar el hook "el componente no cambia".
- `ToggleChip` no está en la tabla del design system de RFC-003 ni tiene props definidas. Con R19, R25 y R47, necesita carpeta, `accessibilityRole="switch"`, `accessibilityLabel` y `accessibilityState`, y área táctil mayor al dibujo (RNF-03).
- Ningún criterio nombra `ToggleChip`, `wakePhrase`, ni ajusta si `useHandsFree` se compone dentro de `useVoiceStage`.

**Propongo agregar:**
> `ToggleChip` (design system): `label`, `value`, `onChange`, `disabled`; estilos con el tema; `accessibilityRole="switch"`. `VoiceStageView` suma `handsFree: { enabled: boolean; onToggle: () => void }`; `useVoiceStage` lo arma con `useHandsFree`. Se agrega al catálogo del RFC-003.

Criterio nuevo: "`ToggleChip` tiene su carpeta con los cuatro archivos de R19, `accessibilityRole`, `accessibilityLabel`, y aparece en `CatalogScreen`."

---

## 11. Tema según la luz y brillo: faltan dónde se conectan, sin sensor, estado inicial y nombres

**Qué dice.** `AmbientLightService.watch(onLux)`; `useAmbientTheme` "le pasa el modo a `ThemeProvider`"; "sin sensor, el tema del sistema"; "La decisión de cada uno es una función pura con su test."

**Problema.**
- `useAmbientTheme` llama a `useDependencies()` (R4/R15), pero `ThemeProvider` y `DependenciesProvider` están en `App.tsx` en ese orden; el hook que alimenta al `ThemeProvider` debe estar adentro del `DependenciesProvider` y antes de la pantalla. Hace falta un componente intermedio. La prop del `ThemeProvider` no tiene nombre (RFC-003: "una prop").
- `watch` solo devuelve cómo dejar de escuchar: no hay forma de saber que "no hay sensor". Habría que sumar `isAvailable()`.
- Estado inicial: antes de la primera lectura, ¿sistema? Con una lectura entre 150 y 600 (no cambia) ¿se queda con el del sistema?
- Nombres, archivos y tipos de las funciones puras (¿`nextThemeMode(lux, current)`?); qué es el "estado actual" del brillo (¿un booleano?). Los umbrales son "más de" y "menos de": hay que probar los bordes (600, 150, 10.000, 3.000).
- Nombres de las implementaciones (R16: `ExpoAmbientLightService`, `ExpoScreenBrightnessService`) y su registro en `di/container.ts`, no dichos.
- Brillo: "Al salir de la pantalla, restaura": con una sola pantalla es "al desmontar"; y si la app pasa a segundo plano mientras está en máximo.
- Evidencia de F22 en emulador: el brillo no se ve; falta el comando.

**Propongo agregar:**
> `AmbientLightService` suma `isAvailable(): Promise<boolean>`. Funciones puras en `presentation/features/voice/hooks/ambientThemeMode.ts` (`nextThemeMode(lux, current): ThemeMode`) y `sunBrightness.ts` (`nextSunBoost(lux, current: boolean): boolean`), cada una con su test. `ThemeProvider` recibe `mode?: ThemeMode`; `ThemedApp` (dentro de `DependenciesProvider`) llama a `useAmbientTheme()` y le pasa el modo. Hasta la primera lectura, y sin sensor, vale el tema del sistema. `di/container.ts` suma `AmbientLightService`, `ScreenBrightnessService`, `SpanishVoiceService`, `WakePhraseService` y `VibrationService`. `useSunBrightness` restaura al desmontar y cuando la app pasa a segundo plano.

Criterios 24 y 25: "…con casos en 150, 151, 599, 600, 601 (tema) y 3.000, 3.001, 9.999, 10.000, 10.001 (brillo)". Nuevo: "Sin sensor (`isAvailable` en `false`), el tema es el del sistema." Nuevo: "`useSunBrightness` no pide ningún permiso (`aapt dump permissions` no suma `WRITE_SETTINGS`)." Para 26: "El brillo de la ventana se lee con `adb shell dumpsys window | grep -i bright` (o el comando que se compruebe en el paso) y se anota en `RESEARCH.md`; si solo se pudo en emulador, se anota (RNF-01)."

---

## 12. Aviso de voz en español (F18): qué abre "Instalar voz" y el estado de la tarjeta

**Qué dice.** "`PhoneSpanishVoiceService` mira las voces del teléfono y abre la pantalla de Android donde se instalan."

**Problema.**
- `expo-speech` no tiene un método para abrir el instalador. No dice con qué (¿`Linking.sendIntent("android.speech.tts.engine.INSTALL_TTS_DATA")` o `com.android.settings.TTS_SETTINGS`?), ni cómo se comprueba que existe en Android 11 (visibilidad de paquetes). I4 de RFC-001 lista voces pero no prueba esto.
- "Hay una voz en español" no está definido (¿idioma que empieza con `es`?). `PhoneSpeakerService` (RFC-004) elige ya una voz en español: es la misma regla, y debería compartirse.
- La cruz cierra la tarjeta: ¿vuelve a aparecer en el siguiente "vuelve a estar a la vista"? F18 dice "deja de aparecer cuando la voz ya está instalada" y "se puede cerrar": ninguna de las dos está en los criterios.
- Dónde aparece la tarjeta entre las demás (`VoiceStageView.cards`) y el orden.

**Propongo agregar:**
> Hay voz en español si alguna voz de `getAvailableVoicesAsync()` tiene `language` que empieza con `es`; esa regla vive en una función compartida con `PhoneSpeakerService`. `openInstaller` usa `Linking.sendIntent` con la acción que el paso 6 compruebe en el teléfono (R58) y la anota en `RESEARCH.md`. Cerrar la tarjeta la oculta hasta que se cierre la app; si la voz se instala, desaparece. La tarjeta se suma al final de `cards`.

Criterio 23 ampliado: "…la cruz la cierra y no vuelve al volver a la app; con una voz en español instalada, no aparece. `isInstalled` tiene un test con voces `es-ES`, `es-US`, `en-US`."

---

## 13. Prosa del RFC que no tiene criterio de aceptación (comprobación 1)

Lo nombrado en el texto y ausente de los 27 criterios:

| Dónde lo dice el RFC | Falta el criterio |
| --- | --- |
| La entrega: "Las claves se cargan como variables del servicio" | 1d de arriba |
| La entrega: "Cada proveedor tiene un tope de gasto" (RNF-12) | 1d de arriba |
| APK: "usa la firma de debug", "arm64", "lleva el JavaScript adentro", "El APK no se versiona" | 2 ampliado; `git ls-files "*.apk"` vacío y `*.apk` en `.gitignore` |
| README: "`.env.example`", "cómo apuntar la app a un server local" | 8 ampliado |
| Disponibilidad del server mientras dure la evaluación (RF-35) | 1c |
| Manos libres: "carga el modelo una sola vez", lista de palabras comunes, `[unk]`, `wakePhrase` desde I5, "contiene la frase entera" | 13b–13e |
| Manos libres: "nada se graba ni se envía" (RF-26, RNF-06) | 13b |
| Manos libres: "dos palabras y las dos en el vocabulario" (F19) | 13c |
| `ToggleChip`, apagado por defecto | 12 cubre el apagado; falta `ToggleChip` (hallazgo 10) |
| Entrada: "`intro` opcional; sin ella aparece ya armado" | "Sin `intro`, el orbe se dibuja igual que antes; `CatalogScreen` lo muestra con y sin `intro`." |
| Entrada: "la pantalla aparece cuando `onEnd`", "una tarjeta al abrir no mueve el orbe" | 18b, 19b, 19c |
| Splash: "ícono adaptable", "comparten color: no hay salto" | 22 ampliado: `aapt dump badging` muestra el ícono adaptable; el color de fondo del splash en `app.json` es igual al `colors.background` del tema que se ve en el primer cuadro |
| F18: la cruz y la desaparición al instalar | 23 ampliado (hallazgo 12) |
| F21: "sin sensor, tema del sistema" | hallazgo 11 |
| F22: "no pide permisos", "restaura al salir" | hallazgo 11 |
| "Un extra que no entra se anota en `DECISIONS.md` con el motivo" | 9 ampliado: "por cada extra no implementado hay una entrada" |
| RNF-01: "lo que solo se pudo probar en emulador se anota" | Criterio nuevo: `docs/RESEARCH.md` indica qué extra se probó en emulador y cuál en teléfono |

---

## 14. Repositorio, Release y reglas que aplican

**Qué dice.** Criterio 11: "El repositorio está en GitHub con un commit por paso." Criterio 7: el APK en un Release. "Reglas que aplican": R8–R16, R19–R28, R29–R47, R48–R51, R53, R59, R60, R61.

**Problema.**
- `CLAUDE.md` y R59: "sin push salvo que el usuario lo pida". Este RFC exige subir a GitHub y publicar un Release (acción pública). Hay que fijar que el usuario autoriza el push y el Release, y decidir nombre y visibilidad del repo (si es privado, el evaluador necesita acceso), tag y nombre del archivo (`field-assistant-v1.0.0-arm64.apk`) y si `gh` está autenticado. Todo eso se adivina.
- "Un commit por paso": nada indica que el historial no se reescribe antes de subir. "Historial real" (CHALLENGE) lo exige.
- Reglas que faltan: **R1 a R7** (los nuevos services en `domain/data/di`, y `ToggleChip` en `shared` no puede importar de `presentation/features`, y el lint lo comprueba), **R58** (verificar en `node_modules` las APIs de `react-native-vosk`, `expo-sensors`, `expo-brightness`, `expo-speech`, `Linking.sendIntent`), **R62** (preguntar ante Q1/Q6), **R52 a R55** (el server se publica). R44 (máquina de estados con la fase nueva) está dentro del rango R29–R47, pero conviene nombrarla.

**Propongo agregar:**
> Antes del paso 3 el usuario decide: nombre y visibilidad del repo, y autoriza el push y el Release. Tag `v1.0.0`; archivo `field-assistant-v1.0.0-arm64.apk`. No se reescribe el historial antes de subir. "Reglas que aplican": sumar R1 a R7, R44, R52 a R55, R58 y R62.

Criterio 11:
> 11. `git log --oneline` muestra un commit por paso aprobado de los cinco RFC (más de uno por RFC), el repo remoto tiene esos commits, y `git ls-files | grep -E "\.env$|\.apk$"` no devuelve nada.

---

## 15. Incoherencias del índice `RFCS.md` y de las cabeceras

Comprobación 5, lo que sí cuadra: los cinco RFC y sus features (F24, F25, F18 a F23) coinciden con la fila 005; los minutos suman 240 (30 + 35 + 55 + 70 + 50); complejidades y predecesores coinciden; las 26 features tienen RFC y las 19 Must cierran en el 005; el orden de los extras es el inverso del recorte del PRD (RF-26, RF-27, RF-30, RF-25, RF-28, RF-29). RF-31 a RF-36 y RF-38 están cubiertos por los criterios 1 a 11, pero con los huecos de los hallazgos 3 a 6 y 14.

Lo que no cuadra:
- **`VISUAL.md` no figura como requisito del RFC-005.** La cabecera dice "Predecesores: RFC-001 a RFC-004"; `RFCS.md` fila 005 dice "001 a 004" y "Antes de empezar" (fila 005) solo cita Q1 y Q6. `CLAUDE.md` dice "VISUAL.md antes de cualquier RFC con pantallas". Propongo: Predecesores "RFC-001 a RFC-004 y `VISUAL.md`"; en "Antes de empezar" del 005 sumar `VISUAL.md` (logo, entrada, ícono, interruptor y estado de espera).
- **Tabla "Dónde se implementa cada feature", F2:** dice "003 (el orbe) y 004 (conectado)", pero el quinto estado de F2 lo agrega el 005. Propongo: "003 (el orbe), 004 (conectado) y 005 (el quinto estado)".
- **RFC-002 dice `Sucesores: RFC-003 y RFC-004`;** `RFCS.md` dice que el 005 lo usa. El RFC-005 no cita nada de `RFC-002`. Alinear: o la cabecera del 002 suma 005, o el índice lo quita.
- **Q8** (¿el orden de recorte y los minutos son los que querés?, "antes de la etapa 1") no aparece en "Antes de empezar" de `RFCS.md`. Q3: el PRD la pide "antes de la etapa 4"; el índice la pone antes del 003 (más estricto, no contradice).
- **Minutos:** 50 para publicar un server, un APK probado en teléfono, 20 frases con voz, manos libres con Vosk, la entrada, el splash, el aviso, el tema y el brillo. No es un hueco de especificación, pero el RFC ya dice que los pasos 3 a 8 se recortan; conviene que "Riesgos" lo diga con el reparto (p. ej. "pasos 1 a 3: 25 min; extras: 25 min") para que el recorte sea una decisión previa y no improvisada.

---

## Lo que `VISUAL.md` tiene que traer (para este RFC)

1. **Logo** como archivo (SVG o PNG con ruta en el repo): versión para la entrada, versión para el ícono adaptable (primer plano 108 dp con zona segura, fondo, y monocromo si se quiere), versión para el splash.
2. **Entrada animada:** qué dibuja `behind` y `inside`, la secuencia (cuánto dura cada capa, pausas, rebotes) para `sphereScale`, `ringScale`, `haloScale`, `glyphOpacity`, `glyphScale` y `swirlBoost`, con la duración total (≤ 3,5 s) y cómo aparece el resto de la pantalla. Solo con lo que I9 comprobó para Android 11: degradés y sombras, sin desenfoque en vivo.
3. **Estado `Waiting` del orbe:** color en claro y oscuro, movimiento, glifo (o decir cuál reutiliza), texto de estado ("Esperando la frase" con la frase), y diferencia visible con el reposo (incluye la respuesta a Q3).
4. **Interruptor "Manos libres" (`ToggleChip`):** dónde va, tamaño táctil, estado apagado/encendido/cargando, y cómo se ve cuando el detector no pudo arrancar.
5. **Tarjeta de aviso de voz** y **tarjeta de "no pude activar manos libres":** icono, tono, textos, botón "Instalar voz", cruz.
6. **Splash:** color de fondo (claro y, si corresponde, oscuro) igual al fondo del primer cuadro de la app, y tamaño del logo.
7. **Valores del tema** para ambos modos con contraste ≥ 4,5:1, incluidos los de `OrbState.Waiting` y el `ToggleChip`.
8. **Lo que ocurre con el tema al cambiar la luz:** si hay transición animada de fondo y cuánto dura (con "no cambia durante la entrada").
9. **Aspecto de la propuesta que llegó por manos libres,** si la respuesta a Q6 es "pide un toque" (el botón "Anotar" no tiene cuenta).

---

**Veredicto:** no se puede implementar tal cual. La entrega (pasos 1 a 3) se puede empezar apenas se responda Q1, pero el RFC promete "entregable tras el paso 2" y no lo cumple; los extras necesitan decidir la fase `Waiting` (hallazgo 1) y la lista de 20 frases (hallazgo 2) antes de escribir código. El resto son decisiones chicas que conviene escribir en el RFC.

## Qué se hizo con estos hallazgos

Se reescribió el RFC-005 y se creó `docs/BATERIA.md`. Aplicados: 1 ("esperando la frase" como sexta fase, con sus eventos y transiciones), 2 (la batería de 20 frases), 3 (publicación del server y la llamada para despertarlo), 4 (los pasos, reordenados), 5 (server local con el build de debug), 6 (comandos concretos), 7 (dibujo propio para el quinto estado; `DerivedValue`), 8, 9, 10 (`ToggleChip`), 11, 12, 13, 14 y 15 (el índice). Se mantiene que el hook de la entrada devuelva lo que dibuja: es la forma más simple de que el orbe no conozca la entrada.

Después, por decisión del autor, se quitó "esperando la frase" como fase y como estado del orbe: con manos libres el orbe sigue en reposo, y hay un solo evento nuevo, `PhraseDetected`. Se sumaron las frases grabadas (F27) y, en el RFC-004, el audio de prueba y la batería automática.

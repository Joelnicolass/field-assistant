# Research de Field Assistant

Comprobaciones del RFC-001 hechas en el teléfono y en la máquina de desarrollo. Cada una anota
fecha, dispositivo, qué se esperaba y qué dio.

## Dispositivo y herramientas

| Dato | Valor |
| --- | --- |
| Teléfono | Motorola moto e40 |
| Android | 11 (API 30) |
| ABI | arm64-v8a |
| RAM | 3,4 GB (`MemTotal` 3.561.108 kB) |
| Conexión | USB, `adb reverse tcp:8081 tcp:8081` |
| Node | 24.14.1 |
| JDK | 17.0.14 |
| Gradle | 9.4.1 |
| Expo | SDK 58 (`expo` ~58.0.25) |
| React Native | 0.88.1 |

## I7 · El build de release

- **Fecha:** 16-nov-2026.
- **Dispositivo:** moto e40, Android 11 (API 30), arm64-v8a. El APK se compiló solo para
  arm64-v8a.
- **Se espera:** sin las reglas de R8 falla; con ellas compila. El APK pesa menos de 100 MB.

**Qué dio:**

| Build | Resultado | Tiempo | APK |
| --- | --- | --- | --- |
| `assembleRelease` sin `extraProguardRules` | `BUILD FAILED` en `:app:minifyReleaseWithR8` | 1 min 36 s | no se genera |
| `assembleRelease` con las cuatro reglas | `BUILD SUCCESSFUL` | 2 min 8 s | 76.917.577 bytes (76,9 MB; 73,4 MiB) |
| `assembleDebug` | `BUILD SUCCESSFUL` | 1 min 9 s (56 s el primero) | 122.881.425 bytes (122,9 MB; 117,2 MiB) |

El error sin las reglas:

```
> Task :app:minifyReleaseWithR8 FAILED
ERROR: Missing classes detected while running R8. Please add the missing classes or apply additional keep rules that are generated in .../app/android/app/build/outputs/mapping/release/missing_rules.txt.
ERROR: R8: Missing class java.awt.Component (referenced from: long com.sun.jna.Native.getWindowHandle0(java.awt.Component))
Execution failed for task ':app:minifyReleaseWithR8'.
> A failure occurred while executing com.android.build.gradle.internal.tasks.R8Task$R8Runnable
BUILD FAILED in 1m 36s
```

JNA (que usa Vosk) referencia `java.awt`, que Android no tiene. Las reglas de `app.json`
(`extraProguardRules` en `expo-build-properties`) lo resuelven:

```
-dontwarn java.awt.**
-keep class com.sun.jna.** { *; }
-keepclassmembers class * extends com.sun.jna.** { public *; }
-keep class org.vosk.** { *; }
```

**Receta:** `npx expo prebuild --platform android --clean`, y después, en `app/android`,
`./gradlew app:assembleRelease -PreactNativeArchitectures=arm64-v8a`. Tras un `prebuild --clean`
o un release hay que volver a correr `assembleDebug` para tener el APK de debug.

**Veredicto:** se cumple. Falla sin las reglas, compila con ellas y el APK pesa 76,9 MB, menos
de los 100 MB esperados.

## I8 · Variables `EXPO_PUBLIC_*` en release

- **Fecha:** 16-nov-2026.
- **Dispositivo:** moto e40, Android 11 (API 30), arm64-v8a. Los builds son de release; el
  valor se busca dentro del APK, sin instalarlo.
- **Se espera:** el valor queda fijo al armar el paquete. Si no se vacía la caché de Metro, el
  segundo build conserva el valor viejo. Se anota la receta que funciona.

`ResearchScreen` muestra `settings.serverUrl` (que lee `EXPO_PUBLIC_SERVER_URL`), así que el
valor llega al bundle. La búsqueda:

```
unzip -p app/android/app/build/outputs/apk/release/app-release.apk assets/index.android.bundle | grep -a -c '<texto>'
```

(`strings` no sirve en macOS.) La variable se exporta al correr Gradle; no hay ningún `.env`.

**Qué dio** (coincidencias dentro del APK):

| # | Comando | Valor buscado | Coincidencias |
| --- | --- | --- | --- |
| 1 | Receta (ver abajo) con `http://valor-uno.test` | `valor-uno` | 1 |
| 2 | `assembleRelease`, con `http://valor-dos.test`, sin vaciar la caché | `valor-uno` / `valor-dos` | 1 / 0 (queda el valor viejo) |
| 3 | `assembleRelease --rerun-tasks`, con `valor-dos`, sin borrar `metro-cache` | `valor-uno` / `valor-dos` | 0 / 1 |
| 4 | `createBundleReleaseJsAndAssets --rerun-tasks` (sin borrar `metro-cache`), con `valor-tres` | `valor-dos` / `valor-tres` | 0 / 1 |
| 5 | Receta completa, con `valor-cuatro` | `valor-tres` / `valor-cuatro` | 0 / 1 |

**Lo que se vio distinto de lo esperado:** el valor viejo no lo guarda la caché de Metro, sino
Gradle. Cambiar una variable de entorno no invalida la tarea
`createBundleReleaseJsAndAssets`, así que `assembleRelease` la da por al día y reusa el bundle
anterior (fila 2). Con `--rerun-tasks` el bundle se rearma con el valor nuevo aunque la caché
de Metro siga ahí (filas 3 y 4). Borrar la caché no hizo falta en esta prueba; se deja en la
receta porque no cuesta nada.

**Receta que funciona:**

```
export EXPO_PUBLIC_SERVER_URL=<url>
rm -rf "$TMPDIR/metro-cache"
./gradlew app:createBundleReleaseJsAndAssets --rerun-tasks -PreactNativeArchitectures=arm64-v8a
./gradlew app:assembleRelease -PreactNativeArchitectures=arm64-v8a
```

Tiempos: el bundle tarda entre 12 y 23 s y el `assembleRelease` que sigue, unos 10 s.
`assembleRelease --rerun-tasks` también sirve, pero rehace todo (1 min 57 s).

**Veredicto:** el valor queda fijo en el paquete. Cambiarlo exige forzar la tarea del bundle;
no alcanza con volver a correr `assembleRelease`.

## Comprobaciones en el teléfono (I1, I4, I5, I6, I9, I10 e I11)

- **Fecha:** 16-nov-2026.
- **Dispositivo:** moto e40, Android 11 (API 30), arm64-v8a, con el build de debug y el
  JavaScript por Metro. Cada una tiene su tarjeta en `ResearchScreen`.
- **Dato del teléfono:** tiene activada la opción de reducir animaciones. Reanimated la respeta
  por defecto y lo avisa en el log.

### I1 · Grabar con `expo-audio` y leer el volumen

- **Se espera:** graba en AAC (`.m4a`) y entrega el volumen varias veces por segundo. El permiso
  se consulta antes de pedirlo. Se anota el volumen del ambiente y el de una voz.
- **Qué dio:**
  - El permiso, consultado antes de pedirlo, estaba en `undetermined`; después se pidió y se
    concedió.
  - El archivo es `.m4a` con AAC, 44,1 kHz y **un canal**, aunque `RecordingPresets.HIGH_QUALITY`
    pide dos. Una grabación de 3,1 s pesa 40.657 bytes.
  - El volumen se lee en vivo con `recorder.getStatus().metering`: −160 dB en silencio (el piso
    del medidor) y −13,9 dB como máximo con voz.
  - `durationMillis` de `getStatus()` vino en 0 durante la grabación: la duración se toma con el
    reloj de la app.
- **Pendiente:** se hizo una sola grabación. Las lecturas por segundo y el umbral entre ambiente
  y voz quedan para cuando se grabe de nuevo.
- **Veredicto:** se cumple en formato y en volumen en vivo; falta medir cuántas lecturas por
  segundo entrega.

### I4 · Voces en español del teléfono

- **Se espera:** se listan las voces. En Android la voz se elige por su identificador, no por el
  idioma con región.
- **Qué dio:** 473 voces en total y 18 en español, todas de `es-US` o `es-ES` (por ejemplo
  `es-us-x-sfb-network`, `es-es-x-eee-local`). No hay ninguna `es-AR`. Todas con calidad
  `Enhanced`.
- **Pendiente:** escuchar cómo suena hablar con el identificador y pidiendo `es-AR`.
- **Veredicto:** se listan; no hay voz argentina en el teléfono.

### I5 · Vosk como detector de una frase

- **Se espera:** con una lista que tiene solo la frase, se dispara con cualquier oración. Con
  una frase de dos palabras más una lista de palabras comunes, no.
- **Qué dio:**
  - El modelo carga en 2.033 ms (la primera vez lo copia desde el APK).
  - "escuchame", "hola" y "asistente" están en el vocabulario. "vaquillonas" y "mové" **no**
    están: la lista de palabras comunes no las usa.
- **Pendiente:** decir las frases candidatas y contar aciertos y disparos por error. Q2 sigue
  abierta. Se retoma en el RFC-005, que es donde se usa manos libres.

### I6 · Memoria con el modelo de Vosk cargado

- **Se espera:** sube alrededor de 100 MB.
- **Qué dio:** `adb shell dumpsys meminfo com.fieldassistant.app`, `TOTAL PSS`: 305.755 kB
  antes de cargar el modelo y 416.245 kB después. Sube 110 MB.
- **Veredicto:** se cumple.

### I9 · Degradés y sombras en Android 11

- **Se espera:** `backgroundImage` con degradé lineal y radial, y `boxShadow`, se dibujan. El
  desenfoque en vivo (`filter: blur`) no.
- **Qué dio:** el degradé lineal, el radial y la sombra se ven. El cuadro con `filter: blur(6px)`
  se ve nítido.
- **Veredicto:** se cumple.

### I10 · Reanimated en el hilo de la interfaz

- **Se espera:** un estilo animado se recalcula solo si lee el valor compartido directamente,
  no dentro de otra función.
- **Qué dio:**
  - Se movieron **los dos** cuadros: el que lee `offset.get()` en el estilo y el que lo lee
    con una función `'worklet'` que recibe el valor compartido. Leerlo dentro de otra función
    worklet también se sigue.
  - Con reducir animaciones activado, `withTiming` no anima: el cuadro salta al final. A los
    0,7 s de una animación de 1,5 s ya estaba en el final.
  - Con el plugin de hooks de ESLint, el valor compartido se cambia con `.set()` y se lee con
    `.get()`: asignar `.value` rompe el lint.
- **Pendiente:** ver la animación fluida con JavaScript bloqueado. Con reducir animaciones
  activado no se puede: hay que pedirle a la animación que no lo respete.
- **Veredicto:** no se cumple como se esperaba. La restricción de R46 sobre leer el valor
  "dentro de otra función" no aparece con una función worklet.

### I11 · Sensor de luz y brillo

- **Se espera:** el sensor entrega lux. `expo-brightness` cambia el brillo solo de la app y sin
  pedir permiso.
- **Qué dio:**
  - El sensor está disponible y entrega lux en vivo: de 300 a 1.600 en interior, según la luz.
  - El brillo de la app pasó a 1,0 y a 0,2. El del sistema siguió igual (148 de 255 en
    `settings get system screen_brightness`; 0,50 según `getSystemBrightnessAsync`).
  - No se pidió ningún permiso.
- **Veredicto:** se cumple.

## Proveedores, desde la máquina de desarrollo (I2, I3 e I13)

- **Fecha:** 16-nov-2026.
- **Dónde:** los scripts de `server/scripts/`, corridos en la Mac con la red de la casa. La
  latencia desde el teléfono, con datos móviles, va a ser mayor.

### I2 · El modelo entiende un audio y devuelve JSON con forma fija

- **Se espera:** los tres audios dan el pedido correcto. Se anotan el identificador del modelo,
  la latencia, el costo de mil pedidos y el límite de pedidos por minuto.
- **Cómo:** `npm run research:interpret` en `server/`. Manda cada audio a Gemini en un solo
  pedido, con `inlineData` (`audio/mp4`) y `responseSchema`, y mide.
- **Audios:** `server/scripts/samples/`, hechos con la voz de la Mac (`say -v Paulina`, español
  de México: no hay voz rioplatense) y pasados a `.m4a` AAC mono con `afconvert`. Duran de 1,6 a
  3,2 s.
- **Modelo:** `gemini-3.5-flash-lite`. Está en la lista de modelos de la API con esta clave.
- **Qué dio:** cuatro corridas. Las dos primeras con el esquema que deja omitir los datos; las
  dos últimas con todos los campos obligatorios y que aceptan `null`, y la instrucción "si un dato
  no se dijo, va en null".

| Audio | Se espera | Campos opcionales (2 corridas) | Campos con `null` (2 corridas) |
| --- | --- | --- | --- |
| `rain.m4a` | lluvia, 18 mm, ayer | una vez **sin `day`** y con `quantity: 2` y `toLot: 2` inventados; otra, correcto | correcto las dos veces |
| `move.m4a` | 40 vaquillonas del 3 al 5 | correcto | correcto las dos veces |
| `missing.m4a` | 15 terneros, faltan los lotes | lotes en `missing`, pero una vez con `toLot: 0` | una vez `503`; la otra, correcto, con los lotes en `null` y en `missing` |

- **Latencia:** de 1,3 a 3,1 s en 9 de 11 pedidos. Dos pedidos tardaron **7,4 s y 17 s**, y
  uno volvió con `503 UNAVAILABLE` ("high demand") en 1,5 s.
- **Tokens y costo:** de 175 a 231 tokens de entrada y de 40 a 97 de salida por pedido. A
  US$ 0,30 la entrada y US$ 2,50 la salida por millón: entre US$ 0,21 y US$ 0,30 cada mil
  pedidos. RNF-07 pide US$ 1 o menos: se cumple.
- **Límite por minuto:** la API no lo informa. Según la referencia de proveedores, el plan gratis
  acepta unos 15 pedidos por minuto; pasado eso contesta `429`. Queda para confirmar en el panel
  de Google AI Studio.
- **Lo que se vio distinto de lo esperado:**
  - Con campos opcionales, el modelo a veces inventa datos o pone `0` en uno que marca como
    faltante. Con todos los campos obligatorios y nulos, no pasó.
  - La demora tiene una cola larga y el servicio a veces responde `503`. El server necesita un
    límite de tiempo propio (RF-17 fija 8 s) y tratar el `503` como falla técnica: el audio va a
    la cola.
- **Veredicto:** se cumple: entiende en un solo pedido, con JSON de forma fija y dentro del
  costo. Para el RFC-004: campos obligatorios con `null`, límite de tiempo y reintento por cola.

### I3 · La voz de servicio sintetiza una frase

- **Se espera:** devuelve audio. Se anotan la voz elegida (Q4), la latencia y el costo por
  carácter.
- **Cómo:** `npm run research:speak` en `server/`. Usa `eleven_flash_v2_5`, salida
  `mp3_44100_128` y `language_code: 'es'`, para que lea en español un texto ambiguo como "18 mm".
  La voz es `EXAVITQu4vr4xnSDxMaL` ("Sarah"), una voz incluida que anda con el plan gratis; se
  cambia con `ELEVENLABS_VOICE_ID`.
- **Qué dio:** tres corridas con "Anotado. Van dieciocho milímetros." (34 caracteres), después
  de renovar la cuota:
  - Devuelve audio: mp3 mono a 44,1 kHz, de 2,8 s y entre 44.764 y 51.034 bytes.
  - Latencia, del pedido al audio completo: 845, 621 y 492 ms. Sin streaming: con streaming, el
    primer sonido llega antes.
  - Costo: US$ 0,05 cada mil caracteres, o sea US$ 1,70 cada mil respuestas como esta; una de 90
    caracteres, US$ 4,50 cada mil.
- **Veredicto:** se cumple.
- **Para Q4:** con el plan gratis, la API solo deja usar las voces incluidas, de acento neutro.
  Las voces argentinas son de la biblioteca y piden un plan pago (la API contesta `402`). Q4
  queda abierta: voz neutra gratis o voz argentina paga.
- **Precio de lista:** US$ 0,05 cada mil caracteres. Una respuesta de 90 caracteres cuesta
  US$ 4,50 cada mil respuestas (ver `docs/PROVEEDORES.md`).

### I13 · Latencia de un turno

- **Se espera:** desde que termina la escucha hasta tener la respuesta, 5 segundos o menos
  (RNF-02).
- **Qué dio:** la suma de I2 e I3 desde la Mac.

| Parte | Lo común | La cola |
| --- | --- | --- |
| Entender (I2), subida del audio incluida | de 1,3 a 3,1 s | 7,4 y 17 s en 2 de 11 pedidos |
| Voz de servicio (I3), audio completo | de 0,5 a 0,85 s | — |
| **Turno** | **de 1,8 a 4 s** | pasa los 5 s cuando el modelo tarda |

- **Pendiente:** medirlo desde el teléfono con datos móviles, en el RFC-004, cuando el turno
  exista de punta a punta.
- **Q5:** un turno tarda de 1,8 a 4 s con buena señal, medido desde la Mac.
- **Veredicto:** se cumple en lo común: dentro de los 5 s de RNF-02. La cola del modelo lo
  supera; el límite de tiempo del server la corta y el audio va a la cola.

## Batería automática del server (RFC-004)

- **Cómo:** `npm run eval` en `server/`. Manda al modelo real (`gemini-3.5-flash-lite`) los 26
  casos de `server/eval/cases.ts`: las frases de `docs/BATERIA.md` (la 18 repite la 3) y cinco de
  conversación. Los audios son de `scripts/make-audio.sh`, con la voz de la Mac (Paulina, español
  de México; la 8 con Mónica, de España). Día de referencia: 2026-11-16. 5 s entre casos.
- **Fecha:** 16-nov-2026, desde la Mac.
- **Corrida 1:** 16 de 26. 7 fallas del proveedor (`503`). De los 19 que contestó, 4 mal:
  "Llovió hoy" como consulta, "¿Qué onda el clima mañana?" con pregunta, y dos de la voz
  sintética ("Mové" como "move" y "quinientos" como 50).
- **Ajustes a las instrucciones:** si afirma que llovió es `register_rain` aunque no diga cuánto;
  con `unknown` no hay pregunta; atención a los números parecidos ("quinientos" y "cincuenta").
  Los cuatro casos dieron bien después.
- **Corrida 2, con las instrucciones nuevas:** 16 de 26, y **los 16 que el modelo contestó,
  bien**. Los otros 10 son fallas del proveedor: cinco `503` y cinco que pasaron el límite de 7 s.
  Latencia de los que contestó: mínima 1.322 ms, mediana 1.698 ms, máxima 4.180 ms.
- **Veredicto:** el modelo entiende las frases de la batería, con historial y correcciones. El
  proveedor falló en 10 de 26 pedidos de esta corrida: esos audios irían a la cola de la app. La
  batería suma reintentos por caso para medir lo que entiende el modelo aunque el proveedor
  falle. Por decisión del autor, no se siguió midiendo la disponibilidad del proveedor.

## Latencia de diez turnos, desde el teléfono (RFC-004, criterio 49)

- **Dispositivo:** Motorola moto e40, Android 11, por USB contra el server local de la Mac
  (Gemini y ElevenLabs reales). Audio de prueba en lugar del micrófono (frases de
  `server/eval/audios/`). 16-nov-2026.
- **Qué se mide:** la línea `[latencia]` del registro de la app, desde que termina la escucha
  hasta que la respuesta está lista (subir el audio, entender y resolver), sin contar el hablar.
- **Los diez turnos (consultas de lluvia y de lotes):** 1.725, 1.827, 1.957, 2.306, 2.603, 2.733,
  2.990, 4.408, 4.767 y 7.056 ms. **Mediana: 2,7 s.**
- **Veredicto:** la mediana queda dentro de los 5 s de RNF-02. Los turnos más lentos coinciden con
  fallas de Gemini (`503` y cortes a los 7 s) durante la corrida: esos audios fueron a la cola y
  se entendieron después. La voz del server empieza a sonar en 0,3 a 0,8 s con streaming.

## Faltan

- **Q4, decidida:** con un plan pago de ElevenLabs la API deja usar la biblioteca, que tiene
  30 voces con acento argentino. Se eligió "Cande". Ya en uso tarda como Sarah (0,64 s una frase
  corta); la primera frase con una voz nueva tardó de 5,8 a 6,9 s.
- **Con voz real, pendientes:** las otras grabaciones de I1, escuchar las voces de I4 y la frase
  de manos libres de I5 (RFC-005, Q2).
- **Para decidir:** si el orbe respeta la opción de reducir animaciones del teléfono (I10).
- I12 se quitó.

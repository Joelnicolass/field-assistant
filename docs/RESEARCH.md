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

## Faltan

- **Paso 6:** I2 (el modelo entiende el audio), I3 (la voz de servicio) e I13 (la latencia de un
  turno). I3 depende de que la clave de ElevenLabs tenga créditos.
- **Con voz real, pendientes:** las otras grabaciones de I1, escuchar las voces de I4 y la frase
  de manos libres de I5 (RFC-005).
- **Para decidir:** si el orbe respeta la opción de reducir animaciones del teléfono (I10).
- I12 se quitó.

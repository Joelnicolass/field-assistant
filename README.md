# Field Assistant

Asistente de campo por voz para Android. El productor le habla al teléfono en rioplatense, la
app responde en voz alta, anota lo que pasó en el campo y contesta preguntas. La pantalla
muestra el comprobante: una tarjeta con los números, no un chat.

**Probarlo:** el APK está en el
[Release v1.0.0](https://github.com/Joelnicolass/field-assistant/releases/tag/v1.0.0)
(`field-assistant-v1.0.0-arm64.apk`, Android 11 o superior, arm64, firmado en debug). Ya
apunta al server publicado; no hace falta levantar nada.

El repositorio tiene dos partes:

- `app/`: la app, con Expo y React Native. Solo Android.
- `server/`: un server mínimo y sin estado entre la app y los proveedores de voz. Guarda las
  claves para que no viajen en el APK. Está publicado en Railway.

## Qué hace

### El turno de voz

- **Tocar para hablar:** se toca el orbe, se habla y la app corta sola cuando terminás de
  hablar (o con otro toque). Responde con una frase corta en voz alta y el mismo texto como
  subtítulo.
- **El estado del micrófono siempre se ve:** el orbe cambia de forma y color en cada estado
  (en reposo, escuchando, pensando, hablando) y sigue tu voz mientras escucha. Debajo, el
  estado en palabras; escuchando, en rojo.
- **Manos libres (opcional):** con el ícono del micrófono en el encabezado, la app espera la
  frase «hola asistente» y empieza a escuchar sola, con una vibración. La frase se detecta en
  el teléfono con Vosk, sin mandar audio a ningún lado. Solo escucha con la app a la vista y
  en reposo.
- **Una muletilla mientras piensa** ("A ver.", "Dame un segundo."…), grabada dentro de la app:
  suena al instante, sin red, y se van turnando.
- **La voz es rioplatense** ("Cande", de ElevenLabs). Si la voz del server falla o tarda, la
  frase la dice la voz del teléfono, y el turno nunca se traba esperando.

### Anotar

- **Lluvia:** "Llovieron 18 mm anoche".
- **Movimientos de animales:** "Pasé 40 vaquillonas del lote 3 al 5", con las cinco
  categorías (vacas, vaquillonas, terneros, novillos y toros).
- **Corregir lo último:** "No, eran 20".
- **Mostrar antes de anotar:** la tarjeta muestra lo que se va a anotar con la cuenta
  (cuántas quedan en cada lote) y se anota sola a los 4 segundos, salvo que la frenes. Si no
  alcanzan los animales, lo dice y no anota.

### Preguntar

- "¿Cuánto llovió este mes?", "¿Cuántos animales hay en el lote 5?". La respuesta va en voz y
  el detalle en una tarjeta.
- **Si falta un dato, pregunta:** "¿De qué lote?". La conversación sigue en el próximo turno.

### La pantalla de inicio

- **El resumen de hoy:** lo anotado hoy, las cabezas en total, la lluvia del mes, la última
  lluvia y las cabezas por lote en barras.
- **Una entrada con el logo:** el splash es el primer cuadro de la animación, y la carga se ve
  como una sola animación.

### Cuando algo sale mal

- **Sin señal:** el audio se guarda en el teléfono y una frase grabada lo avisa. Una píldora
  muestra cuántos esperan. Se reintentan solos (cada 20 s, al volver a la app y después de un
  turno que salió bien), y tocando la píldora se mandan en el momento. Cuando se entienden,
  aparecen de a una tarjeta para anotar o descartar: nada se anota solo.
- **Servicio saturado:** si el server falla o tarda más de 8 s, el audio se guarda igual y se
  manda en el próximo reintento.
- **Micrófono denegado:** una tarjeta lo explica, con un botón a los ajustes del teléfono.
- **No entendió o no hubo voz:** lo dice, con ejemplos de qué se le puede decir.
- **Falta la voz en español del teléfono:** una tarjeta con "Instalar voz".

### Ajustes

- **Calibrar el umbral de voz:** mide el lugar en silencio, después tu voz, y propone desde qué
  volumen se toma como voz. Sirve para el viento o la manga.
- **Tema automático** según la luz (encendido por defecto).
- **El permiso del micrófono**, y el catálogo del design system.

## Decisiones de UX pensadas para el campo

- **Un toque grande, sin escribir nada:** con guantes y al sol, todo empieza tocando el orbe,
  que mide 168 dp. Los botones de las tarjetas son grandes y el toque mínimo es de 48 dp.
- **Tocar para hablar antes que manos libres:** con ruido de fondo, la frase de activación se
  dispara sola o no se dispara. Tocar es predecible; manos libres queda como opción para
  cuando las manos están ocupadas.
- **Un comprobante, no un chat:** cada respuesta es una tarjeta con el número grande. No hay
  historial que leer: lo que importa es lo último que pasó.
- **Mostrar antes de anotar, sin pedir confirmación:** confirmar cada registro cansa, y anotar
  sin mostrar da miedo. La tarjeta muestra la cuenta y se anota sola a los 4 segundos; un
  toque la frena.
- **El modelo entiende, el código calcula:** las cuentas de animales y de lluvia las hace la
  app, nunca el modelo. Un número dicho por la voz siempre coincide con el de la tarjeta.
- **Sin señal no se pierde nada:** en el campo la señal va y viene. El audio se guarda tal
  cual y se manda después, sin que el productor tenga que acordarse.
- **Siempre hay una salida:** ningún error deja la pantalla trabada. Cada falla dice qué pasó
  y qué hacer, en voz y en una tarjeta.
- **Respuestas cortas en voz, el detalle en pantalla:** la voz dice lo esencial; la tarjeta
  tiene todos los números para mirar con calma.
- **Se ve al sol y de noche:** el tema cambia con la luz del lugar (claro con sol, oscuro con
  poca luz) y el brillo sube a pleno sol. Textos grandes, alto contraste y nada de menos de
  11 puntos.
- **Rápido aunque el teléfono sea de gama media:** las animaciones van en el hilo de la
  interfaz, el audio se manda comprimido (unos 4 KB por segundo) y las frases cortas están
  grabadas en la app.
- **La voz habla como el productor:** rioplatense, informal y corta.

Las decisiones con su porqué y lo que se resignó en cada una, incluidos el stack y la
escalabilidad (de un productor a miles), están en [`DECISIONS.md`](DECISIONS.md).

## Requisitos

| Herramienta | Versión |
| --- | --- |
| Node | 24 o superior |
| JDK | 17 |
| Android SDK | con NDK 27 o superior y `platform-tools` (`adb`) |
| Python | 3, para los scripts del modelo de voz |
| Teléfono | Android 11 o superior, arm64, con depuración USB |

No corre en Expo Go: tiene módulos nativos y se compila localmente.

## La app

### Instalar y bajar el modelo de voz

```bash
cd app
npm install
bash scripts/get-vosk-model.sh
```

El modelo de Vosk (`vosk-model-small-es-0.42`, unos 58 MB) queda en `app/assets/model-es` y no
se versiona. Para saber si una palabra está en su vocabulario:

```bash
python3 scripts/vosk-words.py hola asistente
```

### Configurar

La app apunta por defecto al server publicado. Creá `app/.env` (no se versiona) con la clave
que el server pide a la app, la misma que `APP_KEY` en el server:

```bash
EXPO_PUBLIC_APP_KEY=...
```

Para usar un server local:

```bash
EXPO_PUBLIC_SERVER_URL=http://localhost:8787
```

y `adb reverse tcp:8787 tcp:8787`. Los demás ajustes (tiempos, umbrales, la frase de manos
libres, la entrada del logo) están en `app/src/core/configs/settings.ts`, cada uno con su
variable `EXPO_PUBLIC_*`.

### Compilar e instalar en el teléfono

Con el teléfono conectado por USB:

```bash
npx expo prebuild --platform android --clean
cd android
./gradlew app:assembleDebug -PreactNativeArchitectures=arm64-v8a
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

El build de debug carga el JavaScript desde Metro. En otra terminal, desde `app/`:

```bash
npx expo start --port 8081 --clear
adb reverse tcp:8081 tcp:8081
```

Hace falta compilar de nuevo solo cuando cambia algo nativo: un paquete con código nativo, un
plugin o `app.json`. Los cambios de JavaScript llegan por Metro.

### Build de release

El release lleva el JavaScript adentro y abre sin Metro. La dirección del server queda fija al
compilar, así que hay que forzar el paquete de JavaScript:

```bash
cd app/android
export EXPO_PUBLIC_SERVER_URL=https://server-production-b97a938f.up.railway.app
rm -rf "$TMPDIR/metro-cache"
./gradlew app:createBundleReleaseJsAndAssets --rerun-tasks -PreactNativeArchitectures=arm64-v8a
./gradlew app:assembleRelease -PreactNativeArchitectures=arm64-v8a
```

El APK queda en `app/android/app/build/outputs/apk/release/app-release.apk`.

### Chequeos

Desde `app/`:

```bash
npm run typecheck
npm run lint
npm run format
npm test
```

## El server

### Claves

Copiá `server/.env.example` a `server/.env` y completá las claves. El `.env` no se versiona.

| Variable | Para qué |
| --- | --- |
| `GEMINI_API_KEY` | El modelo que entiende el audio |
| `ELEVENLABS_API_KEY` | La voz de la app |
| `APP_KEY` | La clave que el server pide a la app en `X-App-Key`. En producción es obligatoria; en local puede faltar |
| `PORT` | Puerto del server; si falta, 8787 |
| `GEMINI_MODEL` | Opcional; por defecto `gemini-3.5-flash-lite` |
| `ELEVENLABS_VOICE_ID` | Opcional; por defecto "Cande", una voz rioplatense |

### Levantar

```bash
cd server
npm install
npm start
```

`GET /health` contesta `{ "ok": true }`. Las rutas que usa la app:

- `POST /interpret-audio`: recibe el audio y devuelve lo que entendió el modelo.
- `GET /speak?text=…`: devuelve la frase en voz, a medida que se genera.

Para que el teléfono llegue al server local: `adb reverse tcp:8787 tcp:8787`.

### Publicarlo

El server tiene un `Dockerfile`. Está publicado en Railway, con las claves como variables del
servicio. Desde `server/`, con la CLI de Railway:

```bash
railway up --ci --service server
```

### Scripts

Desde `server/`, con las claves cargadas:

| Comando | Qué hace |
| --- | --- |
| `npm run cues` | Graba las frases cortas que van dentro de la app (`app/assets/cues/`). Se corrió una vez |
| `npm run eval` | Corre la batería de frases contra el modelo real |
| `npm run research:interpret` | Manda los audios de `server/scripts/samples/` al modelo y mide |
| `npm run research:speak` | Sintetiza una frase con la voz |

## Documentos

- `CHALLENGE.md`: la consigna.
- `DECISIONS.md`: las decisiones, con qué se resigna en cada una, el stack y la escalabilidad.
- `PRD.md`, `FEATURES.md`, `RULES.md` y `VISUAL.md`: qué se construye y cómo.
- `RFCS.md` y `RFCs/`: el plan de implementación, en cinco RFCs.
- `docs/RESEARCH.md`: lo que se comprobó en el teléfono y con los proveedores.
- `AI-USAGE.md`: qué IA se usó y para qué.

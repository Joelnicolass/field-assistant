# Field Assistant

Asistente de campo por voz para Android. El productor le habla al teléfono y la app responde en
voz alta, anota lo que pasó en el campo y contesta preguntas.

El repositorio tiene dos partes:

- `app/`: la app, con Expo y React Native. Solo Android.
- `server/`: un server mínimo, sin estado, entre la app y los proveedores de voz. Guarda las
  claves para que no viajen en el APK.

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

```bash
cd app/android
./gradlew app:assembleRelease -PreactNativeArchitectures=arm64-v8a
```

El APK queda en `app/android/app/build/outputs/apk/release/`. Para cambiar la dirección del
server en el release, hay que forzar el paquete de JavaScript:

```bash
export EXPO_PUBLIC_SERVER_URL=https://...
./gradlew app:createBundleReleaseJsAndAssets --rerun-tasks -PreactNativeArchitectures=arm64-v8a
./gradlew app:assembleRelease -PreactNativeArchitectures=arm64-v8a
```

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
| `ELEVENLABS_API_KEY` | La voz de servicio |
| `PORT` | Puerto del server; si falta, 8787 |
| `GEMINI_MODEL` | Opcional; por defecto `gemini-3.5-flash-lite` |
| `ELEVENLABS_VOICE_ID` | Opcional; por defecto la voz incluida "Sarah" |

### Levantar

```bash
cd server
npm install
npm start
```

`GET /health` contesta `{ "ok": true }`. Para que el teléfono llegue al server local:

```bash
adb reverse tcp:8787 tcp:8787
```

### Research

Desde `server/`, con las claves cargadas:

```bash
npm run research:interpret
npm run research:speak
```

`research:interpret` manda los audios de `server/scripts/samples/` al modelo y mide.
`research:speak` sintetiza una frase con la voz de servicio. Los resultados están en
`docs/RESEARCH.md`.

## Documentos

- `CHALLENGE.md`: la consigna.
- `PRD.md`, `FEATURES.md`, `RULES.md` y `VISUAL.md`: qué se construye y cómo.
- `RFCS.md` y `RFCs/`: el plan de implementación.
- `DECISIONS.md`: las decisiones, con qué se resigna en cada una.
- `docs/RESEARCH.md`: lo que se comprobó en el teléfono y con los proveedores.
- `AI-USAGE.md`: cómo se usó la IA.

# Plan · RFC-005 · Extras y entrega

Seis pasos. Primero la entrega con lo que ya existe, para que el proyecto sea entregable cuanto
antes; después los extras; al final, la entrega de nuevo con todo adentro. Cada paso se detiene
para la revisión del autor. Los pasos chicos los hace el orquestador; los grandes van por `dev`.

| Paso | Objetivo | Estado |
| --- | --- | --- |
| A | Primera entrega: APK de release contra Railway, ícono y splash, y el Release v1.0.0 | aprobado (APK y Release al final) |
| B | Documentos: README, DECISIONS con las nueve entradas y AI-USAGE | pendiente |
| C | Manos libres | aprobado |
| D | Frases grabadas y aviso de voz en español | aprobado |
| E | Entrada con el logo, tema según la luz y brillo al sol | aprobado (la entrada entró con A) |
| F | Pantalla de Ajustes (pedido del autor) y entrega final | aprobado |

Rama por paso, con su PR a `feature/rfc-005`: `feature/rfc-005-A` a `-F`.

**Ya hecho antes de este RFC:** el server está publicado en Railway con https, con las claves
como variables del servicio y la clave de la app (`X-App-Key`); la app apunta a Railway por
defecto (PR #28).

**Builds nativos:** en A (ícono, splash y el release), en C si Vosk lo pide, y en F (el APK final).

---

## Paso A · Primera entrega

```
app/
  [~] app.json            ícono adaptable y splash con los íconos del autor; sin tráfico sin cifrar
  [+] assets/images/      el ícono y el splash
  [~] src/App.tsx         al abrir, GET /health sin esperar (despierta el server) y un
                          reproductor que se crea y se descarta, para que la primera frase no tarde
docs/RESEARCH.md   [~] las cuatro frases de la consigna desde el APK de release
```

Fuera del código: el APK de release con la receta del research (I8), las cinco comprobaciones de
la tabla "APK de release", y el Release `v1.0.0` en GitHub con
`field-assistant-v1.0.0-arm64.apk` (lo publica el orquestador con el OK del autor en el momento).

**Criterios:** 1 a 6, 8 y 26.

**Cómo se comprueba:** las comprobaciones del APK (dirección de Railway adentro, sin
`localhost:8787`, sin claves, arm64, 100 MB o menos); el APK instalado en el teléfono abre sin
Metro, muestra el ícono y el splash sin salto de color; las cuatro frases de la consigna, dichas
por el autor.

---

## Paso B · Documentos

```
[~] README.md        compilar desde cero, el server y sus claves, apuntar a un server local, tests
[~] DECISIONS.md     las nueve entradas del RFC (escalabilidad con sus cinco puntos) y el tope de
                     gasto de cada proveedor
[~] AI-USAGE.md      qué se usó en cada etapa
```

**Criterios:** 9 a 11.

**Cómo se comprueba:** seguir el README en una copia limpia del repositorio hasta la app y el
server corriendo; repasar las nueve entradas.

---

## Paso C · Manos libres

```
app/src/domain/services/        [+] WakePhraseService
app/src/data/services/          [+] VoskWakePhraseService (+ constants)  ScriptedWakePhraseService
app/src/shared/presentation/components/  [+] ToggleChip
app/src/presentation/features/voice/
  states/   [~] PhraseDetected en reposo lleva a escuchando (con test)
  hooks/    [+] useHandsFree     [~] el texto de estado en reposo con manos libres
app/src/presentation/features/home/   [~] el interruptor en el encabezado
app/src/core/configs/settings.ts      [~] wakePhrase
```

**Criterios:** 13 a 20.

**Cómo se comprueba:** el test de la transición; con el audio de prueba, un turno que empieza sin
tocar; con manos libres y sin la frase, el server no recibe pedidos. La frase con voz real, el
autor.

---

## Paso D · Frases grabadas y aviso de voz en español

```
server/scripts/cues.ts   [+] npm run cues: las siete frases a app/assets/cues/
app/assets/cues/         [+] los siete .mp3
app/src/domain/          [+] CueKind  CuePlayerService  SpanishVoiceService
app/src/data/services/   [+] BundledCuePlayerService (+ test del turno)  PhoneSpanishVoiceService
app/src/presentation/features/voice/hooks/  [~] la muletilla al pensar, el aviso sin señal grabado
                                            [+] useSpanishVoiceNotice
```

**Criterios:** 27 a 32.

**Cómo se comprueba:** el test del turno de las frases; en modo avión, la muletilla y el aviso
sin pisarse, por el registro; la tarjeta de la voz en español.

---

## Paso E · Entrada con el logo, tema según la luz y brillo al sol

```
app/src/shared/presentation/components/LogoIntro/   [+] useLogoIntro
app/src/shared/presentation/components/Orb/         [~] prop intro opcional
app/src/presentation/features/home/                 [~] los tres momentos de la pantalla
                                                    [+] useAmbientTheme  useSunBrightness
                                                    [+] nextThemeMode  nextBrightness (con tests)
app/src/domain/ y data/   [+] AmbientLightService  ScreenBrightnessService (expo-sensors, expo-brightness)
app/src/App.tsx           [~] AmbientShell
```

**Criterios:** 21 a 25 y 33 a 36.

**Cómo se comprueba:** los tests de las dos funciones; la entrada encendida y apagada; la luz con
`adb emu sensor set light` en el emulador.

---

## Paso F · Pantalla de Ajustes y entrega final

Pedido del autor (16-nov), que se registra como cambio de alcance: la pantalla de Ajustes con el
calibrador del umbral de voz, el tema automático (encendido por defecto), el permiso del micrófono
y el acceso al catálogo del DS, que sale del encabezado. En el encabezado, manos libres y Ajustes
quedan como íconos.

```
app/src/presentation/features/settings/   [+] SettingsScreen: calibrador del umbral de voz (mide
                                           el ambiente y la voz, propone un umbral, se guarda) y
                                           los permisos (micrófono y, con manos libres, los que
                                           pida)
app/src/presentation/navigation/          [~] la ruta Settings
app/src/data/                             [+] los ajustes guardados en un archivo
```

Fuera del código: el APK final, la batería de `docs/BATERIA.md` con voz real (la dice el autor),
el Release `v1.0.0` actualizado y los documentos al día.

**Criterios:** 7, 12 y 37, y los del cambio de alcance.

**Cómo se comprueba:** typecheck, lint y tests; el calibrador en el teléfono; la batería con voz
real, 18 de 20 o más.

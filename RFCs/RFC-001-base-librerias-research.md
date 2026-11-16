# RFC-001 · Base del proyecto, librerías y research

| | |
| --- | --- |
| **Estado** | Pendiente |
| **Features** | F26. Deja preparado F24 (el build de release compila) y empieza F25 |
| **Predecesores** | Ninguno |
| **Sucesores** | RFC-002, RFC-003, RFC-004 y RFC-005 |
| **Complejidad** | Media |

## Resumen

Deja el proyecto armado: la app de Expo con todas las librerías instaladas y configuradas,
la estructura de carpetas de `RULES.md` con sus límites comprobados por el lint, los tests
funcionando, el server mínimo y los dos builds de Android compilando. Además hace el research
técnico: comprueba en este proyecto cómo se comporta cada librería y cada proveedor, y lo deja
escrito. No construye ninguna feature de producto.

## Antes de empezar

- **Las claves de los proveedores**, cargadas por el usuario en `server/.env`. Sin ellas no se
  pueden hacer I2, I3 ni I13: se para hasta que estén.
- **Un dispositivo:** un teléfono físico con Android 11 o superior (Q7 del PRD) o, si no hay,
  un emulador de Android 11. El teléfono llega a Metro y al server local por USB, con
  `adb reverse tcp:8081 tcp:8081` y `adb reverse tcp:8787 tcp:8787`.

## Enfoque técnico

### 1. Repositorio

```
field-assistant/
  app/            la app de Expo
  server/         el server mínimo
  docs/           RESEARCH.md y las referencias visuales
  RFCs/
  README.md  DECISIONS.md  AI-USAGE.md
```

### 2. La app

- Proyecto de Expo SDK 58 con TypeScript, sin enrutador: hay una sola pantalla. Se usa
  prebuild y build local; no corre en Expo Go.
- `app.json`: nombre "Field Assistant", `slug` `field-assistant`, paquete de Android
  `com.fieldassistant.app`, orientación vertical, solo Android.
- TypeScript en modo estricto. El alias `@/` apunta a `app/src/`, y funciona igual en
  TypeScript, en Metro y en Jest.
- Sin React Compiler (R41, D20): `app.json` no tiene `experiments.reactCompiler`.
- Todas las librerías de la tabla de stack de `RULES.md`, instaladas con `npx expo install`.
- Plugins de configuración en `app.json`:

| Plugin | Configuración |
| --- | --- |
| `expo-audio` | El texto del permiso de micrófono, en español |
| `react-native-vosk` | El modelo de voz, desde `assets/model-es` |
| `expo-build-properties` | En `android`: `extraProguardRules` con las reglas del punto 6 y, mientras el server de desarrollo sea `http`, `usesCleartextTraffic` |

  `expo-font` y `expo-splash-screen` se instalan acá y se configuran cuando hay con qué: la
  tipografía en el RFC-003, con `VISUAL.md`, y el splash en el RFC-005.

- El modelo de voz (`vosk-model-small-es-0.42`, unos 58 MB descomprimido) no se versiona. Lo
  baja y lo descomprime `app/scripts/get-vosk-model.sh` en `app/assets/model-es`, y esa carpeta
  está en `.gitignore`.
- `app/scripts/vosk-words.py` dice si una palabra está en el vocabulario del modelo:
  - Uso: `python3 scripts/vosk-words.py palabra otra`. Imprime, por cada una, `está` o
    `NO está`. Termina con código 0 si están todas y 1 si falta alguna. Sin argumentos, lista
    todo el vocabulario.
  - El modelo no trae un archivo de palabras: el vocabulario es la tabla de símbolos que está
    al principio de `graph/Gr.fst`. El script la lee en Python 3 puro, sin instalar nada.

### 3. Estructura de carpetas y límites

Se crea la estructura de `RULES.md` (sección 2) con lo mínimo que este RFC necesita:

```
app/src/
  core/configs/
    settings.ts            ajustes con valor por defecto, pisables con EXPO_PUBLIC_*
    settings.test.ts
  di/
    Dependencies.ts        el tipo de lo que el contenedor entrega (por ahora, vacío)
    container.ts           construye las dependencias
    DependenciesProvider/  proveedor de React con el contenedor
    useDependencies.ts     entrega el contenedor
  presentation/features/research/
    components/ResearchScreen/   pantalla provisoria: un botón por comprobación
    hooks/useResearchChecks.ts
  App.tsx                  monta el proveedor y la pantalla
```

Las carpetas de `domain`, `data` y `shared` se crean cuando un RFC les pone contenido.

- **`settings`** lee cada variable con su nombre literal (`process.env.EXPO_PUBLIC_SERVER_URL`),
  nunca con una clave calculada: Expo solo reemplaza las lecturas literales al armar el paquete.
- **`useDependencies`** lee un contexto de React con `use()`. Fuera de `DependenciesProvider`
  lanza un error que lo dice. `Dependencies` arranca vacío: cada RFC le suma sus contratos.
- **Los límites entre capas** (R1 a R7) se comprueban en `app/eslint.config.js`, con
  `no-restricted-imports` por carpeta.
- **`ResearchScreen`** es provisoria: sirve para correr en el teléfono las comprobaciones del
  punto 7. Usa estilos mínimos sin tema y no pasa por `VISUAL.md`: es la única excepción a R24.
  La borra el RFC-003, cuando llega la pantalla real.

### 4. Chequeos

En `app/package.json`:

| Comando | Qué hace |
| --- | --- |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint con la configuración de Expo y los límites entre capas |
| `npm run format` | Prettier sobre `src/` |
| `npm test` | Jest con el preset de Expo |

El primer test es `settings.test.ts`: sin la variable, `serverUrl` es `http://localhost:8787`.

### 5. El server

- `server/`, en Node 24 o superior, que corre TypeScript sin compilar. Sin framework.
- Estructura `src/domain`, `src/data` y `src/http`, más `src/main.ts`. En este RFC `domain` y
  `data` quedan vacías: las llena el RFC-004.
- `npm start` corre `node --env-file=.env src/main.ts` y lo levanta en el puerto de la variable
  `PORT`, o en el 8787 si falta.
- `GET /health` contesta `200 { "ok": true }`. Cualquier otra ruta, `404 { "error": "…" }`.
- `.env.example` con `GEMINI_API_KEY`, `ELEVENLABS_API_KEY` y `PORT`, sin valores. El `.env`
  real no se versiona.
- `npm run typecheck`, con un `tsconfig.json` estricto que no emite archivos.
- `server/scripts/` guarda los scripts de research y sus audios de prueba.

### 6. Builds de Android

- Debug: `npx expo prebuild --platform android` y
  `./gradlew app:assembleDebug -PreactNativeArchitectures=arm64-v8a`. Carga el JavaScript
  desde Metro.
- Release: `./gradlew app:assembleRelease -PreactNativeArchitectures=arm64-v8a`. Usa la firma
  de debug que trae la plantilla. Lleva el JavaScript adentro.
- La plantilla trae encendido R8, el paso que achica el código en release. Para que compile
  hacen falta estas reglas, porque la librería de Vosk llama a su código nativo con JNA:

```
-dontwarn java.awt.**
-keep class com.sun.jna.** { *; }
-keepclassmembers class * extends com.sun.jna.** { public *; }
-keep class org.vosk.** { *; }
```

- No se cambia la versión mínima de Android de la plantilla: el requisito es que funcione en
  Android 11 o superior, y eso se prueba instalando.
- La carpeta `android/` no se versiona: todo ajuste nativo va por `app.json`.

### 7. Research

Cada comprobación se hace en este proyecto y se anota en `docs/RESEARCH.md` con la fecha, el
dispositivo y la versión de Android. La columna "Se espera" es el criterio: si da eso, pasó.
Si da otra cosa, se anota lo que dio y qué cambia. Si contradice un número del PRD, se anota
y decide el usuario; el PRD se corrige con `/manage-changes`.

| # | Qué se comprueba | Cómo | Se espera |
| --- | --- | --- | --- |
| I1 | Grabar con `expo-audio` y leer el volumen mientras graba | `ResearchScreen` | Graba en AAC (`.m4a`) y entrega el volumen varias veces por segundo. El permiso se consulta antes de pedirlo. Se anota el volumen del ambiente y el de una voz, para fijar el umbral |
| I2 | El modelo de lenguaje entiende un audio y devuelve JSON con forma fija, en un solo pedido | `npm run research:interpret` en `server/` | Los tres audios dan el pedido correcto. Se anota el identificador exacto del modelo, la latencia de cada uno, el costo de mil pedidos (contra RNF-07) y el límite de pedidos por minuto que publica el proveedor |
| I3 | La voz de servicio sintetiza una frase | `npm run research:speak` en `server/` | Devuelve audio. Se anota la voz elegida (responde a Q4), la latencia y el costo por carácter |
| I4 | Voces en español del teléfono | `ResearchScreen` | Se listan las voces. En Android la voz se elige por su identificador, no por el idioma con región |
| I5 | Vosk como detector de una frase (responde a Q2) | `ResearchScreen` y `vosk-words.py` | Con una lista que tiene solo la frase, se dispara con cualquier oración. Con una frase de dos palabras más una lista de palabras comunes, no. Se elige la frase |
| I6 | Memoria con el modelo de Vosk cargado | `adb shell dumpsys meminfo` | Sube alrededor de 100 MB |
| I7 | El build de release | Punto 6 | Sin las reglas de R8 falla; con ellas compila. El APK pesa menos de 100 MB |
| I8 | Variables `EXPO_PUBLIC_*` en release | Compilar dos veces cambiando `EXPO_PUBLIC_SERVER_URL` y buscar el valor dentro del APK | El valor queda fijo al armar el paquete. Si no se vacía la caché de Metro, el segundo build conserva el valor viejo. Se anota la receta que funciona |
| I9 | Degradés y sombras en Android 11 | `ResearchScreen` | `backgroundImage` con degradé lineal y radial, y `boxShadow`, se dibujan. El desenfoque en vivo (`filter: blur`) no: necesita Android 12 |
| I10 | Reanimated en el hilo de la interfaz | `ResearchScreen` | Un estilo animado se recalcula solo si lee el valor compartido directamente, no dentro de otra función |
| I11 | Sensor de luz y brillo | `ResearchScreen` y, en el emulador, `adb emu sensor set light` | El sensor entrega lux. `expo-brightness` cambia el brillo solo de la app y sin pedir permiso |
| I12 | [QUITADA] React Compiler: está apagado (D20) | — | — |
| I13 | Latencia de un turno (responde a Q5) | Sumar I1, I2 e I3 en el dispositivo | Desde que termina la escucha hasta tener la respuesta, 5 segundos o menos (RNF-02) |

**Audios de prueba (I2).** Tres archivos `.m4a` en `server/scripts/samples/`, grabados por el
usuario con `ResearchScreen` (I1) y versionados: `rain.m4a` ("Llovieron 18 milímetros
anoche"), `move.m4a` ("Pasé 40 vaquillonas del lote 3 al 5") y `missing.m4a` ("Mové quince
terneros"). Para el research alcanza una forma mínima del JSON: `intent`, `transcript` y los
datos del pedido. La forma definitiva es del RFC-004.

**Frase de manos libres (I5).** Se prueban al menos dos candidatas de dos palabras, que
`vosk-words.py` confirme en el vocabulario: por ejemplo "escuchame asistente" y "hola
asistente". Con cada una: se dice cinco veces y después se habla treinta segundos de otra cosa.
Se cuentan los aciertos y los disparos por error. La lista de palabras comunes son unas setenta
palabras frecuentes y del campo ("hola", "que", "lote", "vacas", "llovieron", los números…),
todas del vocabulario. Gana la candidata con cinco aciertos y menos disparos por error; el
usuario la confirma.

### 8. Documentos

- `README.md`: requisitos, cómo instalar, cómo bajar el modelo de voz, cómo compilar los dos
  builds y cómo levantar el server y cargar sus claves.
- `DECISIONS.md`: el stack y la arquitectura, con qué se resigna en cada una.
- `AI-USAGE.md`: qué herramienta de IA se usó en este RFC y para qué.
- `docs/RESEARCH.md`: las doce comprobaciones (I12 quedó quitada).

## Contratos que quedan

```ts
// di/Dependencies.ts
export type Dependencies = {};   // cada RFC suma sus contratos

// di/useDependencies.ts
export function useDependencies(): Dependencies;

// core/configs/settings.ts
export const settings: {
  serverUrl: string; // EXPO_PUBLIC_SERVER_URL, por defecto http://localhost:8787
};
```

Server: `GET /health` → `200 { "ok": true }`.

## Criterios de aceptación

**Proyecto**

1. `app/` es un proyecto de Expo SDK 58 con TypeScript estricto. `app.json` tiene el nombre, el
   `slug`, el paquete, la orientación y la plataforma del punto 2.
2. Están instaladas todas las librerías de la tabla de stack de `RULES.md`, y `app.json` tiene
   configurados los tres plugins de la tabla del punto 2.
3. El alias `@/` resuelve a `app/src/` en `npm run typecheck`, en la app y en `npm test`.
4. `app/scripts/get-vosk-model.sh` baja el modelo a `app/assets/model-es`. Esa carpeta, `.env`
   y `android/` están en `.gitignore`.
5. `app/scripts/vosk-words.py` responde `está` o `NO está` por cada palabra, con código de
   salida 0 o 1.
6. Existen `core/configs/settings.ts`, `di/Dependencies.ts`, `di/container.ts`,
   `di/DependenciesProvider/`, `di/useDependencies.ts`, `App.tsx` y la feature `research`, en
   las rutas del punto 3.
7. React Compiler está apagado: `app.json` no tiene `experiments.reactCompiler` (D20).

**Chequeos**

8. `npm run typecheck`, `npm run lint`, `npm run format` y `npm test` terminan sin errores en
   `app/`.
9. `settings.test.ts` comprueba el valor por defecto de `serverUrl`.
10. Un import prohibido por R1 a R7 hace fallar `npm run lint`. Se demuestra agregando en
    `core/configs/` un archivo que importa de `di/`, pegando la salida del lint y borrándolo.

**Server**

11. `npm start` en `server/` levanta el server en el puerto 8787. `GET /health` contesta
    `{ "ok": true }` y una ruta que no existe contesta `404`.
12. `npm run typecheck` termina sin errores en `server/`.
13. Existen `server/.env.example`, con las tres variables y sin valores, y las carpetas
    `src/domain`, `src/data`, `src/http` y `scripts/`.

**Builds**

14. El build de debug compila, se instala en un dispositivo con Android 11 o superior y la app
    abre en `ResearchScreen`.
15. El build de release compila con las reglas de R8 puestas en `app.json`, y su peso queda
    anotado.

**Research**

16. `docs/RESEARCH.md` tiene las doce comprobaciones, de I1 a I13 sin I12, cada una con fecha,
    dispositivo, versión de Android, lo que se esperaba y lo que dio.
17. Q2 (la frase elegida), Q4 (la voz elegida) y Q5 (la latencia medida) del PRD quedan
    contestadas en `docs/RESEARCH.md`.
18. `ResearchScreen` tiene un botón por cada comprobación que se hace en el teléfono (I1, I4,
    I5, I9, I10 e I11) y muestra el resultado.
19. Existen `server/scripts/samples/` con los tres audios, y los comandos
    `npm run research:interpret` y `npm run research:speak`.

**Documentos**

20. Existen `README.md`, `DECISIONS.md` y `AI-USAGE.md` con el contenido del punto 8, y los
    comandos que cita el README funcionan.

## Reglas que aplican

R1 a R7 (capas y lint), R15 (inyección a mano), R19 a R23 (carpeta y archivos de cada
componente), R34 y R35 (comentarios y validaciones), R41 y R42 (sin React Compiler y `use()`),
R48 a R50 (tests), R52 a R55 (server), R56 a R62 (proceso).

## Riesgos y casos límite

- **Una librería no compila con esta versión de Expo.** Se anota en `RESEARCH.md` y se para:
  cambiar de librería es una decisión del usuario.
- **No hay teléfono real.** Las comprobaciones se hacen en el emulador y se anota: la latencia
  y la memoria de un emulador no predicen las de un gama media.
- **El tiempo.** El PRD le da 30 minutos a esta etapa. Si el research se alarga, se hacen
  primero I1, I2, I3, I7 e I13, que son las que condicionan a los RFC siguientes, y el resto se
  anota como pendiente.

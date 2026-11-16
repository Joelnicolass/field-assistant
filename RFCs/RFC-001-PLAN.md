# Plan · RFC-001 · Base del proyecto, librerías y research

Seis pasos. Cada uno deja el proyecto compilando y se revisa de una sentada. `dev` implementa,
`qa` prueba y el flujo se detiene para la revisión del usuario.

**Dispositivo:** Motorola moto e40, Android 11 (API 30), arm64-v8a, 3,4 GB de RAM, por USB.

| Paso | Objetivo | Estado |
| --- | --- | --- |
| 1 | La app de Expo con todas las librerías y su configuración | aprobado |
| 2 | Estructura de carpetas, `settings`, `di` y los chequeos con sus límites | aprobado |
| 3 | El server mínimo | aprobado |
| 4 | Los builds de debug y release en el teléfono | pendiente |
| 5 | `ResearchScreen` y las comprobaciones en el teléfono | pendiente |
| 6 | Los scripts de research del server y los documentos | pendiente |

---

## Paso 1 · La app de Expo con todas las librerías

**Objetivo:** `app/` es un proyecto de Expo SDK 58, con TypeScript estricto, todas las
librerías de la tabla de stack instaladas y `app.json` configurado.

```
[~] .gitignore                    suma app/assets/model-es/, app/android/ y app/ios/
app/
  [+] package.json                Expo 58 y las librerías del stack, instaladas con npx expo install
  [+] app.json                    nombre, slug, paquete com.fieldassistant.app, vertical, solo
                                  Android; plugins expo-audio (permiso en español),
                                  react-native-vosk (assets/model-es) y expo-build-properties
                                  (reglas de R8 y usesCleartextTraffic); sin React Compiler (D20)
  [+] tsconfig.json               estricto, alias @/ → src/
  [+] babel.config.js             solo si el alias lo necesita
  [+] index.ts                    punto de entrada que registra App
  [+] src/App.tsx                 provisorio: un texto, hasta el paso 2
  [+] scripts/get-vosk-model.sh   baja y descomprime vosk-model-small-es-0.42 en assets/model-es
  [+] scripts/vosk-words.py       dice si cada palabra está en el vocabulario (lee graph/Gr.fst)
```

**Criterios que cubre:** 1, 2, 4, 5 y 7. El 3 queda a medias: el alias en TypeScript; en Metro y
Jest se comprueba en el paso 2.

**Cómo lo comprueba `qa`:**

- `npx tsc --noEmit` en `app/`.
- `npx expo install --check`: ninguna librería fuera de la versión del SDK. Si alguna versión
  difiere de la tabla de `RULES.md`, lo informa para corregir la tabla.
- Lee `app.json` contra el punto 2 del RFC: nombre, slug, paquete, orientación, plataforma y los
  tres plugins.
- `bash scripts/get-vosk-model.sh` y que `assets/model-es/graph/Gr.fst` exista.
- `python3 scripts/vosk-words.py hola asistente` → código 0;
  `python3 scripts/vosk-words.py hola zzqx` → código 1, con `NO está` en la segunda.
- `git status` no lista `assets/model-es`.
- React Compiler apagado: `npx expo config` no muestra `reactCompiler` (D20).

---

## Paso 2 · Estructura, `settings`, `di` y los chequeos

**Objetivo:** las carpetas del RFC con su contenido mínimo, los cuatro comandos de chequeo y los
límites entre capas comprobados por el lint.

```
app/
  [~] package.json                       scripts typecheck, lint, format y test; jest-expo
  [+] eslint.config.js                   configuración de Expo + no-restricted-imports por
                                         carpeta (R1 a R7)
  [+] .prettierrc                        formato
  [+] jest.config.js                     preset jest-expo y el alias @/
  [~] src/App.tsx                        monta DependenciesProvider y ResearchScreen
  [+] src/core/configs/settings.ts       serverUrl desde EXPO_PUBLIC_SERVER_URL (lectura
                                         literal), por defecto http://localhost:8787
  [+] src/core/configs/settings.test.ts  el valor por defecto
  [+] src/di/Dependencies.ts             tipo vacío
  [+] src/di/container.ts                construye las dependencias (por ahora, ninguna)
  [+] src/di/DependenciesProvider/       DependenciesProvider.tsx e index.ts
  [+] src/di/useDependencies.ts          use() del contexto; fuera del proveedor lanza un error
  [+] src/presentation/features/research/
        components/ResearchScreen/       ResearchScreen.tsx e index.ts: el esqueleto, con el
                                         título y sin comprobaciones todavía
        hooks/useResearchChecks.ts       el esqueleto: la lista vacía de comprobaciones
```

**Criterios que cubre:** 3, 6, 8, 9 y 10.

**Cómo lo comprueba `qa`:**

- `npm run typecheck`, `npm run lint`, `npm run format` y `npm test` en `app/`, con la salida.
- `settings.test.ts` pasa, y un test que usa `@/` prueba que el alias anda en Jest.
- Criterio 10: agrega en `core/configs/` un archivo que importa de `di/`, corre `npm run lint`,
  pega el error y borra el archivo. Lo mismo con un import de `data/` desde `presentation/`.
- `npx expo export --platform android` arma el paquete: el alias anda en Metro.

---

## Paso 3 · El server mínimo

**Objetivo:** `server/` corre TypeScript sin compilar en Node 24, contesta `/health` y tiene
sus carpetas y su `.env.example`.

```
server/
  [+] package.json        start (node --env-file=.env src/main.ts) y typecheck
  [+] tsconfig.json       estricto y sin emitir
  [+] .env.example        GEMINI_API_KEY, ELEVENLABS_API_KEY y PORT, sin valores
  [+] src/main.ts         levanta el server en PORT o en 8787
  [+] src/http/           las rutas: GET /health → 200 { ok: true }; el resto → 404 { error }
  [+] src/domain/         vacía (.gitkeep)
  [+] src/data/           vacía (.gitkeep)
  [+] scripts/            vacía (.gitkeep); la llena el paso 6
```

`server/.env` ya existe con las claves y lo ignora git.

**Criterios que cubre:** 11, 12 y 13.

**Cómo lo comprueba `qa`:**

- `npm run typecheck` en `server/`.
- `npm start` en segundo plano, `curl -i localhost:8787/health` → `200 {"ok":true}`,
  `curl -i localhost:8787/nada` → `404`. Lo apaga al terminar.
- `.env.example` sin valores y `git status` sin `.env`.

---

## Paso 4 · Los builds en el teléfono

**Objetivo:** el build de debug se instala en el moto e40 y abre en `ResearchScreen`; el de
release compila con las reglas de R8.

```
app/
  [~] app.json            solo si el build pide un ajuste (todo ajuste nativo va por acá)
docs/
  [+] RESEARCH.md         empieza: I7 e I8, con fecha, dispositivo y Android
```

**Criterios que cubre:** 14 y 15. Research: I7 e I8.

**Cómo lo comprueba `qa`:**

- `npx expo prebuild --platform android --clean` y
  `./gradlew app:assembleDebug -PreactNativeArchitectures=arm64-v8a`.
- `adb install`, `adb reverse tcp:8081 tcp:8081`, Metro levantado y la app abierta con
  `adb shell am start`. Captura de pantalla con `adb exec-out screencap`: se ve `ResearchScreen`.
- I7: `assembleRelease` sin las reglas de R8 (falla) y con ellas (compila); el peso del APK.
- I8: dos builds de release con distinto `EXPO_PUBLIC_SERVER_URL`, buscando el valor dentro del
  APK; con y sin vaciar la caché de Metro. Anota la receta.

---

## Paso 5 · `ResearchScreen` y las comprobaciones en el teléfono

**Objetivo:** un botón por cada comprobación que se hace en el teléfono, con su resultado en
pantalla, y las comprobaciones hechas y anotadas.

```
app/src/presentation/features/research/
  [~] components/ResearchScreen/ResearchScreen.tsx   la lista de botones y resultados
  [+] components/ResearchScreen/styles.ts            estilos mínimos sin tema (excepción a R24)
  [+] components/ResearchScreen/constants.ts         textos y números fijos
  [~] hooks/useResearchChecks.ts                     entrega la lista de comprobaciones
  [+] hooks/checks/                                  una función por comprobación: I1, I4, I5,
                                                     I9, I10 e I11
docs/
  [~] RESEARCH.md                                    I1, I4, I5, I6, I9, I10 e I11
server/scripts/samples/
  [+] rain.m4a, move.m4a, missing.m4a                grabados por vos con I1
```

**Criterios que cubre:** 18, y parte del 16 y el 17 (Q2, la frase de manos libres). Research:
I1, I4, I5, I6, I9, I10 e I11.

**Cómo lo comprueba `qa`:**

- `npm run typecheck`, `npm run lint` y `npm test`.
- Instala el build de debug y abre cada comprobación desde la pantalla, con capturas.
- I6: `adb shell dumpsys meminfo com.fieldassistant.app`, antes y después de cargar Vosk.
- I11: el teléfono entrega lux; el brillo cambia solo en la app.
- **Quedan `MANUAL` para vos:** grabar los tres audios (I1), decir las frases candidatas de
  manos libres cinco veces y hablar treinta segundos de otra cosa (I5), y elegir la frase.

---

## Paso 6 · Los scripts de research del server y los documentos

**Objetivo:** el research de los proveedores hecho y anotado, y los documentos de entrega
empezados.

```
server/
  [~] package.json                    research:interpret y research:speak
  [+] scripts/interpret.ts            manda los tres audios al modelo y mide latencia y costo
  [+] scripts/speak.ts                sintetiza una frase con la voz de servicio
docs/
  [~] RESEARCH.md                     I2, I3 e I13; Q2, Q4 y Q5 contestadas
[+] README.md                         requisitos, instalar, bajar el modelo, los dos builds,
                                      levantar el server y cargar las claves
[+] AI-USAGE.md                       qué herramienta de IA se usó en este RFC y para qué
[~] DECISIONS.md                      solo lo que decidas en este RFC, con tu OK
[~] RULES.md                          la tabla de stack, si npx expo install eligió otras
                                      versiones
```

**Criterios que cubre:** 16, 17, 19 y 20. Research: I2, I3 e I13.

**Cómo lo comprueba `qa`:**

- `npm run typecheck` en `server/`.
- `npm run research:interpret`: los tres audios dan el pedido correcto; latencia de cada uno,
  identificador del modelo, costo de mil pedidos y límite por minuto.
- `npm run research:speak`: devuelve audio (ver el bloqueo de abajo).
- Sigue el README desde cero en una carpeta limpia y corre cada comando que cita.
- `RESEARCH.md` tiene I1 a I13 sin I12, cada una con fecha, dispositivo, Android, lo esperado y lo que
  dio.

---

## Bloqueos y preguntas

| Qué | Afecta | Qué hace falta |
| --- | --- | --- |
| La clave de ElevenLabs está en su tope de créditos (quedan 6) y tenías pendiente rotarla | I3 y la mitad de I13 (paso 6) | Subir el tope o cargar otra clave. Mientras tanto, I3 queda `BLOQUEADO` y la latencia se mide sin la voz de servicio |
| Q8: los minutos por etapa y el orden de recorte | El RFC entero: el PRD le da 30 minutos y este plan es más largo | Que lo confirmes o lo cambies. `RFCS.md` lo pide antes de empezar |
| Q7 | — | Resuelta: moto e40 con Android 11. En el PRD sigue abierta, igual que Q1, Q3 y Q6 |

## Contradicciones entre documentos

1. **El PRD marca abiertas Q1, Q3, Q6 y Q7.** `DECISIONS.md` (D19, D17 y D18) y la prueba con el
   moto e40 ya las cerraron. Manda el PRD: hay que marcarlas resueltas ahí.
2. **El RFC (punto 8) dice que este RFC crea `DECISIONS.md` con el stack y la arquitectura.** Ya
   existe, con D1 a D19. No se reescribe: solo se suma lo que decidas en este RFC.

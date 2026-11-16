# Lectura en frío · RFC-001 (Base, librerías y research)

Leídos: `CHALLENGE.md`, `PRD.md`, `FEATURES.md`, `RULES.md`, `CLAUDE.md` y el RFC-001.
Pregunta guía: qué tendría que adivinar para implementarlo. Orden: de mayor a menor impacto.
`[BLOQUEA]` = sin resolverlo no se puede escribir el código o no se puede decidir si está bien.

---

## 1. [BLOQUEA] `readNumber` y `settings` no tienen firma, y el valor puede quedar mal fijado en release

**RFC (§4 y "Contratos que quedan"):** "`readNumber` … devuelve el número de la variable, o el valor
por defecto si falta o no es un número". `settings` solo expone `serverUrl`.

**Qué hay que adivinar:**
- La firma. Si recibe el nombre de la variable y lee `process.env[name]` de forma dinámica, Expo no
  la reemplaza en el paquete y en release siempre da el valor por defecto (justo lo que I8 investiga).
  Si recibe el valor ya leído, hay que decir quién lo lee.
- Qué es "no es un número": `""`, `"abc"`, `"Infinity"`, `"-3"`, `" 5 "`.
- `settings` hoy no tiene ningún campo numérico, así que `readNumber` no tiene quién lo use. Es código
  sin consumidor (choca con R39) o hay un campo que el RFC no nombra.
- `settings.test.ts` está en el árbol y no se dice qué prueba.

**Agregar en §4:**
> `readNumber(rawValue: string | undefined, defaultValue: number): number`. Recibe el valor ya leído;
> devuelve `defaultValue` si es `undefined`, vacío, no finito (`Number.isFinite`) o no numérico. Acepta
> negativos y decimales. `settings.ts` lee cada variable con su nombre literal
> (`process.env.EXPO_PUBLIC_SERVER_URL`), nunca con una clave calculada, porque Expo solo reemplaza
> las lecturas literales. Se agrega a `settings` el campo `researchRecordingMs: number`
> (`EXPO_PUBLIC_RESEARCH_RECORDING_MS`, por defecto 5000), usado por `ResearchScreen` en I1, para que
> `readNumber` tenga un consumidor. `settings.test.ts` prueba: sin variable → `http://localhost:8787`;
> con variable → su valor.

Agregar al criterio 8 los casos: vacía, "abc" y "Infinity" → valor por defecto.

---

## 2. [BLOQUEA] I2: no hay audios, ni forma del JSON, ni cómo se mide el costo

**RFC (§7, I2):** "Script en `server/scripts/` con tres audios de prueba … Devuelve el pedido y sus
datos. Se anota el identificador exacto del modelo, la latencia y el límite de pedidos por minuto".

**Qué hay que adivinar:** quién graba los audios, qué dicen, en qué formato (¿`.m4a` de I1?), dónde se
guardan, cuál es el "JSON con forma fija" (no hay esquema), cómo se carga la clave (`.env`), el comando
que corre el script y cómo se mide el límite de pedidos por minuto (¿de la documentación o midiendo?).
Además, `RNF-07` exige "entender mil pedidos cuesta 1 dólar o menos" y el RFC no pide medir tokens ni
costo por pedido, solo el de la voz (I3). I13 depende de I2, así que tampoco corre sin esto.

**Agregar en I2:**
> Audios: `server/scripts/samples/rain.m4a` ("Llovieron 18 milímetros anoche"), `move.m4a` ("Pasé 40
> vaquillonas del lote 3 al 5") y `missing.m4a` ("Mové quince terneros"), grabados por la persona con
> `ResearchScreen` (I1) o con el micrófono del Mac, en `.m4a` AAC; se versionan (pesan poco). Forma del
> JSON, solo para el research: `{ "intent": "register_rain" | "move_animals" | "query_rain" |
> "query_lot" | "not_understood", "missing": string[], "data": object }`. Se corre con
> `npm run research:interpret` (clave desde `.env`). Se anotan: identificador exacto del modelo,
> latencia de cada audio, tokens de entrada y salida, costo por pedido y su proyección a 1.000 pedidos
> contra RNF-07, y el límite de pedidos por minuto leído de la consola del proveedor (con la fecha).
> Esperado: los tres audios dan el `intent` correcto y `missing` no vacío en el tercero.

Agregar al criterio 15 que I2 incluya el costo por 1.000 pedidos.

---

## 3. [BLOQUEA] `vosk-words.py` e I5: sin interfaz, sin método y sin frases candidatas

**RFC (§2 e I5):** "dice si una palabra está en el vocabulario del modelo. El modelo no trae un archivo
de palabras: el vocabulario está dentro de `graph/Gr.fst`". I5: "con una lista que tiene solo la frase,
se dispara con cualquier oración…".

**Qué hay que adivinar:** cómo se lee un `.fst` binario sin herramientas (¿OpenFst instalado? ¿se
parsea en Python puro? ¿qué versión de Python?), cómo se invoca, qué imprime y con qué código de
salida. Para I5: qué frases candidatas se prueban (no hay ninguna; Q2 del PRD pide elegir una), cuál es
la "lista de palabras comunes", cuántas oraciones de prueba se dicen y cuántos disparos falsos son
aceptables. Criterio 16 pide Q2 "contestada" sin decir con qué forma: la frase elegida.

**Agregar en §2:**
> `python3 app/scripts/vosk-words.py <palabra> [<palabra> …]`: solo biblioteca estándar. Lee los
> símbolos de `app/assets/model-es/graph/` (indicar el archivo exacto tras verificarlo) y por cada
> palabra imprime `palabra: sí` o `palabra: no`. Código de salida 0 si todas están, 1 si falta alguna,
> 2 si no encuentra el modelo.

**Agregar en I5:** candidatas (mínimo 3, de dos palabras, que incluyan "La Tranquera" y al menos una
más que no sea el nombre del campo); 10 oraciones de prueba sin la frase y 5 con ella, dichas en voz
alta; se anota cuántas veces dispara en cada configuración. Se espera: lista solo-frase dispara en
casi todas las oraciones; frase + palabras comunes, en ninguna de las 10 y en 4 de 5 de las 5. Q2 se
contesta con la frase elegida, sus dos palabras verificadas con `vosk-words.py` y los resultados.

---

## 4. [BLOQUEA] Build de release: faltan las claves de `app.json` y que R8 esté encendido

**RFC (§2 y §6):** el plugin `expo-build-properties` lleva "las reglas de R8 del punto 6 y … el
permiso de tráfico sin cifrar". I7: "Sin las reglas de R8 falla; con ellas compila".

**Qué hay que adivinar:** los nombres de las opciones (`android.extraProguardRules`,
`android.enableProguardInReleaseBuilds`, `android.usesCleartextTraffic`), y sobre todo que R8 tiene
que estar encendido: en la plantilla de Expo la minificación del release viene apagada, así que "sin
las reglas falla" no se reproduce a menos que se la prenda. Tampoco se dice qué `minSdkVersion` va
(PRD: Android 11 = API 30), ni quién quita el tráfico sin cifrar cuando el server pase a https
(F24 exige https, y el RFC no atribuye ese cambio a ningún RFC). El criterio 14 solo dice "compila";
no cubre el peso del APK (RNF-09, I7) ni I8.

**Agregar en §6 (tras verificar los nombres en los tipos instalados, R58):**
> `expo-build-properties`, bloque `android`: `minSdkVersion: 30`, `enableProguardInReleaseBuilds: true`,
> `extraProguardRules` con las cuatro líneas, `usesCleartextTraffic: true`. El RFC-005 pasa
> `usesCleartextTraffic` a `false` al publicar el server con https.

**Cambiar el criterio 14:**
> El build de release termina con `BUILD SUCCESSFUL`, el APK `app-release.apk` pesa 100 MB o menos
> (`ls -l`), se instala en Android 11+ y abre en `ResearchScreen`. Con las reglas de R8 quitadas
> falla; con ellas puestas compila (se anota el error exacto en RESEARCH.md, I7).

---

## 5. Lint de capas: el archivo de configuración no existe en el RFC y la demostración no es reproducible

**RFC (§3 y criterio 9):** "El lint comprueba los límites entre capas (R1 a R7) con
`no-restricted-imports` por carpeta … Se demuestra con la salida del lint sobre un archivo de prueba,
que después se borra."

**Qué hay que adivinar:** el archivo (`eslint.config.js`) no está en el árbol ni en los criterios;
cuáles patrones expresan cada R (R3 prohíbe también `fetch` y "otra carpeta de `data`", que no son
imports de paquete; R6 prohíbe importar "nada del proyecto", pero `settings.ts` importa `readNumber`);
si basta un caso o hay uno por regla; dónde queda la evidencia, ya que el archivo se borra; y que
`domain`, `data` y `shared` todavía no existen.

**Agregar en §3 y cambiar el criterio 9:**
> `app/eslint.config.js` define un bloque por carpeta (`domain`, `data`, `data/usecases`,
> `presentation`, `shared`, `core`), con los patrones de R1 a R6; `core` permite imports relativos
> dentro de `core`. R3 se aplica prohibiendo `expo-*`, `react-native*` y `data/(repositories|datasources|services)`
> en `data/usecases`; lo de `fetch` no lo cubre el lint y se deja a la revisión.
> **Criterio 9:** para cada una de R1 a R6 se crea un archivo con un import prohibido, `npm run lint`
> falla con la regla `no-restricted-imports` apuntando a ese archivo, y se pega la salida de las seis
> corridas en `docs/RESEARCH.md` (sección "Límites de capas"). Los seis archivos se borran después y
> `npm run lint` vuelve a pasar. R7 es esta comprobación.

---

## 6. Contrato de DI incompleto y en conflicto con R19, R14 y R4

**RFC (§3 y contratos):** `useDependencies(): Dependencies` y `container.ts` "arma las dependencias
(por ahora, ninguna)"; carpeta `DependenciesProvider/`; `ResearchScreen` corre las comprobaciones.

**Qué hay que adivinar:**
- Dónde se define `Dependencies` (R17, un símbolo por archivo; no está en el árbol) y dónde el
  contexto. Con cero campos, `Dependencies` es un tipo vacío que el lint de TypeScript suele rechazar.
- `DependenciesProvider/` sigue R19 (`styles.ts` y `constants.ts` obligatorios) pero no es un
  componente visual. No se dice si se exime.
- `useResearchChecks.ts` llama a `expo-audio`, `expo-speech`, `react-native-vosk`, etc. directamente.
  R14 dice que los hooks usan contratos de `domain/services`, y R4 solo deja importar `domain`,
  `shared`, `core` y `di`. El RFC cita solo una excepción (R24), no esta.

**Agregar en §3:**
> Archivos extra en `di/`: `Dependencies.ts` (`export type Dependencies = Record<string, never>`
> mientras no haya dependencias) y `DependenciesContext.ts`. `DependenciesProvider/` contiene
> `DependenciesProvider.tsx` e `index.ts`; queda exento de `styles.ts` y `constants.ts` (no dibuja).
> `useDependencies` lanza un error si se usa fuera del proveedor.
> Excepción documentada: `useResearchChecks` importa los módulos de Expo y de Vosk directamente,
> sin pasar por `domain/services`, porque no hay contratos todavía. La excepción se anota en
> "Riesgos" junto a la de R24 y desaparece con el RFC-003. El lint no la marca porque R4 no
> restringe paquetes externos.

Agregar a los criterios 5 y 9 que los archivos de `di/` existan y que `ResearchScreen` renderice
dentro del proveedor.

---

## 7. Cosas que la prosa nombra y los criterios no cubren

Lo que no está en los criterios, en la práctica no se construye. Faltan:

| La prosa dice (sección) | Qué falta |
| --- | --- |
| `app.json`: nombre, `slug`, paquete, vertical, solo Android (§2) | El criterio 1 y el 2 no verifican ninguno. |
| Sin enrutador; no corre en Expo Go (§2) | Sin criterio. |
| `npm run format` / Prettier (§4) | Solo se piden typecheck, lint y test (criterio 7). |
| `settings.ts` con `serverUrl` por defecto y `settings.test.ts` (§3, contratos) | Sin criterio. |
| Server: `src/domain`, `src/data`, `src/http`, `src/main.ts` (§5) | Sin criterio. |
| `server/scripts/` con los scripts de I2 e I3 (§5) | Sin criterio. |
| `vosk-words.py` (criterio 4) | El criterio no dice qué debe imprimir (ver hallazgo 3). |
| Permiso de tráfico sin cifrar (§2) | Sin criterio. |
| Alias `@/` (criterio 1) | No dice cómo se comprueba (ver hallazgo 11). |
| Contenido de `README`, `DECISIONS`, `AI-USAGE` (criterio 18) | "Con el contenido del punto 8" es vago (ver hallazgo 15). |
| `accessibilityRole` y `accessibilityLabel` en cada botón (R47) | Sin criterio. |

**Agregar (nuevos criterios):**
> 1b. `app.json` tiene `name: "Field Assistant"`, `slug: "field-assistant"`,
> `android.package: "com.fieldassistant.app"`, `orientation: "portrait"`, `platforms: ["android"]`, y
> no existe `ios/`. 7b. `npm run format -- --check` termina sin errores. 5b. `app/package.json` no
> contiene `expo-router` ni `react-navigation`. 12b. `server/src/` tiene `domain/`, `data/`, `http/` y
> `main.ts`. 17b. Cada botón de `ResearchScreen` tiene `accessibilityRole` y `accessibilityLabel`.

---

## 8. Las comprobaciones de investigación no tienen criterio de "pasó / no pasó"

**RFC (§7):** "Se espera" con verbos y números blandos.

Casos concretos:
- **I1**: "entrega el volumen varias veces por segundo" (¿cuántas?). "El permiso se consulta antes de
  pedirlo": ¿cómo se ve? Se espera: al menos 4 lecturas por segundo y el estado del permiso mostrado
  antes del pedido.
- **I6**: "Sube alrededor de 100 MB" no dice de qué base ni qué columna de `meminfo` (¿TOTAL PSS?). Se
  anota línea base, con el modelo cargado y la diferencia, siempre del mismo campo.
- **I8**: no dice qué variable ni cómo se ve el valor en el paquete. Propuesta: `EXPO_PUBLIC_SERVER_URL`
  se muestra en `ResearchScreen`; se compila con valor A, se instala, se compila con B sin vaciar la
  caché, se instala y se compara, y luego se repite con `npx expo start --clear`/`--reset-cache`.
- **I9**: el desenfoque "no funciona" solo se puede ver en Android 11 (API 30); si el emulador es otro,
  la comprobación no sirve. Exigir un AVD API 30 para I9 y anotarlo.
- **I10**: "se recalcula solo si lee el valor directamente" no dice cómo se observa. Propuesta: dos
  estilos animados, uno que lee `sharedValue.value` dentro del worklet y otro que lo lee a través de
  una función, y un contador visible de recálculos o el movimiento observado; se anota cuál reacciona.
- **I11**: `adb emu sensor set light` solo existe en el emulador; en un teléfono físico hay que tapar
  el sensor. Anotarlo.
- **I12**: "Está encendido" sin método. Propuesta: aparece la marca "Memo ✨" en las herramientas de
  desarrollo o se compila con `babel-plugin-react-compiler` sin errores y se muestra la salida.
- **I13**: "entre 3 y 5 segundos" contradice RNF-02 (máximo 5, objetivo 3). Cambiar a "5 s o menos; el
  objetivo es 3 s", y decir si cuenta hasta que empieza a sonar la voz o hasta que aparece la tarjeta.

**Agregar al criterio 15:** cada fila de RESEARCH.md tiene las columnas Fecha, Dispositivo, Android,
Se esperaba, Dio, Veredicto (cumple / no cumple / cambia X) y Qué cambia.

---

## 9. Q4 y Q5: faltan el procedimiento y quién corrige el PRD

**RFC (I3, I13 y criterio 16):** "Se anota la voz elegida (responde a Q4)"; I13 "responde a Q5".

**Qué hay que adivinar:** entre cuántas voces se elige, con qué criterio (acento rioplatense:
"vos", "ll", "sh"), quién juzga (el usuario, a oído) y qué se hace si ninguna suena rioplatense. Para
Q5: el PRD dice que, si 5 s no se alcanza, "se corrige este número antes de la etapa 4"; el RFC no dice
quién ni dónde (¿modifica `PRD.md`, que es de mayor autoridad que el RFC?).

**Agregar en I3:**
> Se sintetiza la frase "Anotado. Van 56 milímetros en el mes" con al menos 3 voces de la biblioteca
> con acento rioplatense o neutro. El usuario elige a oído y se anota la elegida, el identificador, el
> costo por carácter y la fecha. Si ninguna suena rioplatense, se anota y se elige la más cercana.
> **En "Riesgos":** si I13 da más de 5 s, se anota en RESEARCH.md, se avisa al usuario y se usa
> `/manage-changes` para ajustar RNF-02; el RFC no edita el PRD.

---

## 10. Server: faltan detalles para que `npm start` funcione en Node 24 sin compilar

**RFC (§5):** "Node 24 o superior, que corre TypeScript sin compilar. Sin framework … `npm start` lo
levanta en el puerto 8787 … `.env.example` con … `PORT`, sin valores".

**Qué hay que adivinar:**
- Node 24 borra tipos pero no admite `enum`, `namespace` ni imports sin extensión `.ts`; hace falta
  un `tsconfig.json` con `allowImportingTsExtensions`, `erasableSyntaxOnly` y `noEmit` para que
  `npm run typecheck` pase.
- Cómo se carga `.env`: `node --env-file=.env` falla si el archivo no existe, y el criterio 10 no
  debería exigir claves.
- Si `PORT` va vacío en `.env.example`, el puerto 8787 es el valor por defecto; no se dice.
- Qué contesta `/health` a otros métodos o rutas (404).

**Agregar en §5:**
> `server/tsconfig.json` con `"module": "nodenext"`, `"allowImportingTsExtensions": true`,
> `"erasableSyntaxOnly": true`, `"noEmit": true`, `"strict": true`. `npm start` es
> `node --env-file-if-exists=.env src/main.ts`; el server lee `process.env.PORT ?? 8787` y arranca sin
> claves (solo los scripts de `scripts/` las exigen). Otra ruta o método → `404 { "error": "not_found" }`.
> Criterio 10: `curl -i http://localhost:8787/health` da `200` y `{"ok":true}`, y `curl` a `/x` da 404.

---

## 11. Estructura, alias y Jest: el RFC promete más que lo que describe

- El resumen dice "la estructura de carpetas de `RULES.md`" y F26 pide "la estructura … de `RULES.md`", pero
  §3 crea solo una parte y dice que `domain`, `data` y `shared` se crean después. Cambiar el resumen a
  "la parte de la estructura que este RFC usa" y F26 queda cubierto con "el lint tiene sus reglas aunque
  la carpeta no exista".
- El alias `@/` figura en el criterio 1 sin método de comprobación y se necesita en tres lugares:
  `tsconfig.json` (`paths`), Jest (`moduleNameMapper`) y ESLint (resolver). Agregar: "`tsconfig.json`,
  `jest.config.js` y la config de ESLint resuelven `@/`; `settings.test.ts` lo importa con `@/` y pasa".
- La tabla de stack no incluye `babel-plugin-react-compiler` (hace falta para R41) ni la herramienta
  de lint del compilador. Agregar ambos a `RULES.md` o decir que se instalan con el RFC y se anotan
  en `DECISIONS.md`.
- El RFC dice "si alguna versión difiere … se corrige la tabla" (RULES.md). Agregar un criterio:
  "`npm ls` muestra cada paquete de la tabla, y las diferencias con `RULES.md` se listan en
  `DECISIONS.md` y se corrigen en `RULES.md`".

---

## 12. VISUAL.md no existe y la tipografía no se nombra

**RFC (§2, plugin `expo-font`):** "La tipografía, incrustada en el APK".

**Qué hay que adivinar:** qué fuente, qué pesos y de dónde sale el archivo. `RULES.md` (R24) dice que
los valores salen de `VISUAL.md`, que `CLAUDE.md` exige antes de cualquier RFC con pantallas, y que no
existe todavía (solo `docs/visual-refs/`). El RFC exime a `ResearchScreen` solo de R24.

**Agregar en §2:**
> `expo-font` queda configurado con la ruta `assets/fonts/` pero sin archivos hasta que exista
> `VISUAL.md` (RFC-003); este RFC solo comprueba que el plugin compila con una fuente de prueba de
> código abierto, que se borra al final. **En "Riesgos":** `ResearchScreen` no pasa por `VISUAL.md`
> (excepción a la regla de `CLAUDE.md`, no solo a R24).

---

## 13. Dispositivos, red y claves: supuestos sin escribir

- La URL por defecto es `http://localhost:8787`. En un teléfono físico no llega al server sin
  `adb reverse tcp:8787 tcp:8787` (y Metro necesita `tcp:8081`). El RFC no lo menciona ni lo pide al
  README (criterio 18).
- "Sin claves de los proveedores … se para y se piden" contradice PRD S6 ("se usan claves propias;
  no hace falta pedir una clave de desarrollo"). Decidir cuál manda; por jerarquía, el PRD: cambiar a
  "se piden al usuario, que usa claves propias (PRD S6)".
- Q7 (teléfono físico) está abierta en el PRD "antes de la etapa 1" y el RFC solo la cubre con el
  caso "no hay teléfono real". Agregar en el criterio 13: "se anota si la prueba fue en emulador o
  en teléfono físico".
- Descargar el modelo (58 MB) desde internet exige que el script diga la URL, el nombre exacto
  (`vosk-model-small-es-0.42`) y un chequeo del tamaño o del hash; ninguno está en el RFC.

**Agregar en §2:** "`get-vosk-model.sh` baja `vosk-model-small-es-0.42.zip` de la dirección oficial
que figure en el README de `react-native-vosk`, verifica que el resultado exista y deja el contenido
directamente en `app/assets/model-es/` (sin carpeta intermedia). Si la carpeta existe, no vuelve a
bajarlo."

---

## 14. "Reglas que aplican" no cita lo que exigen el proceso y los criterios de entrega

El RFC lista R1 a R7, R15, R19 a R23, R34, R35, R41, R48 a R50, R52 a R55, R58 y R60. Existen y dicen lo
que el RFC afirma (verificado contra `RULES.md`). Faltan las que rigen cómo se entrega: R56 y R57
(cinco RFC y `/build-rfc`, un paso por vez), R59 (commit por paso con formato `tipo: descripción`) y
R61 (primero lo obligatorio). También aplican R16 a R18 a `server/` y R47 a `ResearchScreen`. Agregar:
"R16 a R18, R47, R56, R57, R59 y R61". Además, `CLAUDE.md` dice que se implementa con `/build-rfc`
(un paso, `dev` y `qa`, revisión del usuario); el RFC no define los pasos. Agregar una lista de pasos
con commit propio: (1) proyecto y chequeos, (2) lint de capas, (3) server, (4) builds, (5) research I1 a I13,
(6) documentos.

Los identificadores citados se verificaron: F26, F24, Q2, Q4, Q5 existen en `FEATURES.md` y `PRD.md` y
dicen lo que el RFC afirma. I1 a I13 son del propio RFC.

---

## 15. Alcance de tiempo y contenido de los documentos

- **PRD §9:** la etapa 1 son 30 minutos. El RFC tiene 13 comprobaciones, dos builds nativos de Gradle,
  un modelo de 58 MB y un lint de capas. No indica qué recortar. Agregar una prioridad: se hacen
  primero criterios 1 a 14 y las comprobaciones I2, I3, I5, I7 e I13 (de las que dependen RFC-002 a
  RFC-005); I9 a I12 se pueden diferir al RFC-003, anotándolo en `RESEARCH.md`.
- **Documentos (§8):** "las decisiones de stack y de arquitectura, con qué se resigna en cada una" no
  dice cuántas ni cuáles. Agregar un mínimo para `DECISIONS.md`: Expo con prebuild vs Flutter/Kotlin,
  un modelo con audio directo vs transcribir aparte, Vosk para la frase de manos libres, sin
  librería de estado ni de DI, arquitectura en capas con lint, server sin estado. Para el README: cómo
  compilar desde cero (instalar, bajar el modelo, `prebuild`, debug y release), cómo levantar el
  server, el `.env`, `adb reverse` y cómo apuntar la app a otro server.
- **`DECISIONS.md` y `AI-USAGE.md`** deben crearse en la raíz (§1 lo muestra), pero los criterios 18 no
  fijan la ubicación.

---

## Veredicto

No se puede empezar tal cual. Hay que arreglar antes los hallazgos 1 a 4: la firma de `readNumber`
(y cómo se lee `EXPO_PUBLIC_*`), las entradas y el esquema de I2, la interfaz de `vosk-words.py` e I5,
y la configuración nativa del release (R8 encendido, claves de `expo-build-properties`, `minSdkVersion`).
Los hallazgos 5 a 15 se pueden resolver mientras se implementa, pero conviene incorporarlos al RFC
para que cada pieza nombrada en la prosa tenga su criterio.

## Qué se hizo con estos hallazgos

Se reescribió el RFC-001. Aplicados: 1 (`readNumber` pasa al RFC-004, donde tiene quién lo use; `settings` lee con nombres literales), 2 (audios, comando y costo de I2), 3 (`vosk-words.py` y el método de I5), 4 (claves del plugin, R8 y el peso del APK), 5, 6, 7, 8, 9, 10, 11, 13, 14 y 15. De 12: la tipografía se configura en el RFC-003, con `VISUAL.md`. No se fija una versión mínima de Android: se prueba instalando.

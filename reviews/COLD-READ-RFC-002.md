# Lectura en frío · RFC-002 Datos y reglas del campo

Leí `CHALLENGE.md`, `PRD.md`, `FEATURES.md`, `RULES.md`, `CLAUDE.md`, `RFC-002` y, como predecesor, `RFC-001`.
Pregunta: ¿qué tendría que adivinar para implementar este RFC? Los hallazgos van de mayor a menor impacto.
Los marcados [BLOQUEA] son los que no se pueden resolver con un criterio razonable sin cambiar el RFC.

---

## 1. [BLOQUEA] La corrección (F8) tiene casos sin falla definida y sin contrato

**Qué dice el RFC.**
- "Riesgos": "Corregir un movimiento que ya no se puede deshacer (...): devuelve la falla que corresponda y no cambia nada."
- Reglas: la única regla de corrección es "Hay un registro para corregir (`target` no es `null`)".
- Contratos: `PreviewCorrectionUseCase { target: LastRecord | null, quantity }` y `ApplyCorrectionUseCase { proposal, today }`.

**Qué habría que adivinar.**
- `FarmErrorCode` es cerrado y no tiene código para "el registro ya no está en los datos" ni para "no se puede deshacer". Habría que reusar `NotEnoughAnimals` en el lote de destino, o inventar un código.
- `Preview` no dice si valida la cantidad nueva (`InvalidMillimeters` o `InvalidQuantity`, según el tipo) ni si simula el stock. Sin eso, "pasa por la misma propuesta" no se puede implementar.
- `LastRecord` es una foto. `Apply` no dice cómo busca el registro (por `id` y tipo) ni qué pasa si cambió.
- "El registro corregido reemplaza al anterior": no dice si conserva `id` y `date`. Tampoco dice si ocupa la misma posición en la lista.
- `today` en `ApplyCorrection` no tiene uso: ni la fecha ni el tipo cambian.
- `Result<RainReceipt | MovementReceipt>` no tiene discriminante: hay que adivinar con `'record' in value`.
- Ningún criterio (26 a 28) cubre el caso "no se puede deshacer".

**Cambio propuesto.**
1. En `FarmErrorCode` agregar `RecordNotFound = 'record_not_found'`. Se usa si el `id` del `target` ya no existe en `rains` o `movements`.
2. En "Reglas", debajo de la regla `NothingToCorrect`, agregar:
   - "`PreviewCorrection` y `ApplyCorrection` validan la cantidad con la regla de su tipo: `InvalidMillimeters` para lluvia, `InvalidQuantity` para movimiento."
   - "`ApplyCorrection` busca el registro por `id`. Si no existe, devuelve `RecordNotFound`."
   - "Para un movimiento, deshace el original y aplica la cantidad nueva con `movementRules`. Si ya no alcanza, devuelve `NotEnoughAnimals` (con el lote que corresponde) y no guarda."
   - "El registro corregido conserva `id` y `date`, y ocupa la misma posición."
3. Quitar `today` de `ApplyCorrectionUseCase`. O decir para qué se usa.
4. Agregar `kind: RecordKind` a `RainReceipt` y `MovementReceipt`. Así el union es discriminado y la presentación arma el siguiente `LastRecord` sin adivinar.
5. Agregar el criterio **28b**: "Corregir un movimiento cuando los animales ya se movieron otra vez devuelve la falla definida y no cambia los datos."

---

## 2. [BLOQUEA] Datos iniciales: la tabla no está, `farmSeed(today)` no tiene de dónde sacar `today`, y no se cita S1

**Qué dice el RFC.**
- "Datos iniciales": "una tabla fija por lote y categoría", "una tabla fija de pares 'hace cuántos días' y 'milímetros'". Los números no aparecen.
- "`farmSeed(today)` devuelve el documento inicial" y `FarmRepository.load(): Promise<Farm>` sin parámetros.
- "`FarmRepositoryImpl` (...) usa `farmSeed`".
- "Los tests dependen de ella", y los criterios 13, 18 y 19 hablan de lotes y totales concretos.

**Qué habría que adivinar.**
- Los 40 números de stock y los pares de lluvia. Cada implementador inventaría los suyos.
- De dónde sale `today`. `FarmRepositoryImpl` necesita el `ClockService` por constructor, pero no se dice.
- Si `farmSeed` devuelve un `FarmDocument` o un `Farm`. El texto dice "documento", pero el repositorio guarda y devuelve `Farm`.
- Si "dentro de los 60 días anteriores" incluye hoy. Si hubiera una lluvia con `daysAgo = 0`, "lo anotado hoy" arrancaría con milímetros que nadie anotó.
- La semilla es la lectura S1 (450 cabezas en total). `CHALLENGE.md` dice "~450 cabezas por categoría y lote" y tiene más autoridad. El RFC no cita S1 ni RF-22, y el criterio 13 fija "450" en duro.

**Cambio propuesto.**
1. En "Datos iniciales", reemplazar las dos tablas por estas (orden: vacas, vaquillonas, terneros, novillos, toros):

   | Lote | Vacas | Vaquillonas | Terneros | Novillos | Toros | Total |
   | --- | --- | --- | --- | --- | --- | --- |
   | 1 | 20 | 10 | 12 | 8 | 2 | 52 |
   | 2 | 15 | 5 | 18 | 6 | 1 | 45 |
   | 3 | 10 | 45 | 0 | 12 | 1 | 68 |
   | 4 | 25 | 8 | 10 | 5 | 2 | 50 |
   | 5 | 12 | 10 | 6 | 4 | 1 | 33 |
   | 6 | 30 | 0 | 14 | 9 | 2 | 55 |
   | 7 | 22 | 12 | 8 | 7 | 2 | 51 |
   | 8 | 30 | 20 | 25 | 18 | 3 | 96 |
   | **Total** | | | | | | **450** |

   Así existen los casos de falla ("En el lote 3 hay 12 novillos, no 500"; los lotes 3 y 6 no tienen terneros ni vaquillonas, respectivamente) y el lote 2 permite "Mové quince terneros del dos al siete" (J2).

2. Lluvias (días atrás → mm), con `daysAgo` entre 1 y 60: `1→4, 3→12, 5→22, 8→9, 12→30, 15→6, 19→18, 24→14, 29→8, 33→25, 38→10, 44→16, 51→7, 57→20`. Son valores sugeridos: lo importante es que sean fijos y estén en el RFC.
3. Escribir: "`farmSeed(today: DateText): Farm`. No devuelve un documento: `FarmRepositoryImpl` lo pasa por `toModel` al guardar. `FarmRepositoryImpl` recibe `FarmLocalDataSource` y `ClockService` por constructor."
4. Agregar: "La semilla responde a S1 (PRD) y a RF-22. La tabla vive solo en `farmSeed.ts`: cambiar la lectura de la consigna es cambiar ese archivo. Los tests de casos de uso no dependen de ella (ver hallazgo 7)."
5. Agregar el criterio **5b**: "`farmSeed` no tiene ninguna lluvia con fecha igual a `today`, y la más vieja es de `today` menos 60 días. Al menos un lote tiene 0 animales de alguna categoría."

---

## 3. Falta el criterio de F7: "ninguna escritura sin propuesta" no se puede demostrar con lo que hay

**Qué dice el RFC.**
- Encabezado: entrega "la parte de datos y reglas de F7".
- `FEATURES.md` F7: "Ninguna escritura llega a los datos sin pasar por una propuesta. Se comprueba con un test." PRD sección 8 y M3 también lo piden.
- El RFC no tiene ningún criterio de ese tipo.

**Problema.**
- `RegisterRain` recibe un `RainProposal`, que es un `type` plano. Cualquiera lo puede construir sin pasar por `Preview`.
- `FarmRepository.save(farm)` es público. Si el contenedor expone el repositorio, la presentación puede escribir saltándose los casos de uso. Criterio 3 dice "los expone por su contrato" sin decir cuáles.
- El criterio 9 dice "no guarda nada", pero no está dicho que haya un test con `save` espiado.

**Cambio propuesto.**
1. En "Enfoque técnico", agregar: "`di/container.ts` expone los casos de uso y `ClockService`. **No expone `FarmRepository`** ni el datasource: solo `Register*` y `ApplyCorrection` llaman a `save`."
2. Criterios nuevos:
   - **9b**: "Con un `FarmRepository` doble que cuenta las llamadas a `save`, `PreviewRain`, `PreviewMovement`, `PreviewCorrection` y las tres consultas lo llaman 0 veces."
   - **9c**: "Comprobación de código: `grep -rn "\.save(" app/src` solo encuentra `RegisterRainUseCaseImpl`, `RegisterMovementUseCaseImpl`, `ApplyCorrectionUseCaseImpl` y `FarmRepositoryImpl` (y los tests). Un test sobre `container` comprueba que `Dependencies` no tiene `farmRepository`."
3. Nota en el RFC: "El tipo `Proposal` no impide construirla a mano. Es una limitación aceptada: lo que impide escribir sin propuesta es que la presentación (RFC-004) solo recibe los casos de uso."

---

## 4. `Failure` con campos opcionales choca con R36 y obliga a adivinar qué campos trae cada código

**Qué dice el RFC (sección "Errores").**
- `Failure = { code; lot?; category?; available?; requested? }`.
- "`NotEnoughAnimals` trae `lot`, `category`, `available` y `requested`; `LotNotFound` trae `lot`."

**Problema.**
- Para armar "En el lote 3 hay 12 novillos, no 500", la presentación lee `lot`, `available`, etc. Todos son `T | undefined`. Con R36 (sin `!`, `as` solo en mappers) tiene que repetir una comprobación por campo en cada oración.
- No dice qué trae cada uno de los otros códigos. Ejemplo: `InvalidQuantity` y `InvalidMillimeters` no dicen si traen `requested`. `FutureDate` no trae la fecha.
- Va contra R31 (si falta un caso, no compila): el tipo no obliga a que `NotEnoughAnimals` traiga sus cuatro campos.

**Cambio propuesto.** Reemplazar `Failure` por una unión discriminada:

```ts
export type Failure =
  | { code: FarmErrorCode.LotNotFound; lot: number }
  | { code: FarmErrorCode.SameLot; lot: number }
  | { code: FarmErrorCode.NotEnoughAnimals; lot: number; category: AnimalCategory; available: number; requested: number }
  | { code: FarmErrorCode.InvalidQuantity; requested: number }
  | { code: FarmErrorCode.InvalidMillimeters; requested: number }
  | { code: FarmErrorCode.FutureDate; date: DateText }
  | { code: FarmErrorCode.NothingToCorrect }
  | { code: FarmErrorCode.RecordNotFound };
```

Un archivo `Failure.ts` con un solo tipo cumple R17. Los criterios 11, 12, 15 a 18 deben decir qué campos esperan en cada falla. Además `Result<T, F = Failure>` tiene un parámetro `F` que nadie usa: dejarlo como `Result<T>`.

---

## 5. Reglas: huecos entre RF-09 / F6 / RF-37 y lo que el RFC valida

**Qué dice el RFC (tabla "Reglas").** Seis reglas más la de corrección. "Se comprueban en ese orden, y se devuelve la primera que falla."

**Qué habría que adivinar.**
- **Categoría válida (RF-09).** No hay regla ni falla. Si la valida el RFC-004 al mapear el JSON del modelo al enum, hay que decirlo; si no, falta un código.
- **Fecha en el movimiento.** `MovementProposal` tiene `date`, y `FutureDate` está segundo en el orden. No dice si `PreviewMovement` la valida. PRD RF-07 no menciona fecha para mover animales: no se sabe qué fecha lleva (hoy, o la de grabación en la cola, RF-17) ni quién la pone.
- **Orden dentro del lote.** Si origen y destino no existen, ¿cuál se reporta primero?
- **Fecha mal formada** ("2026-13-45", "ayer"). `DateText` es `string`: la comparación "no posterior a `today`" por texto da un resultado arbitrario.
- **"Un valor que no es un número" (criterio 11).** Con el tipo `number`, solo pueden ser `NaN` o `Infinity`. Los milímetros ¿admiten decimales? ¿Y cuántos?

**Cambio propuesto.** Agregar a "Reglas":
- "Origen se valida antes que destino. Si faltan los dos, `LotNotFound` trae el origen."
- "`PreviewMovement` y `RegisterMovement` aplican `FutureDate` a `date` igual que lluvia. La fecha del movimiento la entrega el RFC-004: es el día del pedido (en la cola, el día de grabación)."
- "La categoría ya llega como `AnimalCategory`: la valida el RFC-004 al leer el JSON del server (R35, borde). Este RFC no la revalida."
- "`date` llega con formato `AAAA-MM-DD` válido: lo garantiza el RFC-004. `dates.ts` no valida texto."
- "Milímetros: `Number.isFinite(x) && x > 0`; admite decimales. Los totales se devuelven sin redondear; redondear es de la presentación."
- Criterios nuevos: **11b** ("`NaN` e `Infinity` dan `InvalidMillimeters`"), **16b** ("origen y destino inexistentes: se reporta el origen") y **18b** (orden de reglas: un pedido con lote inexistente y cantidad 0 devuelve `InvalidQuantity`, porque va primero).

---

## 6. Persistencia: el contrato de `FileFarmLocalDataSource` deja huecos y no hay forma de demostrar F17

**Qué dice el RFC.**
- `read(): Promise<unknown | null> // null: todavía no hay archivo`.
- "Un documento que no cumple devuelve `null`."
- "`FileFarmLocalDataSource` usa el archivo `farm.json`."
- Criterio 7 y 8 se prueban con dobles.

**Qué habría que adivinar.**
- Qué hace `read()` con un archivo que existe pero tiene JSON inválido o está vacío (F17: "si el archivo guardado no se puede leer, la app arranca con los datos iniciales"). ¿Devuelve `null`, lanza? El criterio 8 solo cubre "otra versión o campo mal formado".
- Qué hace `save` si la escritura falla (disco lleno). R37 pide valores para fallas esperadas, pero `Register*` devuelve `Result<Receipt>` sin código de almacenamiento. ¿Se rechaza la promesa y la capa de arriba lo trata como error inesperado (F16)?
- Concurrencia: dos `Register*` seguidos (por ejemplo el reenvío de la cola de RF-17 y un toque) hacen `load` → modificar → `save` en paralelo y se pisan. ¿Se serializa? ¿`load` lee el archivo cada vez o hay copia en memoria?
- "Sigue ahí al cerrar y volver a abrir" (RF-23, F17) solo existe en un teléfono. Ningún criterio lo demuestra, y `FileFarmLocalDataSource` no tiene test.

**Cambio propuesto.** Agregar a "Implementación":
- "`read()` devuelve `null` si el archivo no existe o si su contenido no es JSON válido. Un error de lectura del sistema (permisos) se propaga."
- "`write()` escribe el documento completo. Si falla, la promesa se rechaza: `Register*` no lo captura (R35) y el RFC-004 lo trata como error inesperado (F16). No hay código de falla para esto."
- "`FarmRepositoryImpl` serializa `load` y `save` con una cola de promesas: dos escrituras seguidas no se pisan. No guarda copia en memoria: lee del datasource en cada `load`."
- Criterios nuevos:
  - **8b**: "Un archivo con texto que no es JSON hace que `load()` devuelva los datos iniciales y los deje guardados."
  - **8c**: "Dos `RegisterRain` lanzados sin esperar (con un datasource doble lento) terminan ambos guardados."
  - **7b** (manual, anotado en `docs/CASOS.md` o en `RESEARCH.md` con fecha y dispositivo): "En el emulador, anotar una lluvia desde un botón provisorio de `ResearchScreen`, cerrar la app y reabrirla: `load()` devuelve la lluvia." El RFC-001 ya usa `ResearchScreen` para comprobaciones en el teléfono. Alternativa: un test de `FileFarmLocalDataSource` con `expo-file-system` mockeado.

---

## 7. Tests: dónde viven los dobles y las fixtures, y cómo se concilian con R3 y con "los tests dependen de la semilla"

**Qué dice el RFC.**
- "`*UseCaseImpl.ts` una clase por contrato, con su test."
- "La tabla es fija (...): los tests dependen de ella."
- "`data/usecases` importa solo de `domain` (R3)."
- No dice con qué `Farm` de prueba trabajan los tests ni dónde está el repositorio doble.

**Problema.**
- Si los tests de `data/usecases/*.test.ts` importan `farmSeed` (en `data/datasources`), violan R3 y R7, y el lint falla (suponiendo que el lint alcanza a los tests).
- Se necesita un `FarmRepository` en memoria compartido por 9 tests. R17 pide un archivo por símbolo; R27 prohíbe carpetas `utils`/`helpers` generales; R50 dice que el test vive al lado de lo que prueba. Falta decidir dónde va.
- No se lista qué recibe por constructor cada caso de uso. Se infiere que `PreviewRain` no necesita nada, y que los demás reciben `FarmRepository`.

**Cambio propuesto.** Agregar a "Implementación":

```
data/usecases/testing/
  buildFarm.ts                 arma un Farm de prueba con lotes y lluvias a elección
  InMemoryFarmRepository.ts    FarmRepository doble que cuenta las llamadas a save
```

Y estas dos frases:
- "Los tests de casos de uso usan `buildFarm` y `InMemoryFarmRepository`; no importan `farmSeed`. Los criterios 13, 18 y 19 se prueban con una fixture propia. Solo los criterios 4 a 6 usan `farmSeed`, y están en `farmSeed.test.ts`. `testing/` solo lo importan archivos `*.test.ts`."
- "Constructores: `PreviewRainUseCaseImpl()` no recibe nada. `RegisterRain`, `PreviewMovement`, `RegisterMovement`, `GetRainSummary`, `GetLotStock`, `GetTodaySummary`, `PreviewCorrection` y `ApplyCorrection` reciben `FarmRepository`."

---

## 8. Estilo: R17 y R8 chocan con el listado de archivos y los tipos de entrada

**Qué dice el RFC.** `rainRules.ts`, `movementRules.ts`, `rainTotals.ts`, `stockChanges.ts`, `dates.ts` ("sumar días, primer día del mes, comparar fechas") y `farmMapper.ts` ("documento ↔ Farm"). La tabla de casos de uso da la entrada en línea: `{ millimeters, date, today }`.

**Problema.**
- R17: "Un archivo por símbolo, con el nombre del símbolo". `dates.ts` tiene al menos tres funciones; `farmMapper.ts` tiene dos (R13 dice `toEntity` y `toModel`).
- R8 / ejemplo de RULES: la entrada es un tipo con nombre (`RegisterRainInput`). El RFC no los declara ni dice en qué archivo viven (R17: uno por símbolo, junto al contrato).
- Nombres R16: `FileFarmLocalDataSource` pone la tecnología delante, pero la tecnología es `expo-file-system`; sería `ExpoFileFarmLocalDataSource`. `SystemClockService` no nombra tecnología. Dejar escrito cuál se elige.
- La firma de `toEntity` no está: recibe `unknown` y devuelve `Farm | null`, con `as` en el borde (R36).

**Cambio propuesto.**
- Reemplazar en el árbol `dates.ts` por `addDays.ts`, `firstDayOfMonth.ts` y `isAfter.ts`; `rainRules.ts` por `validateRain.ts`; `movementRules.ts` por `validateMovement.ts`; y `rainTotals.ts` / `stockChanges.ts` por funciones nombradas (`sumRainByRange.ts`, `moveStock.ts`). `farmMapper.ts` pasa a `toFarmEntity.ts` y `toFarmModel.ts`. O bien aclarar en el RFC que "una carpeta `rules/` con funciones relacionadas por archivo" es una excepción asumida a R17, y anotarlo en `DECISIONS.md`.
- Agregar: "Cada contrato de caso de uso se escribe junto con su tipo de entrada, en el mismo archivo: `PreviewRainInput` en `domain/usecases/PreviewRainUseCase.ts`." (Si se prefiere R17 estricto, un archivo `*Input.ts` por tipo.)
- Agregar firma: `toFarmEntity(raw: unknown): Farm | null` y `toFarmModel(farm: Farm): FarmDocument`.
- Nombres: `ExpoFileFarmLocalDataSource` y `SystemClockService`, con la excepción anotada.

---

## 9. Hay comportamiento en la prosa que no aparece en los criterios (revisión 1 pedida)

Lo que el RFC nombra y no tiene criterio, con el criterio propuesto:

| Prosa del RFC | Criterio a agregar |
| --- | --- |
| "Hay al menos un lote sin animales de alguna categoría" | 5b (hallazgo 2) |
| "`id` es el mayor que ya exista, más uno" (`nextId.ts`) | **9d**: "`nextId` devuelve 1 con lista vacía y `max + 1` con ids salteados." |
| "`dates.ts` tiene tests (cambio de mes o año)" | **21b**: "`addDays` cruza fin de mes, fin de año y 29 de febrero; `firstDayOfMonth` y `isAfter` tienen su test." |
| "Las funciones de `rules/` son puras: no mutan" | **13b**: "Con un `Farm` congelado en profundidad (`Object.freeze`), `moveStock` y `validateMovement` no lanzan ni cambian el original." |
| "Primer día del mes: da 0 aunque haya llovido ayer" | **21c**: "Con `today` = día 1, el mes devuelve total 0 y la semana sí incluye los días del mes anterior." |
| "`SystemClockService` arma el `DateText` con año, mes y día locales" | **3b**: "Con una fecha de reloj inyectada a las 23:30 locales (UTC ya del día siguiente), `today()` devuelve el día local." Hace falta que reciba `now: () => Date` por constructor. |
| "Se comprueban en ese orden" | 18b (hallazgo 5) |
| "`RegisterMovement` vuelve a validar" (cubre movimiento) | **12b**: "`RegisterRain` con `proposal.date` posterior a `today` devuelve `FutureDate` y no guarda." |
| "Corregir un movimiento que ya no se puede deshacer" | 28b (hallazgo 1) |
| F11: "se ve completo sin red" | Sin criterio: no es de este RFC, pero ningún caso de uso usa la red. Basta una nota en "Riesgos": "Ninguna pieza de este RFC usa red." |

---

## 10. Criterios que no se pueden demostrar tal como están escritos

- **Criterio 2** ("`domain` no tiene lógica (...). El lint lo comprueba"). El lint de R1 a R7 comprueba imports. No detecta lógica. Cambiar a: "El lint comprueba los imports. Además `grep -rEn "function |=>|class |new " app/src/domain` no devuelve nada, salvo las declaraciones de `enum`."
- **Criterio 3** (`di/container.ts` construye y expone). Solo se verifica leyendo. Agregar: "`npm run typecheck` pasa con `Dependencies` declarando cada caso de uso y `ClockService`, y un test `container.test.ts` (con `expo-file-system` mockeado) comprueba que cada propiedad existe."
- **Criterio 29** ("Cada criterio del 4 al 28 tiene al menos un test con ese nombre"). No dice qué es "ese nombre". R49 pide que el nombre diga la regla. Cambiar a: "Cada test se llama `C<n> · <regla>` (por ejemplo `C18 · pedir más animales de los que hay da NotEnoughAnimals`). `npx jest --verbose` los lista y cada número de 4 a 28 (más las variantes b, c, d) aparece al menos una vez."
- **Criterios 13 y 14.** "El total de cabezas sigue en 450" depende de la semilla; con fixtures propias (hallazgo 7), usar "el total de cabezas no cambia".
- **Criterio 20.** "Un renglón por día con lluvia": no dice qué pasa con dos lluvias el mismo día. Ver hallazgo 11.

---

## 11. Resúmenes: definiciones que quedan libres y campos que sobran o faltan

**Qué dice el RFC.**
- `RainSummary.days: { date, millimeters }[]`.
- `TodaySummary.lastRain`, `notedToday: { rainMillimeters, movedAnimals }`.
- `TodaySummary.activity` y `location`.
- `RainReceipt` y `MovementReceipt`.

**Qué habría que adivinar.**
- Si dos `RainRecord` caen el mismo día, ¿hay un renglón o dos? ¿`lastRain` es el último registro (por `id`) o el último día, con la suma de ese día?
- "Lo anotado hoy" de F11/RF-14: el RFC lo reduce a dos totales. La tarjeta no podría decir qué se movió ("40 vaquillonas del 3 al 5"). Si el RFC-003 quiere una lista, el tipo no alcanza. Hay que decidirlo ahora.
- `activity` y `location` en `TodaySummary` no los usa ninguna feature: F11 pide solo el nombre. Sobran, o hay que decir qué pantalla los usa.
- F7 dice que el comprobante tiene "los números ya actualizados". `MovementReceipt` trae el saldo del origen pero no el del destino. F6 pide solo el origen en la respuesta hablada, pero la tarjeta cambia en los dos lotes.
- `LotStock.byCategory` es un `Record`: el orden de las categorías para la tarjeta no está definido.

**Cambio propuesto.** Agregar a "Cálculos":
- "Los renglones de `RainSummary.days` suman las lluvias de la misma fecha. `lastRain` es el día más reciente con lluvia, con la suma de ese día."
- "Lo anotado hoy es un resumen en dos totales. Si el RFC-003 necesita el detalle, lo lee de `farm.movements`." Y decidir si se agrega `movements: AnimalMovement[]` a `notedToday`.
- Quitar `activity` y `location` de `TodaySummary` (o justificarlos en la sección de cada uno).
- Agregar `remainingInDestination` a `MovementReceipt` si el comprobante lo muestra.
- "El orden de las categorías es el del enum `AnimalCategory`."

---

## 12. Lo que el RFC necesita del RFC-001 y no está del todo ahí

- **`Dependencies`.** RFC-001 dice `useDependencies(): Dependencies` y "los RFC siguientes agregan campos a `Dependencies`", pero no dice en qué archivo vive el tipo. R17 pide uno por símbolo (`di/Dependencies.ts`). RFC-002 tiene que tocarlo.
  - Propuesta: decir en el RFC-002 "agrega al tipo `Dependencies` (`di/Dependencies.ts`, creado en el RFC-001; si no existe, se crea) los nueve casos de uso y `clock: ClockService`".
- **Alias `@/` en Jest.** RFC-001 pone el alias en TypeScript. No dice que `jest.config` lo resuelva (`moduleNameMapper`). El único test de RFC-001 (`readNumber`) puede no usarlo, y recién acá fallarían los imports.
  - Propuesta: criterio 30b: "`jest.config` resuelve `@/`; un test de RFC-002 lo usa".
- **Alcance del lint.** RFC-001 comprueba los límites con un archivo de prueba, pero no dice si alcanza a `*.test.ts` ni si `data/usecases` permite sus propias subcarpetas (`rules/`, `testing/`) pero prohíbe `data/repositories`, `data/datasources`, etc.
  - Propuesta: en el criterio 2, "el lint falla si un archivo de `data/usecases` importa de `data/repositories` o de `expo-file-system` (se prueba con un archivo temporal, como en el criterio 9 de RFC-001)".
- **Instalado:** `expo-file-system` está en la tabla de stack, así que RFC-001 lo instala. Jest, `jest-expo` y `typecheck` también. Eso sí existe.

---

## 13. "Reglas que aplican" incompleta, y R37 sin resolver

**Qué dice el RFC.** "R1 a R3 y R7, R8 a R13, R15 y R16, R29 a R37, R48 a R50."

**Problema.**
- Aplican y no están: **R14** (los hooks usan casos de uso para datos del campo y contratos de `domain/services` para capacidades: por eso `ClockService` no tiene caso de uso), **R17** (un archivo por símbolo, ver hallazgo 8), **R18** (código en inglés; oraciones en español: coherente con "la presentación redacta"), **R38** (exports con nombre) y **R39** (sin pendientes).
- **R37** dice "Un caso de uso devuelve `Result`". El RFC dice que `GetRainSummary` y `GetTodaySummary` devuelven el valor directo. Es compatible con "las fallas esperadas son valores" (no tienen fallas), pero conviene escribirlo: "Los dos casos de uso que no pueden fallar devuelven el valor, como excepción razonada a R37 / ejemplo de R8".
- Los identificadores citados (F5 a F11, F17, RFC-001, RFC-003, RFC-004, R1 a R3, R7, R8 a R13, R15, R16, R29 a R37, R48 a R50) existen y dicen lo que el RFC afirma. No hay F, RF, RNF, S ni Q citados: faltan RF-09, RF-22, RF-37 y S1 para las reglas y la semilla.

**Cambio propuesto.** Reemplazar el párrafo por: "R1 a R3 y R7 (capas), R8 a R14 (piezas y uso desde los hooks), R15 a R18 (inyección, nombres, un archivo por símbolo, idioma), R29 a R39 (estilo), R48 a R50 (tests). PRD: RF-09, RF-13, RF-22, RF-23, RF-37 y S1."

---

## 14. "Convertir ayer/anoche es del RFC-004" deja sin dueño una regla de este RFC

**Qué dice el RFC.** "Convertir 'ayer' o 'anoche' en una fecha no es de este RFC: lo hace el RFC-004".

**Problema.**
- RF-17 y F13: un audio guardado se entiende con su fecha de grabación, y las reglas "se aplican con los datos del momento en que se procesa". Eso exige que el RFC-004 le pase a `Preview` un `date` calculado desde la fecha de grabación y un `today` actual. El RFC-002 no dice que cada caso de uso lo soporta: `PreviewRain.today` es el día de hoy, y `date` es otro. Funciona, pero conviene decirlo porque define para qué sirve `today` en `Preview`.
- `GetRainSummary { range, today }` para una consulta guardada de ayer ("¿Cuánto llovió hoy?" grabada ayer) ¿usa `today` de grabación o el actual? F13 solo dice "contesta en una tarjeta". Si hace falta la fecha de grabación, el RFC-004 pasa esa fecha como `today`.

**Cambio propuesto.** Agregar a "Fechas": "`today` es el día de referencia para `FutureDate`, `monthTotal` y los períodos. Para un audio guardado, el RFC-004 pasa como `date` la fecha calculada desde la grabación y como `today` el día actual en `Preview/Register`. Para consultas, pasa la fecha de grabación como `today` solo si la consulta es relativa al día en que se dijo. Este RFC solo usa `today` como dato."

---

## 15. `Result` y el esquema de `FarmDocument`: faltan los detalles que define "forma de cada campo"

**Qué dice el RFC.** "`FarmDocument` es `{ version: 1, farm: … }`. El mapper comprueba la versión y la forma de cada campo."

**Qué habría que adivinar.**
- El `…` oculta el tipo. Si `farm` es idéntico a `Farm`, el modelo solo agrega la envoltura `version`; R13 lo permite, pero hay que decir que `toFarmModel` es `({version: 1, farm})`.
- "La forma de cada campo": ¿cuánto? Texto de fecha con formato y calendario válido, stock entero no negativo, `number` de lote único, ids únicos, las cinco categorías presentes en cada lote, exactamente 8 lotes. Cada implementador pondría un nivel distinto.

**Cambio propuesto.**

```ts
// data/models/FarmDocument.ts
export type FarmDocument = { version: 1; farm: Farm };
```

Y en "Implementación": "`toFarmEntity` rechaza (devuelve `null`) si: `version !== 1`; falta o sobra un campo; `name`, `activity`, `location` no son texto; un lote no tiene las cinco categorías con enteros >= 0; hay números de lote repetidos; una fecha no cumple `^\d{4}-\d{2}-\d{2}$`; un `id` está repetido en su lista; una cantidad o milímetro no es un número finito mayor que cero; una categoría de un movimiento no está en el enum. No exige que sean 8 lotes." Criterio 8 debe listar al menos tres de esos casos (versión, categoría desconocida, fecha mal formada).

---

**Veredicto:** el RFC tiene la estructura correcta y respeta las capas, pero no se puede implementar sin adivinar en dos puntos (la corrección F8 y los datos iniciales), y le faltan criterios demostrables para F7, la persistencia y varias reglas que describe en prosa. Se necesita una revisión antes de implementar.

## Qué se hizo con estos hallazgos

Se reescribió el RFC-002. Aplicados: 1 (la corrección, con sus reglas y comprobantes con `kind`), 2 (la tabla de datos iniciales y de dónde sale `today`), 3, 4 (`Failure` como unión), 5, 6, 7 (dobles y campo de prueba en `testing/`), 8, 9, 10, 11 (un renglón por día; `daysAgo`), 12, 13, 14 y 15. En `RULES.md` se ajustaron R17, R19 y R37. No se agregó el saldo del destino al comprobante: ninguna feature lo pide.

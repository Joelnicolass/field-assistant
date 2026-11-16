# RFC-002 · Datos y reglas del campo

| | |
| --- | --- |
| **Estado** | Pendiente |
| **Features** | F17 completa. La parte de datos y reglas de F5, F6, F7, F8, F9, F10 y F11 |
| **Requisitos del PRD** | RF-06 a RF-15, RF-22, RF-23, RF-37 y el supuesto S1 |
| **Predecesores** | RFC-001 |
| **Sucesores** | RFC-003, RFC-004 y RFC-005 |
| **Complejidad** | Media |

## Resumen

Construye todo lo que la app sabe del campo, sin pantalla y sin voz: las entidades, los
contratos, las reglas (casos de uso), el guardado en un archivo del teléfono y los datos
iniciales. Queda cubierto por tests. La pantalla (RFC-003) y el turno de voz (RFC-004) usan
estos casos de uso tal cual.

De las features F5 a F11, este RFC entrega lo que se puede probar sin teléfono: validar,
calcular y guardar. Mostrarlo y decirlo es de los RFC siguientes.

## Enfoque técnico

### Dos pasos para escribir

Una escritura tiene siempre dos casos de uso:

- **Preview:** valida el pedido y devuelve una propuesta. No guarda nada.
- **Register:** vuelve a validar con los datos de ese momento, guarda y devuelve el comprobante.

Así una propuesta que esperó (cuatro segundos, o horas en la cola sin señal) se anota solo si
sigue siendo válida. Las dos mitades usan las mismas funciones de reglas.

La presentación nunca escribe por otro camino: `Dependencies` entrega solo casos de uso y
services, nunca el repositorio ni el datasource.

### Quién calcula y quién redacta

Los casos de uso devuelven números y códigos de falla. Las oraciones que la app dice ("En el
lote 3 hay 12 novillos, no 500") se arman en la presentación, a partir de esos datos.

### Fechas

- Una fecha es un texto `AAAA-MM-DD`, con ceros a la izquierda (`DateText`). Dos fechas se
  comparan como textos.
- "Hoy" lo entrega un service, `ClockService`, con el reloj y la zona horaria del teléfono.
- Los casos de uso reciben dos fechas distintas: **`date`** es la fecha del registro, y
  **`today`** es el día real en que se procesa. `today` sirve para rechazar una fecha futura y
  para calcular los totales. En un turno normal coinciden o `date` es ayer; en un audio que
  esperó en la cola, `date` sale del día en que se grabó.
- Convertir "ayer" o "anoche" en una fecha no es de este RFC: lo hace el RFC-004 antes de
  llamar a estos casos de uso.

## Contratos (`domain`)

### Enums

```ts
export enum AnimalCategory { Cow = 'cow', Heifer = 'heifer', Calf = 'calf', Steer = 'steer', Bull = 'bull' }
export enum RainRange { Today = 'today', Yesterday = 'yesterday', Week = 'week', Month = 'month' }
export enum RecordKind { Rain = 'rain', Movement = 'movement' }
```

El orden de las categorías es el del enum: vacas, vaquillonas, terneros, novillos y toros.

### Entidades

```ts
export type DateText = string; // AAAA-MM-DD

export type Lot = { number: number; stock: Record<AnimalCategory, number> };
export type RainRecord = { id: number; date: DateText; millimeters: number };
export type AnimalMovement = {
  id: number; date: DateText; quantity: number; category: AnimalCategory; fromLot: number; toLot: number;
};
export type Farm = {
  name: string; activity: string; location: string;
  lots: Lot[]; rains: RainRecord[]; movements: AnimalMovement[];
};

export type RainProposal = { millimeters: number; date: DateText };
export type MovementProposal = {
  quantity: number; category: AnimalCategory; fromLot: number; toLot: number; date: DateText;
};
export type RainReceipt = { kind: RecordKind.Rain; record: RainRecord; monthTotal: number };
export type MovementReceipt = { kind: RecordKind.Movement; movement: AnimalMovement; remainingInOrigin: number };
export type Receipt = RainReceipt | MovementReceipt;

export type LastRecord =
  | { kind: RecordKind.Rain; record: RainRecord }
  | { kind: RecordKind.Movement; movement: AnimalMovement };
export type CorrectionProposal = { target: LastRecord; quantity: number };

export type RainSummary = { range: RainRange; total: number; days: { date: DateText; millimeters: number }[] };
export type LotStock = { lot: number; total: number; byCategory: Record<AnimalCategory, number> };
export type TodaySummary = {
  farmName: string; activity: string; location: string;
  totalHeads: number; monthRain: number;
  lastRain: { date: DateText; millimeters: number; daysAgo: number } | null;
  lots: { number: number; total: number }[];
  notedToday: { rainMillimeters: number; movedAnimals: number };
};
```

- `id` es un número: el mayor que ya exista en su lista, más uno; 1 si la lista está vacía.
- `remainingInOrigin` es la cantidad de animales de esa categoría que quedan en el lote de origen.
- En `RainSummary.days` y en `lastRain`, dos lluvias del mismo día se suman en un solo renglón.
  `lastRain` es el día con lluvia más reciente, y `daysAgo` cuántos días pasaron hasta
  `today`: 0 es hoy y 1 es ayer.

### Errores

```ts
export enum FarmErrorCode {
  LotNotFound = 'lot_not_found',
  SameLot = 'same_lot',
  InvalidQuantity = 'invalid_quantity',
  NotEnoughAnimals = 'not_enough_animals',
  InvalidMillimeters = 'invalid_millimeters',
  FutureDate = 'future_date',
  NothingToCorrect = 'nothing_to_correct',
}

export type Failure =
  | { code: FarmErrorCode.LotNotFound; lot: number }
  | { code: FarmErrorCode.SameLot; lot: number }
  | { code: FarmErrorCode.InvalidQuantity }
  | { code: FarmErrorCode.NotEnoughAnimals; lot: number; category: AnimalCategory; available: number; requested: number }
  | { code: FarmErrorCode.InvalidMillimeters }
  | { code: FarmErrorCode.FutureDate }
  | { code: FarmErrorCode.NothingToCorrect };

export type Result<T, F = Failure> = { ok: true; value: T } | { ok: false; failure: F };
```

Cada falla trae los números que la presentación necesita para explicarla.

### Repositorio, datasource y service

```ts
export interface FarmRepository {
  load(): Promise<Farm>;
  save(farm: Farm): Promise<void>;
}

// La fuente no conoce la forma del dato: guarda y devuelve un documento.
export interface FarmLocalDataSource {
  read(): Promise<unknown | null>; // null: no hay archivo o no es JSON
  write(document: unknown): Promise<void>;
}

export interface ClockService {
  today(): DateText;
}
```

### Casos de uso

Todos tienen un solo método, `execute(input)`, y devuelven una promesa. Uno que puede fallar
devuelve `Result`; uno que no puede fallar devuelve el valor. El tipo de la entrada se exporta
desde el archivo del contrato, con el nombre del caso de uso más `Input` (`RegisterRainInput`).

| Contrato | Entrada | Devuelve |
| --- | --- | --- |
| `PreviewRainUseCase` | `{ millimeters, date, today }` | `Result<RainProposal>` |
| `RegisterRainUseCase` | `{ proposal: RainProposal, today }` | `Result<RainReceipt>` |
| `PreviewMovementUseCase` | `{ quantity, category, fromLot, toLot, date, today }` | `Result<MovementProposal>` |
| `RegisterMovementUseCase` | `{ proposal: MovementProposal, today }` | `Result<MovementReceipt>` |
| `GetRainSummaryUseCase` | `{ range, today }` | `RainSummary` |
| `GetLotStockUseCase` | `{ lot }` | `Result<LotStock>` |
| `GetTodaySummaryUseCase` | `{ today }` | `TodaySummary` |
| `PreviewCorrectionUseCase` (F8, Should) | `{ target: LastRecord \| null, quantity }` | `Result<CorrectionProposal>` |
| `ApplyCorrectionUseCase` (F8, Should) | `{ proposal: CorrectionProposal, today }` | `Result<Receipt>` |

Cada implementación recibe por constructor un `FarmRepository` y nada más.

En `Dependencies`, cada pieza va con el nombre de su contrato en `camelCase` y sin el sufijo:
`clock`, `previewRain`, `registerRain`, `previewMovement`, `registerMovement`,
`getRainSummary`, `getLotStock`, `getTodaySummary`, `previewCorrection` y `applyCorrection`.

## Reglas

Se comprueban en este orden, y se devuelve la primera que falla.

**Lluvia**

| Regla | Falla |
| --- | --- |
| Los milímetros son un número finito mayor que cero | `InvalidMillimeters` |
| `date` no es posterior a `today` | `FutureDate` |

**Movimiento**

| Regla | Falla |
| --- | --- |
| La cantidad es un entero mayor que cero | `InvalidQuantity` |
| El lote de origen existe | `LotNotFound`, con ese lote |
| El lote de destino existe | `LotNotFound`, con ese lote |
| El origen y el destino son distintos | `SameLot` |
| `date` no es posterior a `today` | `FutureDate` |
| En el origen hay esa cantidad de animales de la categoría, o más | `NotEnoughAnimals`, con lo disponible y lo pedido |

La categoría no tiene regla: su tipo es el enum, y lo que llega de afuera se valida en el
mapper del RFC-004.

**Consultas y corrección**

| Regla | Falla |
| --- | --- |
| El lote consultado existe | `LotNotFound` |
| Hay un registro para corregir (`target` no es `null`) | `NothingToCorrect` |

### Cálculos

- **Este mes:** las lluvias desde el día 1 del mes de `today` hasta `today`.
- **Esta semana:** los últimos 7 días, contando `today`.
- **Hoy y ayer:** las lluvias de ese día.
- **Mover animales:** resta la cantidad en el origen y la suma en el destino, para esa
  categoría. El total de cabezas no cambia.
- **Lo anotado hoy:** la suma de los milímetros de las lluvias con fecha `today`, y la suma de
  los animales movidos con fecha `today`.

### Corrección (F8, Should)

Corrige la cantidad del último registro: los milímetros de una lluvia o las cabezas de un
movimiento. El registro conserva su `id` y su fecha.

- **Una lluvia:** `quantity` pasa por la regla de milímetros. Al aplicar, cambian los
  milímetros del registro y el comprobante trae el total del mes recalculado.
- **Un movimiento:** se deshace el movimiento original y se aplica otro igual con la cantidad
  nueva, que pasa por todas las reglas de movimiento. Si los animales ya no están donde hacían
  falta para deshacerlo o para rehacerlo, falla con `NotEnoughAnimals` y no cambia nada.
- `PreviewCorrection` hace todas esas comprobaciones sin guardar. `ApplyCorrection` las repite
  y guarda.

## Implementación (`data`)

```
app/src/
  domain/
    entities/      un archivo por tipo de la sección "Entidades"
    enums/         AnimalCategory.ts  RainRange.ts  RecordKind.ts
    errors/        FarmErrorCode.ts  Failure.ts  Result.ts
    repositories/  FarmRepository.ts
    datasources/   FarmLocalDataSource.ts
    services/      ClockService.ts
    usecases/      un archivo por contrato de la tabla
  data/
    usecases/
      *UseCaseImpl.ts           una clase por contrato, con su test
      rules/
        rainRules.ts            valida una lluvia
        movementRules.ts        valida un movimiento
        rainTotals.ts           sumas por período
        stockChanges.ts         mover animales entre lotes
        dates.ts                sumar días, primer día del mes
        nextId.ts
        (cada archivo con su test)
      testing/
        InMemoryFarmRepository.ts   doble del repositorio, para los tests
        sampleFarm.ts               un campo chico y fijo, para los tests
    repositories/  FarmRepositoryImpl.ts  (con su test)
    datasources/
      FileFarmLocalDataSource.ts   el archivo farm.json, con expo-file-system
      farmSeed.ts                  los datos iniciales  (con su test)
    services/      SystemClockService.ts
    models/        FarmDocument.ts      la forma del archivo guardado
    mappers/       farmMapper.ts        documento ↔ Farm  (con su test)
  di/
    Dependencies.ts   suma el reloj y los casos de uso
    container.ts      los construye
```

- **`data/usecases` importa solo de `domain`** (R3), y eso incluye a sus tests: usan
  `sampleFarm` e `InMemoryFarmRepository`, no `farmSeed`.
- **Las funciones de `rules/` son puras:** reciben un `Farm` y devuelven un `Farm` nuevo o una
  falla. No mutan lo que reciben.
- **`FarmRepositoryImpl`** recibe un `FarmLocalDataSource` y un `ClockService`. Lee el
  documento y lo pasa por el mapper. Si no hay documento o el mapper lo rechaza, arma los datos
  iniciales con `farmSeed(clock.today())`, los guarda y los devuelve.
- **`FarmDocument`** es `{ version: 1; farm: Farm }`: lo guardado tiene la misma forma que la
  entidad.
- **`farmMapper`** exporta `toEntity(document: unknown): Farm | null` y
  `toDocument(farm: Farm): FarmDocument`. `toEntity` es el único lugar donde se valida un dato
  que viene de afuera (R35): comprueba la versión, que cada campo tenga su tipo, que las
  categorías sean del enum, que las cantidades sean números finitos no negativos y que las
  fechas tengan el formato. Si algo no cumple, devuelve `null`.
- **`FileFarmLocalDataSource`** usa el archivo `farm.json` en la carpeta de documentos de la
  app. Si el archivo no existe o no es JSON, `read()` devuelve `null`. La API de
  `expo-file-system` se verifica en los tipos instalados (R58). No lleva test unitario porque
  depende del teléfono: que lo guardado sobreviva a cerrar la app se prueba a mano en el RFC-004.
- **`SystemClockService`** arma el `DateText` con el año, el mes y el día locales del teléfono.
- Un error al escribir el archivo no es una falla esperada: se propaga como excepción.

### Datos iniciales

`farmSeed(today: DateText): Farm` devuelve el campo inicial. Es una tabla fija, sin azar.
Responde a RF-22 con la lectura de S1: 450 cabezas en total.

Establecimiento "La Tranquera", actividad "Cría", ubicación "Castelli, Buenos Aires". Sin
movimientos.

| Lote | Vacas | Vaquillonas | Terneros | Novillos | Toros | Total |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 40 | 0 | 22 | 0 | 4 | 66 |
| 2 | 50 | 0 | 45 | 0 | 0 | 95 |
| 3 | 0 | 45 | 0 | 12 | 0 | 57 |
| 4 | 70 | 0 | 0 | 0 | 4 | 74 |
| 5 | 40 | 0 | 25 | 0 | 0 | 65 |
| 6 | 0 | 0 | 0 | 43 | 0 | 43 |
| 7 | 30 | 18 | 0 | 0 | 2 | 50 |
| 8 | 0 | 0 | 0 | 0 | 0 | 0 |
| **Total** | **230** | **63** | **92** | **55** | **10** | **450** |

Lluvias, como "hace cuántos días" respecto de `today` y milímetros:

| Hace (días) | 3 | 9 | 14 | 21 | 27 | 33 | 38 | 44 | 51 | 58 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Milímetros | 12 | 6 | 20 | 8 | 15 | 4 | 22 | 10 | 7 | 18 |

Todas caen entre 1 y 60 días antes de `today`.

## Criterios de aceptación

**Estructura**

1. Existen los archivos de `domain` y de `data` listados en "Implementación", en esas rutas.
2. Ningún archivo de `domain` importa de fuera de `domain`, y ningún archivo de
   `data/usecases`, tests incluidos, importa de fuera de `domain` y de su propia carpeta.
   `npm run lint` lo comprueba.
3. `Dependencies` expone `ClockService` y los casos de uso por su contrato, y no expone
   `FarmRepository` ni `FarmLocalDataSource`.

**Datos iniciales y guardado (F17)**

4. `farmSeed` devuelve "La Tranquera", cría, Castelli (Buenos Aires), con 8 lotes, sin
   movimientos y con las cantidades de la tabla. El total es 450.
5. El lote 3 tiene 45 vaquillonas, y el lote 8 no tiene animales.
6. Las diez lluvias iniciales tienen las fechas que corresponden a "hace N días" respecto del
   `today` recibido, todas dentro de los 60 días anteriores.
7. Sin documento guardado, `load()` devuelve los datos iniciales y los deja guardados.
8. Con un repositorio nuevo sobre el mismo datasource, `load()` devuelve lo que se guardó con
   `save()`.
9. Un documento con otra versión, con un campo de otro tipo, con una categoría que no existe o
   con una fecha mal formada hace que `load()` devuelva los datos iniciales.

**Lluvia (F5)**

10. Con 18 mm y la fecha de ayer, `PreviewRain` devuelve la propuesta y no guarda nada.
11. `RegisterRain` guarda el registro, con el `id` siguiente, y devuelve el total del mes, que
    incluye la lluvia nueva si es del mes en curso.
12. Cero, un negativo, `NaN` o infinito dan `InvalidMillimeters`.
13. Una fecha posterior a `today` da `FutureDate`, en `PreviewRain` y en `RegisterRain`.

**Movimiento (F6)**

14. Mover 40 vaquillonas del lote 3 al 5 devuelve la propuesta. Al registrarla, el lote 3
    queda con 5 vaquillonas, el lote 5 con 40, y el total de cabezas no cambia.
15. El comprobante trae `remainingInOrigin` igual a 5.
16. Un lote de origen o de destino que no existe da `LotNotFound` con ese lote.
17. Origen y destino iguales dan `SameLot`.
18. Cero, un negativo o un número con decimales dan `InvalidQuantity`.
19. Pedir más animales de los que hay da `NotEnoughAnimals`, con el lote, la categoría, lo
    disponible y lo pedido.
20. Las reglas se comprueban en el orden de la tabla: con una cantidad inválida y un lote que
    no existe, la falla es `InvalidQuantity`.
21. Si los datos cambiaron entre la propuesta y el registro y ya no alcanzan los animales,
    `RegisterMovement` devuelve `NotEnoughAnimals` y no guarda nada.

**Consultas (F9 y F10)**

22. `GetRainSummary` devuelve, para hoy, ayer, la semana y el mes, el total y un renglón por
    día con lluvia, del más reciente al más viejo. Dos lluvias del mismo día dan un renglón.
23. La semana son los últimos 7 días, contando hoy. El mes va del día 1 a hoy. El primer día
    del mes, el total del mes cuenta solo ese día.
24. Un período sin lluvias devuelve total 0 y ningún renglón.
25. `GetLotStock` devuelve el total del lote y la cantidad de cada una de las cinco categorías.
    Un lote que no existe da `LotNotFound`.

**Resumen (F11)**

26. `GetTodaySummary` devuelve el nombre, la actividad, la ubicación, las cabezas totales, la
    lluvia del mes, la última lluvia con cuántos días hace, el total de cada uno de los 8 lotes
    y lo anotado hoy. Sin lluvias, `lastRain` es `null`.
27. Después de registrar una lluvia de hoy y un movimiento de hoy, "lo anotado hoy" los refleja.

**Fechas e identificadores**

28. `dates.ts` suma y resta días cruzando un cambio de mes y un cambio de año, y da el primer
    día del mes.
29. `nextId` da 1 con una lista vacía y el mayor más uno con una lista que tiene registros.

**Corrección (F8, Should)**

30. Corregir una lluvia cambia sus milímetros y el total del mes. Conserva el `id` y no agrega
    un registro.
31. Corregir un movimiento deja los lotes como si se hubiera movido la cantidad nueva.
32. Corregir un movimiento a una cantidad que el origen no tiene da `NotEnoughAnimals` y no
    cambia nada.
33. Sin registro para corregir, `PreviewCorrection` da `NothingToCorrect`.

**Tests**

34. Cada criterio del 4 al 33 tiene al menos un test, cuyo nombre dice la regla que prueba, y
    `npm test` pasa.
35. `npm run typecheck` y `npm run lint` pasan.

## Reglas que aplican

R1 a R3 y R7 (capas), R8 a R13 (piezas), R14 a R18 (hooks, inyección y nombres), R29 a R39
(estilo: sin mutar, enums, objetos en lugar de condicionales, sin validaciones de más,
`Result`) y R48 a R50 (tests).

## Riesgos y casos límite

- **Primer día del mes.** "Este mes" puede dar 0 aunque haya llovido ayer. Es correcto.
- **Dos lluvias el mismo día.** Son dos registros y un solo renglón en las consultas.

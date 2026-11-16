# Plan · RFC-002 · Datos y reglas del campo

Tres pasos, sin pantalla ni builds: todo se prueba con Jest. Los implementa y prueba el
orquestador directamente, y el flujo se detiene después de cada paso para la revisión del autor.

| Paso | Objetivo | Estado |
| --- | --- | --- |
| A | Los contratos, los datos iniciales y el guardado (F17) | aprobado |
| B | Las reglas, la lluvia, el movimiento, las consultas y el resumen (F5, F6, F9, F10, F11) | pendiente |
| C | La corrección de lo último (F8, Should) | pendiente |

Rama por paso, con su PR a `feature/rfc-002`: `feature/rfc-002-A`, `-B` y `-C`.

---

## Paso A · Contratos, datos iniciales y guardado

**Objetivo:** todo `domain`, y la parte de `data` que guarda y carga el campo.

```
app/src/domain/
  [+] enums/          AnimalCategory.ts  RainRange.ts  RecordKind.ts
  [+] entities/       un archivo por tipo de la sección "Entidades" del RFC
  [+] errors/         FarmErrorCode.ts  Failure.ts  Result.ts
  [+] repositories/   FarmRepository.ts
  [+] datasources/    FarmLocalDataSource.ts
  [+] services/       ClockService.ts
  [+] usecases/       un archivo por contrato, con su tipo de entrada
app/src/data/
  [+] models/         FarmDocument.ts
  [+] mappers/        farmMapper.ts  farmMapper.test.ts
  [+] datasources/    FileFarmLocalDataSource.ts  farmSeed.ts  farmSeed.test.ts
  [+] repositories/   FarmRepositoryImpl.ts  FarmRepositoryImpl.test.ts
  [+] services/       SystemClockService.ts
app/src/di/
  [~] Dependencies.ts  suma clock
  [~] container.ts     construye el reloj
```

**Criterios:** 1 (la parte de este paso), 2, 4 a 9.

**Cómo se comprueba:** `npm test` (seed, mapper y repositorio con un datasource en memoria),
`typecheck` y `lint`. El archivo real se prueba a mano en el RFC-004.

---

## Paso B · Reglas, escrituras, consultas y resumen

**Objetivo:** las funciones de reglas y los casos de uso de lluvia, movimiento, consultas y
resumen, conectados en `di`.

```
app/src/data/usecases/
  [+] rules/          rainRules  movementRules  rainTotals  stockChanges  dates  nextId (con tests)
  [+] testing/        InMemoryFarmRepository.ts  sampleFarm.ts
  [+] PreviewRainUseCaseImpl  RegisterRainUseCaseImpl
  [+] PreviewMovementUseCaseImpl  RegisterMovementUseCaseImpl
  [+] GetRainSummaryUseCaseImpl  GetLotStockUseCaseImpl  GetTodaySummaryUseCaseImpl
      (cada uno con su test)
app/src/di/
  [~] Dependencies.ts  container.ts   los casos de uso por su contrato
```

**Criterios:** 1, 3, 10 a 29, 34 y 35.

**Cómo se comprueba:** un test por criterio, con el nombre de la regla; `typecheck` y `lint`
(incluido que `data/usecases` solo importa de `domain` y de su carpeta).

---

## Paso C · Corrección (F8, Should)

**Objetivo:** corregir la cantidad del último registro, con propuesta y aplicación.

```
app/src/data/usecases/
  [+] PreviewCorrectionUseCaseImpl  ApplyCorrectionUseCaseImpl (con tests)
  [+] rules/correctionRules.ts (con test)
app/src/di/
  [~] Dependencies.ts  container.ts   previewCorrection y applyCorrection
```

**Criterios:** 30 a 33.

**Cómo se comprueba:** tests de los cuatro criterios; `typecheck`, `lint` y la suite completa
del RFC.

---

## Antes de empezar

- **Q4, la voz de servicio:** no condiciona a este RFC. Se decide en el RFC-004.
- **R3 y los tests:** el lint ya prohíbe que `data/usecases` importe de otra carpeta de `data`.
  `testing/` vive adentro de `data/usecases`, así que los tests lo pueden usar.

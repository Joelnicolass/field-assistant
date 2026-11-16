import { movementFailure } from '@/data/usecases/rules/movementRules';
import { monthTotal } from '@/data/usecases/rules/rainTotals';
import { rainFailure } from '@/data/usecases/rules/rainRules';
import { fail, ok } from '@/data/usecases/rules/results';
import { moveAnimals } from '@/data/usecases/rules/stockChanges';
import type { AnimalMovement } from '@/domain/entities/AnimalMovement';
import type { DateText } from '@/domain/entities/DateText';
import type { Farm } from '@/domain/entities/Farm';
import type { LastRecord } from '@/domain/entities/LastRecord';
import type { RainRecord } from '@/domain/entities/RainRecord';
import type { Receipt } from '@/domain/entities/Receipt';
import { RecordKind } from '@/domain/enums/RecordKind';
import type { Result } from '@/domain/errors/Result';

type Corrected = { farm: Farm; receipt: Receipt };

function correctRain(farm: Farm, record: RainRecord, millimeters: number, today: DateText) {
  const failure = rainFailure({ millimeters, date: record.date, today });
  if (failure !== null) {
    return fail<Corrected>(failure);
  }
  const corrected = { ...record, millimeters };
  const rains = farm.rains.map((rain) => (rain.id === record.id ? corrected : rain));
  return ok<Corrected>({
    farm: { ...farm, rains },
    receipt: { kind: RecordKind.Rain, record: corrected, monthTotal: monthTotal(rains, today) },
  });
}

function correctMovement(farm: Farm, movement: AnimalMovement, quantity: number, today: DateText) {
  const undo = { ...movement, fromLot: movement.toLot, toLot: movement.fromLot };
  const undoFailure = movementFailure(farm, undo, today);
  if (undoFailure !== null) {
    return fail<Corrected>(undoFailure);
  }
  const undone = { ...farm, lots: moveAnimals(farm.lots, undo) };
  const corrected = { ...movement, quantity };
  const redoFailure = movementFailure(undone, corrected, today);
  if (redoFailure !== null) {
    return fail<Corrected>(redoFailure);
  }
  const lots = moveAnimals(undone.lots, corrected);
  const origin = lots.find((lot) => lot.number === movement.fromLot);
  return ok<Corrected>({
    farm: {
      ...undone,
      lots,
      movements: farm.movements.map((item) => (item.id === movement.id ? corrected : item)),
    },
    receipt: {
      kind: RecordKind.Movement,
      movement: corrected,
      remainingInOrigin: origin?.stock[movement.category] ?? 0,
    },
  });
}

export function correct(
  farm: Farm,
  target: LastRecord,
  quantity: number,
  today: DateText,
): Result<Corrected> {
  return target.kind === RecordKind.Rain
    ? correctRain(farm, target.record, quantity, today)
    : correctMovement(farm, target.movement, quantity, today);
}

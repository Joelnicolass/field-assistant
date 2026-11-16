import { describe, expect, it } from '@jest/globals';

import { addDays, daysBetween, firstDayOfMonth } from '@/data/usecases/rules/dates';

describe('dates', () => {
  it('suma días cruzando un cambio de mes', () => {
    expect(addDays('2026-01-30', 3)).toBe('2026-02-02');
  });

  it('resta días cruzando un cambio de año', () => {
    expect(addDays('2026-01-02', -3)).toBe('2025-12-30');
  });

  it('cuenta los días entre dos fechas', () => {
    expect(daysBetween('2025-12-30', '2026-01-02')).toBe(3);
  });

  it('da el primer día del mes', () => {
    expect(firstDayOfMonth('2026-11-16')).toBe('2026-11-01');
  });
});

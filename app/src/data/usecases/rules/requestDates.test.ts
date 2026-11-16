import { describe, expect, it } from '@jest/globals';

import { rainDate } from '@/data/usecases/rules/requestDates';
import { interpretationOf } from '@/data/usecases/testing/interpretationOf';
import { RelativeDay } from '@/domain/enums/RelativeDay';

describe('requestDates', () => {
  it('con day ayer, la fecha de la lluvia es el día anterior al de referencia', () => {
    const interpretation = interpretationOf({ day: RelativeDay.Yesterday });
    expect(rainDate(interpretation, '2026-12-01')).toBe('2026-11-30');
  });
});

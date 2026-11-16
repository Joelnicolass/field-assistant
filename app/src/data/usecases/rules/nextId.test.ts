import { describe, expect, it } from '@jest/globals';

import { nextId } from '@/data/usecases/rules/nextId';

describe('nextId', () => {
  it('da 1 con una lista vacía y el mayor más uno si hay registros', () => {
    expect(nextId([])).toBe(1);
    expect(nextId([{ id: 4 }, { id: 9 }, { id: 2 }])).toBe(10);
  });
});

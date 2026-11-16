import { describe, expect, it } from '@jest/globals';

import { toEntity } from '@/data/mappers/interpretationMapper';

const response = {
  intent: 'move_animals',
  transcript: 'pasé cuarenta vaquillonas del tres al cinco',
  millimeters: null,
  day: null,
  date: null,
  quantity: 40,
  category: 'heifer',
  fromLot: 3,
  toLot: 5,
  lot: null,
  range: null,
  question: null,
};

describe('interpretationMapper', () => {
  it('acepta una respuesta bien formada', () => {
    expect(toEntity(response)).toEqual(response);
  });

  it('rechaza una respuesta con un campo fuera de los enums', () => {
    expect(toEntity({ ...response, category: 'horse' })).toBeNull();
  });

  it('rechaza una respuesta con un campo de otro tipo', () => {
    expect(toEntity({ ...response, quantity: '40' })).toBeNull();
  });
});

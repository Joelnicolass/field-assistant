import { describe, expect, it } from '@jest/globals';

import { farmSeed } from '@/data/datasources/farmSeed';
import { daysBetween } from '@/data/usecases/rules/dates';
import { AnimalCategory } from '@/domain/enums/AnimalCategory';
import type { Lot } from '@/domain/entities/Lot';

const TODAY = '2026-11-16';

function lotTotal(lot: Lot): number {
  return Object.values(lot.stock).reduce((sum, quantity) => sum + quantity, 0);
}

describe('farmSeed', () => {
  const farm = farmSeed(TODAY);

  it('es La Tranquera, cría, en Castelli, con 8 lotes y sin movimientos', () => {
    expect(farm.name).toBe('La Tranquera');
    expect(farm.activity).toBe('Cría');
    expect(farm.location).toBe('Castelli, Buenos Aires');
    expect(farm.lots.map((lot) => lot.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(farm.movements).toEqual([]);
  });

  it('tiene las cantidades de la tabla y 450 cabezas en total', () => {
    expect(farm.lots.map(lotTotal)).toEqual([66, 95, 57, 74, 65, 43, 50, 0]);
    expect(farm.lots.reduce((sum, lot) => sum + lotTotal(lot), 0)).toBe(450);
  });

  it('el lote 3 tiene 45 vaquillonas y el lote 8 no tiene animales', () => {
    expect(farm.lots[2].stock[AnimalCategory.Heifer]).toBe(45);
    expect(lotTotal(farm.lots[7])).toBe(0);
  });

  it('las diez lluvias caen hace los días de la tabla, dentro de los 60 días anteriores', () => {
    const daysAgo = farm.rains.map((rain) => daysBetween(rain.date, TODAY));
    expect(daysAgo).toEqual([3, 9, 14, 21, 27, 33, 38, 44, 51, 58]);
    expect(daysAgo.every((days) => days >= 1 && days <= 60)).toBe(true);
  });
});

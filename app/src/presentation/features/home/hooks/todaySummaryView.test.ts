import { describe, expect, it } from '@jest/globals';

import type { TodaySummary } from '@/domain/entities/TodaySummary';
import { todaySummaryView } from './todaySummaryView';

const SUMMARY: TodaySummary = {
  farmName: 'La Tranquera',
  activity: 'Cría',
  location: 'Castelli, Buenos Aires',
  totalHeads: 450,
  monthRain: 64,
  lastRain: { date: '2026-11-15', millimeters: 18, daysAgo: 1 },
  lots: [
    { number: 1, total: 100 },
    { number: 2, total: 0 },
  ],
  notedToday: { rainMillimeters: 0, movedAnimals: 0 },
};

const lastRain = (summary: TodaySummary) => todaySummaryView(summary).tiles[2];

describe('todaySummaryView', () => {
  it('junta el nombre del campo con la actividad y la ubicación', () => {
    expect(todaySummaryView(SUMMARY).place).toBe('La Tranquera · Cría · Castelli, Buenos Aires');
  });

  it('dice "hoy" si la última lluvia fue hoy, con los milímetros en la etiqueta', () => {
    const tile = lastRain({
      ...SUMMARY,
      lastRain: { date: '2026-11-16', millimeters: 5, daysAgo: 0 },
    });
    expect(tile.value).toBe('hoy');
    expect(tile.labelStrong).toBe('5 mm');
  });

  it('dice "ayer" si la última lluvia fue ayer', () => {
    expect(lastRain(SUMMARY).value).toBe('ayer');
  });

  it('dice "hace N días" si fue antes', () => {
    const tile = lastRain({
      ...SUMMARY,
      lastRain: { date: '2026-11-12', millimeters: 18, daysAgo: 4 },
    });
    expect(tile.value).toBe('hace 4 días');
  });

  it('dice "sin lluvias" si no hay ninguna', () => {
    expect(lastRain({ ...SUMMARY, lastRain: null }).value).toBe('sin lluvias');
  });

  it('dice que no se anotó nada cuando no hay registros de hoy', () => {
    expect(todaySummaryView(SUMMARY).noted).toEqual({
      text: 'Hoy todavía no anotaste nada',
      anything: false,
    });
  });

  it('cuenta lo anotado hoy', () => {
    const view = todaySummaryView({
      ...SUMMARY,
      notedToday: { rainMillimeters: 18, movedAnimals: 45 },
    });
    expect(view.noted).toEqual({
      text: 'Hoy anotaste 18 mm de lluvia y 45 animales movidos',
      anything: true,
    });
  });

  it('separa los miles en un número de cuatro cifras', () => {
    expect(todaySummaryView({ ...SUMMARY, totalHeads: 1240 }).tiles[0].value).toBe('1.240');
  });

  it('da a cada lote su proporción y cuenta los que tienen hacienda', () => {
    const view = todaySummaryView(SUMMARY);
    expect(view.lots.map((lot) => lot.share)).toEqual([1, 0]);
    expect(view.activeLots).toBe('1 lote activo');
  });
});

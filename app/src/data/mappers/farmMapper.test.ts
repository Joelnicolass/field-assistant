import { describe, expect, it } from '@jest/globals';

import { farmSeed } from '@/data/datasources/farmSeed';
import { toDocument, toEntity } from '@/data/mappers/farmMapper';

const farm = farmSeed('2026-11-16');

describe('farmMapper', () => {
  it('lee de vuelta un documento que armó toDocument', () => {
    expect(toEntity(JSON.parse(JSON.stringify(toDocument(farm))))).toEqual(farm);
  });

  it('rechaza un documento con otra versión', () => {
    expect(toEntity({ version: 2, farm })).toBeNull();
  });

  it('rechaza un documento sin las listas del campo', () => {
    expect(toEntity({ version: 1, farm: { name: 'La Tranquera' } })).toBeNull();
  });

  it('rechaza algo que no es un documento', () => {
    expect(toEntity(null)).toBeNull();
  });
});

import { FARM_DOCUMENT_VERSION, type FarmDocument } from '@/data/models/FarmDocument';
import type { Farm } from '@/domain/entities/Farm';

function isFarmDocument(value: unknown): value is FarmDocument {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const { version, farm } = value as Partial<FarmDocument>;
  return (
    version === FARM_DOCUMENT_VERSION &&
    Array.isArray(farm?.lots) &&
    Array.isArray(farm?.rains) &&
    Array.isArray(farm?.movements)
  );
}

export function toEntity(document: unknown): Farm | null {
  return isFarmDocument(document) ? document.farm : null;
}

export function toDocument(farm: Farm): FarmDocument {
  return { version: FARM_DOCUMENT_VERSION, farm };
}

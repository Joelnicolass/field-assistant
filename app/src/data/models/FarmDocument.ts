import type { Farm } from '@/domain/entities/Farm';

export const FARM_DOCUMENT_VERSION = 1;

export type FarmDocument = { version: typeof FARM_DOCUMENT_VERSION; farm: Farm };

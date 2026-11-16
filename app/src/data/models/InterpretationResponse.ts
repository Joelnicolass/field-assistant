import type { Interpretation } from '@/domain/entities/Interpretation';

/** Lo que contesta /interpret-audio, antes de comprobarlo: cada campo puede venir de cualquier tipo. */
export type InterpretationResponse = Record<keyof Interpretation, unknown>;

import type { Failure } from '@/domain/errors/Failure';

export type Result<T, F = Failure> = { ok: true; value: T } | { ok: false; failure: F };

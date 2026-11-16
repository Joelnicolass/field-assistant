import type { Failure } from '@/domain/errors/Failure';
import type { Result } from '@/domain/errors/Result';

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function fail<T>(failure: Failure): Result<T> {
  return { ok: false, failure };
}

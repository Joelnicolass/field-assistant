import { File, UploadType, type UploadResult } from 'expo-file-system';

import { toEntity } from '@/data/mappers/interpretationMapper';
import type { Interpretation } from '@/domain/entities/Interpretation';
import type { InterpreterFailure } from '@/domain/entities/InterpreterFailure';
import { InterpreterErrorCode } from '@/domain/enums/InterpreterErrorCode';
import type { Result } from '@/domain/errors/Result';
import type { InterpretInput, InterpreterService } from '@/domain/services/InterpreterService';

type InterpretResult = Result<Interpretation, InterpreterFailure>;

const SERVER_ERROR_STATUS = 500;
const CLIENT_ERROR_STATUS = 400;

function failed(code: InterpreterErrorCode): InterpretResult {
  return { ok: false, failure: { code } };
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function resultOf({ status, body }: UploadResult): InterpretResult {
  if (status >= SERVER_ERROR_STATUS) {
    return failed(InterpreterErrorCode.Server);
  }
  if (status >= CLIENT_ERROR_STATUS) {
    return failed(InterpreterErrorCode.Refused);
  }
  const interpretation = toEntity(parseJson(body));
  return interpretation === null
    ? failed(InterpreterErrorCode.Unreadable)
    : { ok: true, value: interpretation };
}

export class ServerInterpreterService implements InterpreterService {
  constructor(
    private readonly serverUrl: string,
    private readonly timeoutMs: number,
  ) {}

  async interpret({ audio, history, referenceDay }: InterpretInput): Promise<InterpretResult> {
    const file = new File(audio.uri);
    if (!file.exists) {
      return failed(InterpreterErrorCode.Unreadable);
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      // El archivo viaja como cuerpo, directo desde el disco: no pasa por la memoria de JavaScript.
      const response = await file.upload(`${this.serverUrl}/interpret-audio`, {
        uploadType: UploadType.BINARY_CONTENT,
        headers: {
          'Content-Type': audio.mimeType,
          'X-History': encodeURIComponent(JSON.stringify(history)),
          'X-Reference-Day': referenceDay,
        },
        signal: controller.signal,
      });
      return resultOf(response);
    } catch {
      return failed(
        controller.signal.aborted ? InterpreterErrorCode.Timeout : InterpreterErrorCode.Offline,
      );
    } finally {
      clearTimeout(timer);
    }
  }
}

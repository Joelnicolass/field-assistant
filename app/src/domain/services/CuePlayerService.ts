import type { CueKind } from '@/domain/enums/CueKind';

export interface CuePlayerService {
  /**
   * Hace sonar la próxima frase de ese tipo; `onStart` recibe su texto cuando empieza a sonar.
   * Devuelve el texto y termina cuando deja de sonar. Si el audio no se puede reproducir, falla.
   */
  play(kind: CueKind, onStart?: (text: string) => void): Promise<string>;
  stop(): void;
}

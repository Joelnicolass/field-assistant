import { MicrophonePermission } from '@/domain/enums/MicrophonePermission';

export const ACCESS_TEXT = {
  title: 'Permisos',
  microphone: 'Micrófono',
  explain: 'Lo usan hablar con la app y manos libres.',
} as const;

/** Cómo está el permiso y qué botón lo arregla; concedido no necesita botón. */
export const PERMISSION_TEXT: Record<
  MicrophonePermission,
  { state: string; action: string | null }
> = {
  [MicrophonePermission.Granted]: { state: 'Permitido', action: null },
  [MicrophonePermission.NotAsked]: { state: 'Sin pedir', action: 'Permitir' },
  [MicrophonePermission.Denied]: { state: 'Negado', action: 'Abrir ajustes del teléfono' },
};

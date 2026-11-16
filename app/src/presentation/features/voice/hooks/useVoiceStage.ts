import type { InfoCardProps } from '@/shared/presentation/components/InfoCard';
import { OrbState } from '@/shared/presentation/components/Orb';
import { IDLE_STATUS, IDLE_SUBTITLE } from './constants';

export type VoiceStageView = {
  orbState: OrbState;
  level: number;
  statusText: string;
  subtitle: string;
  cards: (InfoCardProps & { key: string })[];
  /** Audios guardados sin señal; con 0 no se muestra. */
  pendingCount: number;
  /** Si hay un turno en curso: el resumen se apaga mientras tanto. */
  busy: boolean;
  onOrbPress: () => void;
};

function doNothing() {}

/** Entrega lo que dibuja la zona de voz. Por ahora, el reposo: el turno real llega en el RFC-004. */
export function useVoiceStage(): VoiceStageView {
  return {
    orbState: OrbState.Idle,
    level: 0,
    statusText: IDLE_STATUS,
    subtitle: IDLE_SUBTITLE,
    cards: [],
    pendingCount: 0,
    busy: false,
    onOrbPress: doNothing,
  };
}

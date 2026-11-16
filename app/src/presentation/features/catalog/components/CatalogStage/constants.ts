import { OrbState } from '@/shared/presentation/components/Orb';
import type { TodaySummaryView } from '@/presentation/features/home/hooks/todaySummaryView';
import type { VoiceStageView } from '@/presentation/features/voice/hooks/useVoiceStage';
import { CATALOG_CARDS } from '../CatalogCards/constants';

function doNothing() {}

/** La altura de muestra de la zona de voz: lo que queda debajo del resumen en un teléfono. */
export const STAGE_HEIGHT = 640;

const IDLE: VoiceStageView = {
  orbState: OrbState.Idle,
  level: 0,
  statusText: 'Tocá para hablar',
  subtitle: 'Contame qué pasó hoy en el campo',
  cards: [],
  pendingCount: 0,
  busy: false,
  onOrbPress: doNothing,
};

export const STAGES: { key: string; title: string; view: VoiceStageView }[] = [
  { key: 'idle', title: 'Zona de voz sin tarjetas', view: IDLE },
  {
    key: 'card',
    title: 'Zona de voz con una tarjeta',
    view: {
      ...IDLE,
      statusText: 'Tocá para decir otra cosa',
      subtitle: 'Anoto 18 milímetros para anoche. ¿Está bien?',
      cards: [CATALOG_CARDS[0]],
    },
  },
];

// Un nombre largo y un número de cuatro cifras, para ver que no se corten (criterio 21).
export const SAMPLE_SUMMARY: TodaySummaryView = {
  place: 'Estancia Los Tres Ombúes del Salado · Cría · Castelli, Buenos Aires',
  noted: { text: 'Hoy anotaste 18 mm de lluvia y 45 animales movidos', anything: true },
  tiles: [
    { key: 'heads', value: '1.240', label: 'cabezas en total' },
    { key: 'monthRain', value: '164', unit: 'mm', label: 'lluvia del mes' },
    { key: 'lastRain', value: 'hace 2 días', label: 'última lluvia · ', labelStrong: '18 mm' },
  ],
  activeLots: '7 lotes activos',
  lots: [66, 95, 17, 74, 105, 43, 50, 0].map((heads, index) => ({
    key: String(index + 1),
    name: `L${index + 1}`,
    heads: String(heads),
    share: heads / 105,
    empty: heads === 0,
  })),
};

export const SUMMARY_TITLE = {
  full: 'Resumen de hoy',
  compact: 'Resumen con una tarjeta y 2 audios guardados',
} as const;

import { ButtonVariant } from '@/shared/presentation/components/AppButton';
import { IconName } from '@/shared/presentation/components/Icon';
import type { InfoCardButton, InfoCardProps } from '@/shared/presentation/components/InfoCard';
import { Tone } from '@/shared/presentation/theme/Tone';

const COUNTDOWN_MS = 4000;

function doNothing() {}

function button(label: string, variant: ButtonVariant, counting = false): InfoCardButton {
  return {
    key: label,
    label,
    variant,
    onPress: doNothing,
    countdown: counting ? { durationMs: COUNTDOWN_MS, paused: false } : undefined,
  };
}

const NOTE_OR_CANCEL = [
  button('Anotar', ButtonVariant.Primary, true),
  button('Cancelar', ButtonVariant.Secondary),
];

export const CATALOG_CARDS: (InfoCardProps & { key: string })[] = [
  {
    key: 'rain-proposal',
    icon: IconName.Rain,
    label: 'Anotar lluvia',
    tone: Tone.Brand,
    big: { value: '18', unit: 'mm' },
    hint: 'Anoche, domingo 15',
    buttons: NOTE_OR_CANCEL,
    heard: 'anoche llovieron dieciocho milímetros',
  },
  {
    key: 'movement-proposal',
    icon: IconName.Move,
    label: 'Anotar movimiento',
    tone: Tone.Brand,
    big: { value: '45', unit: 'vacas' },
    route: { from: '3', to: '5' },
    buttons: NOTE_OR_CANCEL,
    heard: 'pasé cuarenta y cinco vacas del tres al cinco',
  },
  {
    key: 'correction-proposal',
    icon: IconName.Rain,
    label: 'Corregir lluvia',
    tone: Tone.Brand,
    big: { value: '22', unit: 'mm' },
    hint: 'Antes decía 18 mm',
    buttons: NOTE_OR_CANCEL,
    heard: 'no, fueron veintidós',
  },
  {
    key: 'receipt',
    icon: IconName.Check,
    label: 'Anotado',
    tone: Tone.Brand,
    big: { value: '18', unit: 'mm' },
    hint: 'Anoche, domingo 15',
    rows: [{ key: 'month', label: 'Lluvia de noviembre', value: '64 mm' }],
    onClose: doNothing,
  },
  {
    key: 'rain-answer',
    icon: IconName.Rain,
    label: 'Lluvia de noviembre',
    tone: Tone.Brand,
    big: { value: '64', unit: 'mm' },
    rows: [
      { key: '2', label: 'Domingo 2', value: '12 mm' },
      { key: '9', label: 'Domingo 9', value: '34 mm' },
      { key: '15', label: 'Domingo 15', value: '18 mm' },
    ],
    onClose: doNothing,
  },
  {
    key: 'lot-answer',
    icon: IconName.Question,
    label: 'Lote 3 · La Loma',
    tone: Tone.Brand,
    big: { value: '1.240', unit: 'cabezas' },
    rows: [
      { key: 'cows', label: 'Vacas', value: '620', share: 1 },
      { key: 'heifers', label: 'Vaquillonas', value: '340', share: 0.55 },
      { key: 'calves', label: 'Terneros', value: '280', share: 0.45 },
    ],
    onClose: doNothing,
  },
  {
    key: 'question',
    icon: IconName.Question,
    label: 'Me falta un dato',
    tone: Tone.Brand,
    message: '¿A qué lote pasaste las vacas?',
    onClose: doNothing,
  },
  {
    key: 'not-understood',
    icon: IconName.Alert,
    label: 'No entendí',
    tone: Tone.Warning,
    message: 'No te entendí bien. Probá con una de estas:',
    examples: ['Llovieron 20 milímetros', 'Pasé 30 vacas del 2 al 4', '¿Cuánto llovió este mes?'],
    onClose: doNothing,
  },
  {
    key: 'rejection',
    icon: IconName.Alert,
    label: 'No se puede',
    tone: Tone.Danger,
    message: 'En el lote 3 hay 40 vacas: no se pueden pasar 45.',
    onClose: doNothing,
  },
  {
    key: 'no-microphone',
    icon: IconName.MicrophoneOff,
    label: 'Sin micrófono',
    tone: Tone.Warning,
    message: 'Necesito permiso para usar el micrófono',
    hint: 'Se activa en los ajustes del teléfono',
    buttons: [button('Abrir ajustes', ButtonVariant.Primary)],
    onClose: doNothing,
  },
  {
    key: 'saved-audio',
    icon: IconName.Offline,
    label: 'Sin señal',
    tone: Tone.Warning,
    message: 'Guardé tu audio',
    hint: 'Lo anoto cuando vuelva la señal',
    onClose: doNothing,
  },
  {
    key: 'offline-proposal',
    icon: IconName.Offline,
    label: 'Grabado sin señal',
    tone: Tone.Brand,
    big: { value: '18', unit: 'mm' },
    hint: 'Grabado a las 7:40',
    buttons: [button('Anotar', ButtonVariant.Primary), button('Descartar', ButtonVariant.Secondary)],
    heard: 'llovieron dieciocho milímetros',
  },
  {
    key: 'offline-not-understood',
    icon: IconName.Alert,
    label: 'Grabado sin señal',
    tone: Tone.Warning,
    message: 'No entendí un audio que guardé sin señal',
    buttons: [button('Descartar', ButtonVariant.Secondary)],
  },
  {
    key: 'missing-voice',
    icon: IconName.Alert,
    label: 'Falta la voz',
    tone: Tone.Warning,
    message: 'Falta instalar la voz en español',
    hint: 'Sin ella no te puedo contestar en voz alta',
    buttons: [button('Instalar voz', ButtonVariant.Primary)],
    onClose: doNothing,
  },
];

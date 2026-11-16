import { describe, expect, it, jest } from '@jest/globals';

import type { RainSummary } from '@/domain/entities/RainSummary';
import { AnimalCategory } from '@/domain/enums/AnimalCategory';
import { InterpreterErrorCode } from '@/domain/enums/InterpreterErrorCode';
import { RainRange } from '@/domain/enums/RainRange';
import { RecordKind } from '@/domain/enums/RecordKind';
import { ResolutionKind } from '@/domain/enums/ResolutionKind';
import { FarmErrorCode } from '@/domain/errors/FarmErrorCode';
import { IconName } from '@/shared/presentation/components/Icon/IconName';
import type { InfoCardProps } from '@/shared/presentation/components/InfoCard/types';
import { Tone } from '@/shared/presentation/theme/Tone';
import { VoiceCardKind, type AnswerCard, type VoiceCard } from '../../states/VoiceCard';
import { SPOKEN } from '../constants';
import { cardView, type CardContext } from './cardView';

const TODAY = '2026-11-16';

const actions = {
  confirm: jest.fn(),
  cancel: jest.fn(),
  close: jest.fn(),
  discard: jest.fn(),
  openSettings: jest.fn(),
};
const context: CardContext = { actions, today: TODAY, countdown: undefined };

const SUMMARY: RainSummary = {
  range: RainRange.Month,
  total: 64,
  days: [{ date: '2026-11-15', millimeters: 18 }],
};
const STOCK = {
  lot: 3,
  total: 100,
  byCategory: {
    [AnimalCategory.Cow]: 80,
    [AnimalCategory.Heifer]: 20,
    [AnimalCategory.Calf]: 0,
    [AnimalCategory.Steer]: 0,
    [AnimalCategory.Bull]: 0,
  },
};
const RAIN_RECORD = { id: 1, date: '2026-11-15', notedOn: TODAY, millimeters: 18 };
const RAIN_PROPOSAL: VoiceCard = {
  kind: VoiceCardKind.Proposal,
  resolution: {
    kind: ResolutionKind.RainProposal,
    proposal: { millimeters: 18, date: '2026-11-15' },
  },
  heard: 'llovieron dieciocho milímetros',
};
const RAIN_ANSWER: AnswerCard = { kind: VoiceCardKind.RainAnswer, summary: SUMMARY };

const CASES: [string, VoiceCard, Partial<InfoCardProps>][] = [
  [
    'Proposal',
    RAIN_PROPOSAL,
    {
      icon: IconName.Rain,
      label: 'Anotar lluvia',
      big: { value: '18', unit: 'mm' },
      hint: 'Anoche, domingo 15',
      heard: 'llovieron dieciocho milímetros',
    },
  ],
  [
    'Receipt',
    {
      kind: VoiceCardKind.Receipt,
      receipt: { kind: RecordKind.Rain, record: RAIN_RECORD, monthTotal: 64 },
    },
    {
      icon: IconName.Check,
      label: 'Anotado',
      rows: [{ key: 'month', label: 'Lluvia de noviembre', value: '64 milímetros' }],
    },
  ],
  [
    'RainAnswer',
    RAIN_ANSWER,
    {
      label: 'Lluvia de noviembre',
      big: { value: '64', unit: 'mm' },
      rows: [{ key: '2026-11-15', label: 'Domingo 15', value: '18 milímetros' }],
    },
  ],
  [
    'LotAnswer',
    { kind: VoiceCardKind.LotAnswer, stock: STOCK },
    {
      label: 'Lote 3',
      big: { value: '100', unit: 'cabezas' },
      rows: [
        { key: 'cow', label: 'Vacas', value: '80', share: 1 },
        { key: 'heifer', label: 'Vaquillonas', value: '20', share: 0.25 },
        { key: 'calf', label: 'Terneros', value: '0', share: 0 },
        { key: 'steer', label: 'Novillos', value: '0', share: 0 },
        { key: 'bull', label: 'Toros', value: '0', share: 0 },
      ],
    },
  ],
  [
    'Question',
    { kind: VoiceCardKind.Question, question: '¿A qué lote?' },
    { label: 'Me falta un dato', message: '¿A qué lote?' },
  ],
  [
    'Rejected',
    { kind: VoiceCardKind.Rejected, failure: { code: FarmErrorCode.LotNotFound, lot: 12 } },
    { tone: Tone.Danger, message: 'El lote 12 no existe.' },
  ],
  [
    'NotUnderstood',
    { kind: VoiceCardKind.NotUnderstood },
    { tone: Tone.Warning, label: 'No entendí', examples: SPOKEN.examples },
  ],
  [
    'MicrophoneDenied',
    { kind: VoiceCardKind.MicrophoneDenied },
    { icon: IconName.MicrophoneOff, label: 'Sin micrófono' },
  ],
  [
    'AudioSaved',
    { kind: VoiceCardKind.AudioSaved, code: InterpreterErrorCode.Offline },
    { icon: IconName.Offline, message: 'Guardé tu audio', label: 'Sin señal' },
  ],
  [
    'AudioSaved con el servicio saturado',
    { kind: VoiceCardKind.AudioSaved, code: InterpreterErrorCode.Server },
    { message: 'Guardé tu audio', label: 'Servicio saturado', hint: 'Lo envío enseguida' },
  ],
  [
    'SavedProposal',
    {
      kind: VoiceCardKind.SavedProposal,
      id: 4,
      resolution: {
        kind: ResolutionKind.RainProposal,
        proposal: { millimeters: 18, date: '2026-11-14' },
      },
      recordedOn: '2026-11-14',
    },
    { icon: IconName.Offline, label: 'Grabado sin señal', hint: 'Grabado el sábado 14' },
  ],
  [
    'SavedAnswer',
    { kind: VoiceCardKind.SavedAnswer, id: 5, answer: RAIN_ANSWER },
    { label: 'Lluvia de noviembre', big: { value: '64', unit: 'mm' } },
  ],
  [
    'SavedRejected',
    {
      kind: VoiceCardKind.SavedRejected,
      id: 7,
      failure: { code: FarmErrorCode.LotNotFound, lot: 12 },
    },
    { tone: Tone.Danger, message: 'El lote 12 no existe.' },
  ],
  [
    'SavedNotUnderstood',
    { kind: VoiceCardKind.SavedNotUnderstood, id: 6 },
    { label: 'Grabado sin señal', message: 'No se entendió lo que grabaste' },
  ],
];

describe('cardView', () => {
  it.each(CASES)('arma la tarjeta %s', (_name, card, expected) => {
    expect(cardView(card, context)).toMatchObject(expected);
  });

  it('la propuesta lleva "Anotar" con la cuenta y "Cancelar"', () => {
    const countdown = { durationMs: 4000, paused: false };
    const { buttons } = cardView(RAIN_PROPOSAL, { ...context, countdown });
    expect(buttons?.map((button) => button.label)).toEqual(['Anotar', 'Cancelar']);
    expect(buttons?.[0].countdown).toEqual(countdown);
  });
});

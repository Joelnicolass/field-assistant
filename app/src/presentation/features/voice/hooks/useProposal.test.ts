import { describe, expect, it, jest } from '@jest/globals';
import { act, createElement } from 'react';
import { createRoot } from 'test-renderer';

import type { RegisterRainUseCase } from '@/domain/usecases/RegisterRainUseCase';
import { RecordKind } from '@/domain/enums/RecordKind';
import { ResolutionKind } from '@/domain/enums/ResolutionKind';
import { VoiceCardKind, type ProposalCard } from '../states/VoiceCard';
import { VoiceEvent } from '../states/VoiceEvent';
import { INITIAL_VOICE_STATE } from '../states/voiceReducer';
import { useProposal } from './useProposal';

const TODAY = '2026-11-16';
const RAIN_RECORD = { id: 1, date: '2026-11-15', notedOn: TODAY, millimeters: 18 };

const mockRegisterRain = { execute: jest.fn<RegisterRainUseCase['execute']>() };

jest.mock('@/di/useDependencies', () => ({
  useDependencies: () => ({
    clock: { today: () => TODAY },
    registerRain: mockRegisterRain,
    registerMovement: { execute: jest.fn() },
    applyCorrection: { execute: jest.fn() },
  }),
}));

const PROPOSAL = { millimeters: 18, date: '2026-11-15' };
const CARD: ProposalCard = {
  kind: VoiceCardKind.Proposal,
  resolution: { kind: ResolutionKind.RainProposal, proposal: PROPOSAL },
  heard: 'llovieron dieciocho milímetros',
};

describe('useProposal', () => {
  it('confirm anota con una tarjeta de propuesta y avisa para que el resumen se actualice', async () => {
    const receipt = { kind: RecordKind.Rain, record: RAIN_RECORD, monthTotal: 56 } as const;
    mockRegisterRain.execute.mockResolvedValue({ ok: true, value: receipt });
    const dispatch = jest.fn();
    const onRecorded = jest.fn();
    let confirm = (_card: ProposalCard): Promise<void> => Promise.resolve();

    function Harness() {
      confirm = useProposal({
        state: INITIAL_VOICE_STATE,
        dispatch,
        fail: jest.fn(),
        silence: jest.fn(),
        onRecorded,
        discard: jest.fn(async () => undefined),
      }).confirm;
      return null;
    }
    const root = createRoot();
    await act(async () => {
      root.render(createElement(Harness));
    });
    await act(async () => {
      await confirm(CARD);
    });

    expect(mockRegisterRain.execute).toHaveBeenCalledWith({ proposal: PROPOSAL, today: TODAY });
    expect(onRecorded).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: VoiceEvent.ProposalConfirmed,
      result: { ok: true, value: receipt },
      spoken: 'Anotado. Van 56 milímetros en el mes.',
    });
  });
});

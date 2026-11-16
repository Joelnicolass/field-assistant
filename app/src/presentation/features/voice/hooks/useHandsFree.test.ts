import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, createElement } from 'react';
import { AppState, Vibration } from 'react-native';
import { createRoot, type Root } from 'test-renderer';

import { MicrophonePermission } from '@/domain/enums/MicrophonePermission';
import type { AudioRecorderService } from '@/domain/services/AudioRecorderService';
import type { InterpreterService } from '@/domain/services/InterpreterService';
import type { WakePhraseService } from '@/domain/services/WakePhraseService';
import { VoiceCardKind } from '../states/VoiceCard';
import { VoicePhase } from '../states/VoicePhase';
import { useVoiceTurn } from './useVoiceTurn';

const mockRecorder = {
  permission: jest.fn<AudioRecorderService['permission']>(),
  requestPermission: jest.fn<AudioRecorderService['requestPermission']>(),
  start: jest.fn<AudioRecorderService['start']>(async () => undefined),
  stop: jest.fn<AudioRecorderService['stop']>(),
  cancel: jest.fn<AudioRecorderService['cancel']>(async () => undefined),
};
const mockWakePhrase = {
  start: jest.fn<WakePhraseService['start']>(async () => undefined),
  stop: jest.fn<WakePhraseService['stop']>(async () => undefined),
};
const mockInterpreter = { interpret: jest.fn<InterpreterService['interpret']>() };

// Siempre los mismos objetos, como el contenedor: los efectos dependen de ellos.
const mockDependencies = {
  clock: { today: () => '2026-11-16' },
  recorder: mockRecorder,
  wakePhrase: mockWakePhrase,
  interpreter: mockInterpreter,
  speaker: { speak: async () => undefined, stop: () => undefined, reset: () => undefined },
  countPendingAudios: { execute: async () => 0 },
  retryPendingAudios: { execute: async () => ({ resolved: [], waiting: 0 }) },
  discardPendingAudio: { execute: async () => undefined },
  keepAudioForLater: { execute: async () => undefined },
  resolveRequest: { execute: jest.fn() },
  registerRain: { execute: jest.fn() },
  registerMovement: { execute: jest.fn() },
  applyCorrection: { execute: jest.fn() },
};

jest.mock('@/di/useDependencies', () => ({ useDependencies: () => mockDependencies }));

type Turn = ReturnType<typeof useVoiceTurn>;

describe('manos libres', () => {
  let turn: Turn | undefined;
  let root: Root;

  function current(): Turn {
    if (turn === undefined) {
      throw new Error('El turno no se dibujó');
    }
    return turn;
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(Vibration, 'vibrate').mockImplementation(() => undefined);
    // El doble de AppState de React Native no dice si la app está a la vista.
    Object.defineProperty(AppState, 'currentState', { value: 'active', configurable: true });
    mockRecorder.permission.mockResolvedValue(MicrophonePermission.Granted);
    function Harness() {
      turn = useVoiceTurn({ onRecorded: () => undefined });
      return null;
    }
    root = createRoot();
    await act(async () => {
      root.render(createElement(Harness));
    });
  });

  afterEach(() => {
    act(() => root.unmount());
  });

  async function turnOn() {
    await act(async () => {
      current().handsFree.onChange(true);
    });
  }

  it('está apagado al abrir la app', () => {
    expect(current().handsFree.enabled).toBe(false);
    expect(mockWakePhrase.start).not.toHaveBeenCalled();
  });

  it('encendido y sin decir la frase, no se graba ni se envía nada', async () => {
    await turnOn();

    expect(current().handsFree.enabled).toBe(true);
    expect(mockWakePhrase.start).toHaveBeenCalledTimes(1);
    expect(current().state.phase).toBe(VoicePhase.Idle);
    expect(mockRecorder.start).not.toHaveBeenCalled();
    expect(mockInterpreter.interpret).not.toHaveBeenCalled();
  });

  it('al oír la frase vibra, frena el detector y empieza a escuchar', async () => {
    await turnOn();
    const [onDetected] = mockWakePhrase.start.mock.calls[0] ?? [];

    await act(async () => {
      onDetected?.();
    });

    expect(Vibration.vibrate).toHaveBeenCalledTimes(1);
    expect(mockWakePhrase.stop).toHaveBeenCalledTimes(1);
    expect(current().state.phase).toBe(VoicePhase.Listening);
    expect(mockRecorder.start).toHaveBeenCalledTimes(1);
  });

  it('con el permiso denegado queda apagado y muestra la tarjeta "Sin micrófono"', async () => {
    mockRecorder.permission.mockResolvedValue(MicrophonePermission.Denied);

    await turnOn();

    expect(current().handsFree.enabled).toBe(false);
    expect(current().state.card).toEqual({ kind: VoiceCardKind.MicrophoneDenied });
    expect(mockWakePhrase.start).not.toHaveBeenCalled();
  });

  it('si el detector no arranca, se apaga', async () => {
    mockWakePhrase.start.mockRejectedValueOnce(new Error('sin modelo'));
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await turnOn();

    expect(current().handsFree.enabled).toBe(false);
  });
});

import { describe, expect, it } from '@jest/globals';

import { proposeSpeechLevel } from './calibration';

describe('proposeSpeechLevel', () => {
  it('queda entre el ruido y la voz, más cerca del ruido', () => {
    const ambient = [0.1, 0.12, 0.15, 0.2, 0.18, 0.1, 0.11, 0.13, 0.14, 0.2];
    const voice = [0.7, 0.8, 0.75, 0.3, 0.85, 0.8, 0.78, 0.82, 0.2, 0.79];
    // Ruido (percentil 90): 0,2. Voz (mediana): 0,79. 0,2 + 0,59 × 0,4 = 0,436.
    expect(proposeSpeechLevel(ambient, voice)).toBe(0.44);
  });

  it('no propone nada si la voz no se distingue del ambiente', () => {
    expect(proposeSpeechLevel([0.5, 0.55, 0.6], [0.6, 0.62, 0.58])).toBeNull();
  });

  it('no propone nada sin mediciones', () => {
    expect(proposeSpeechLevel([], [0.8])).toBeNull();
    expect(proposeSpeechLevel([0.1], [])).toBeNull();
  });

  it('no baja del mínimo en un lugar en silencio total', () => {
    expect(proposeSpeechLevel([0, 0, 0], [0.1, 0.1, 0.1])).toBe(0.05);
  });
});

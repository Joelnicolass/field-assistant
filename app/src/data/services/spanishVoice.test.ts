import { describe, expect, it } from '@jest/globals';

import { spanishVoice } from './spanishVoice';

describe('spanishVoice', () => {
  it('elige una voz en español, la más cercana a la rioplatense y sin red', () => {
    const voices = [
      { identifier: 'en-us-x-iob-local', language: 'en-US' },
      { identifier: 'es-es-x-eee-local', language: 'es-ES' },
      { identifier: 'es-us-x-sfb-network', language: 'es-US' },
      { identifier: 'es-us-x-esd-local', language: 'es-US' },
    ];
    expect(spanishVoice(voices)).toBe('es-us-x-esd-local');
  });

  it('devuelve null si no hay ninguna en español', () => {
    expect(spanishVoice([{ identifier: 'en-us-x-iob-local', language: 'en-US' }])).toBeNull();
  });
});

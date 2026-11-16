import { describe, expect, it } from '@jest/globals';

import { levelFromDecibels } from './recordingLevel';

describe('levelFromDecibels', () => {
  it('lleva los decibeles a un nivel de 0 a 1', () => {
    expect([-160, -60, -30, 0].map(levelFromDecibels)).toEqual([0, 0, 0.5, 1]);
  });
});

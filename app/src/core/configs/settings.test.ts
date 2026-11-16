import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { readNumber } from '@/core/configs/settings';

const loadSettings = () => {
  jest.resetModules();
  return jest.requireActual<typeof import('@/core/configs/settings')>('@/core/configs/settings')
    .settings;
};

describe('settings', () => {
  const originalServerUrl = process.env.EXPO_PUBLIC_SERVER_URL;

  beforeEach(() => {
    delete process.env.EXPO_PUBLIC_SERVER_URL;
  });

  afterEach(() => {
    if (originalServerUrl === undefined) {
      delete process.env.EXPO_PUBLIC_SERVER_URL;
    } else {
      process.env.EXPO_PUBLIC_SERVER_URL = originalServerUrl;
    }
  });

  it('serverUrl vale http://localhost:8787 cuando EXPO_PUBLIC_SERVER_URL no está definida', () => {
    expect(loadSettings().serverUrl).toBe('http://localhost:8787');
  });

  it('serverUrl toma el valor de EXPO_PUBLIC_SERVER_URL cuando está definida', () => {
    process.env.EXPO_PUBLIC_SERVER_URL = 'http://192.168.0.10:8787';

    expect(loadSettings().serverUrl).toBe('http://192.168.0.10:8787');
  });
});

describe('readNumber', () => {
  it('devuelve el número cuando el valor lo es', () => {
    expect(readNumber('2500', 1)).toBe(2500);
  });

  it('devuelve el valor por defecto cuando no hay valor', () => {
    expect(readNumber(undefined, 1)).toBe(1);
  });

  it('devuelve el valor por defecto cuando el valor está vacío', () => {
    expect(readNumber('', 1)).toBe(1);
  });

  it('devuelve el valor por defecto cuando el valor no es un número', () => {
    expect(readNumber('mucho', 1)).toBe(1);
  });
});

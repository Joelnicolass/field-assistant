import * as Speech from 'expo-speech';
import { Linking } from 'react-native';

import type { SpanishVoiceService } from '@/domain/services/SpanishVoiceService';
import { spanishVoice } from './spanishVoice';

const INSTALL_VOICES = 'android.speech.tts.engine.INSTALL_TTS_DATA';
// Si el teléfono no tiene la pantalla de instalar voces, sus ajustes de voz.
const VOICE_SETTINGS = 'com.android.settings.TTS_SETTINGS';

/** Hay voz en español si el teléfono tiene alguna con un idioma que empieza con `es`. */
export class PhoneSpanishVoiceService implements SpanishVoiceService {
  async isInstalled(): Promise<boolean> {
    const voices = await Speech.getAvailableVoicesAsync();
    return spanishVoice(voices) !== null;
  }

  async openInstaller(): Promise<void> {
    await Linking.sendIntent(INSTALL_VOICES).catch(() => Linking.sendIntent(VOICE_SETTINGS));
  }
}

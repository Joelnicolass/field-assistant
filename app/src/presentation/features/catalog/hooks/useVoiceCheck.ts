import { useState } from 'react';

import { useDependencies } from '@/di/useDependencies';
import { MicrophonePermission } from '@/domain/enums/MicrophonePermission';

const SAMPLE_PHRASE = 'Anotado. Van cincuenta y seis milímetros en el mes.';

/** Prueba en el teléfono la voz de la app y el micrófono, sin el turno de voz. */
export function useVoiceCheck() {
  const { recorder, speaker, getUserSettings } = useDependencies();
  const [level, setLevel] = useState(0);
  const [recording, setRecording] = useState(false);
  const [heardVoice, setHeardVoice] = useState<boolean | null>(null);
  const [speaking, setSpeaking] = useState(false);

  async function startRecording() {
    const permission =
      (await recorder.permission()) === MicrophonePermission.NotAsked
        ? await recorder.requestPermission()
        : await recorder.permission();
    if (permission !== MicrophonePermission.Granted) {
      return;
    }
    setHeardVoice(null);
    setRecording(true);
    const { speechLevel } = await getUserSettings.execute();
    await recorder.start(setLevel, speechLevel);
  }

  async function stopRecording() {
    const audio = await recorder.stop();
    setRecording(false);
    setLevel(0);
    setHeardVoice(audio.heardVoice);
  }

  async function speak() {
    setSpeaking(true);
    await speaker.speak(SAMPLE_PHRASE).catch(() => undefined);
    setSpeaking(false);
  }

  return {
    level,
    recording,
    heardVoice,
    speaking,
    toggleRecording: recording ? stopRecording : startRecording,
    speak,
  };
}

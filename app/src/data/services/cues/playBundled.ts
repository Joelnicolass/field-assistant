import { createAudioPlayer } from 'expo-audio';

import { playToEnd } from '../playToEnd';
import type { PlayAudio } from './BundledCuePlayerService';

/** Reproduce un audio de los que van dentro de la app, con `expo-audio`. */
export const playBundled: PlayAudio = (source, onStart) =>
  playToEnd(createAudioPlayer(source), onStart);

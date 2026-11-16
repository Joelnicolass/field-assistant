import { useState } from 'react';
import type { LayoutChangeEvent, TextStyle } from 'react-native';

import { ELLIPSIS, FIT_SCALES } from './constants';

// Achica la letra en la misma proporción que el alto del renglón.
function scaled(letter: TextStyle, scale: number): TextStyle {
  const { fontSize, lineHeight } = letter;
  return {
    ...letter,
    fontSize: fontSize === undefined ? undefined : fontSize * scale,
    lineHeight: lineHeight === undefined ? undefined : lineHeight * scale,
  };
}

/**
 * Hace entrar el texto en `maxHeight`: mide lo que ocupa y, si se pasa, prueba una letra más chica;
 * con la más chica, saca palabras del final y cierra con "…". Las palabras todavía no se ven
 * mientras se mide, así que el ajuste no se nota. Sin `maxHeight`, no toca nada.
 */
export function useFitText(words: string[], letter: TextStyle, maxHeight: number | undefined) {
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(words.length);
  const last = FIT_SCALES.length - 1;

  const onLayout = (event: LayoutChangeEvent) => {
    if (maxHeight === undefined || event.nativeEvent.layout.height <= maxHeight) {
      return;
    }
    if (step < last) {
      setStep(step + 1);
    } else if (count > 1) {
      setCount(count - 1);
    }
  };

  const cut = count < words.length;
  const shown = cut
    ? [...words.slice(0, count - 1), `${words[count - 1] ?? ''}${ELLIPSIS}`]
    : words;
  return { words: shown, letter: scaled(letter, FIT_SCALES[step] ?? 1), onLayout };
}

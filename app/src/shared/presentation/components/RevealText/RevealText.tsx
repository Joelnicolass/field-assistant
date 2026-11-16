import { View } from 'react-native';

import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { textStyle } from '@/shared/presentation/theme/textStyle';
import type { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { STAGGER_MS, WORD_MS } from './constants';
import { RevealWord } from './RevealWord';
import { styles } from './styles';
import { useFitText } from './useFitText';
import { useRevealClock } from './useRevealClock';

type RevealTextProps = {
  text: string;
  variant: TextVariant;
  color: string;
  /** Con true, el texto se desenfoca hasta desaparecer. */
  hidden?: boolean;
  align?: 'center' | 'start';
  /** Cuánto tarda cada palabra en enfocarse. */
  wordMs?: number;
  /** Sin movimiento: las palabras solo se enfocan, sin subir. */
  still?: boolean;
  /** El alto que tiene: si el texto no entra, se achica y, si aún así no entra, se corta con "…". */
  maxHeight?: number;
};

function RevealLine(props: RevealTextProps) {
  const {
    text,
    variant,
    color,
    hidden = false,
    align = 'center',
    wordMs = WORD_MS,
    still = false,
    maxHeight,
  } = props;
  const allWords = text.split(/\s+/).filter(Boolean);
  const fit = useFitText(allWords, textStyle(useTheme(), variant), maxHeight);
  const { words, letter } = fit;
  const clock = useRevealClock(allWords.length * STAGGER_MS + wordMs, hidden);

  return (
    // Para el lector de pantalla es una sola frase, no palabras sueltas.
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={text}
      style={[styles.line, styles[align]]}
      onLayout={fit.onLayout}
    >
      {words.map((word, index) => (
        <RevealWord
          key={`${index}:${word}`}
          word={word}
          startsAt={index * STAGGER_MS}
          wordMs={wordMs}
          still={still}
          clock={clock}
          letter={letter}
          color={color}
        />
      ))}
    </View>
  );
}

/** Un texto que aparece palabra por palabra, enfocándose; vuelve a empezar cuando cambia. */
export function RevealText(props: RevealTextProps) {
  return <RevealLine key={props.text} {...props} />;
}

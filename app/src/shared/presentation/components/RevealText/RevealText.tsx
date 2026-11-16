import { View } from 'react-native';

import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { textStyle } from '@/shared/presentation/theme/textStyle';
import type { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { STAGGER_MS, WORD_MS } from './constants';
import { RevealWord } from './RevealWord';
import { styles } from './styles';
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
  } = props;
  const letter = textStyle(useTheme(), variant);
  const words = text.split(/\s+/).filter(Boolean);
  const clock = useRevealClock(words.length * STAGGER_MS + wordMs, hidden);

  return (
    // Para el lector de pantalla es una sola frase, no palabras sueltas.
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={text}
      style={[styles.line, styles[align]]}
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

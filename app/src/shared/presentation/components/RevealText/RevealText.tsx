import { View } from 'react-native';

import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { textStyle } from '@/shared/presentation/theme/textStyle';
import type { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { STAGGER_MS, WORD_MS } from './constants';
import { RevealWord } from './RevealWord';
import { styles } from './styles';
import { useRevealClock } from './useRevealClock';

type RevealTextProps = { text: string; variant: TextVariant; color: string };

function RevealLine({ text, variant, color }: RevealTextProps) {
  const letter = textStyle(useTheme(), variant);
  const words = text.split(/\s+/).filter(Boolean);
  const clock = useRevealClock(words.length * STAGGER_MS + WORD_MS);

  return (
    // Para el lector de pantalla es una sola frase, no palabras sueltas.
    <View accessible accessibilityRole="text" accessibilityLabel={text} style={styles.line}>
      {words.map((word, index) => (
        <RevealWord
          key={`${index}:${word}`}
          word={word}
          startsAt={index * STAGGER_MS}
          clock={clock}
          letter={letter}
          color={color}
        />
      ))}
    </View>
  );
}

/** El subtítulo: aparece palabra por palabra y vuelve a empezar cuando cambia el texto. */
export function RevealText(props: RevealTextProps) {
  return <RevealLine key={props.text} {...props} />;
}

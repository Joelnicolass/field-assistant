import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/shared/presentation/components/AppText';
import { useFadeOnChange } from '@/shared/presentation/hooks/useFadeOnChange';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { createStyles } from './styles';

type SummaryNotedProps = { text: string; anything: boolean };

/** Lo anotado hoy, como un aviso con un punto de color; se funde cuando cambia. */
export function SummaryNoted({ text, anything }: SummaryNotedProps) {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  const fade = useFadeOnChange(text);
  return (
    <Animated.View style={[styles.banner, anything ? styles.done : styles.pending, fade]}>
      <View style={[styles.dot, anything ? styles.doneDot : styles.pendingDot]} />
      <View style={styles.text}>
        <AppText variant={TextVariant.TileLabel} color={theme.colors.textSubtle}>
          {text}
        </AppText>
      </View>
    </Animated.View>
  );
}

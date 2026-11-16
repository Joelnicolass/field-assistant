import { View } from 'react-native';

import { AppText } from '@/shared/presentation/components/AppText';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { createStyles } from './styles';

type SummaryNotedProps = { text: string; anything: boolean };

/** Lo anotado hoy, como un aviso con un punto de color. */
export function SummaryNoted({ text, anything }: SummaryNotedProps) {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  return (
    <View style={[styles.banner, anything ? styles.done : styles.pending]}>
      <View style={[styles.dot, anything ? styles.doneDot : styles.pendingDot]} />
      <View style={styles.text}>
        <AppText variant={TextVariant.TileLabel} color={theme.colors.textSubtle}>
          {text}
        </AppText>
      </View>
    </View>
  );
}

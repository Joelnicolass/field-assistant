import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/shared/presentation/components/AppText';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import type { InfoCardRow } from '../types';
import { createStyles } from './styles';
import { useBarGrowth } from './useBarGrowth';

function ShareBar({ share, index }: { share: number; index: number }) {
  const styles = useStyles(createStyles);
  const fillStyle = useBarGrowth(share, index);
  return (
    <View style={styles.bar}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

export function CardRows({ rows }: { rows: InfoCardRow[] }) {
  const styles = useStyles(createStyles);
  const theme = useTheme();

  return (
    <View style={styles.rows}>
      {rows.map((row, index) => (
        <View key={row.key} style={styles.row}>
          <View style={styles.line}>
            <View style={styles.label}>
              <AppText variant={TextVariant.RowLabel} color={theme.colors.textMuted}>
                {row.label}
              </AppText>
            </View>
            <AppText variant={TextVariant.RowValue}>{row.value}</AppText>
          </View>
          {row.share === undefined ? null : <ShareBar share={row.share} index={index} />}
        </View>
      ))}
    </View>
  );
}

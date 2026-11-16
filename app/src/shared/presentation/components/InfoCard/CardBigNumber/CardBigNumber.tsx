import Animated from 'react-native-reanimated';

import { AppText } from '@/shared/presentation/components/AppText';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { popIn } from '../animations';
import { createStyles } from './styles';

type CardBigNumberProps = { value: string; unit: string };

export function CardBigNumber({ value, unit }: CardBigNumberProps) {
  const styles = useStyles(createStyles);
  const theme = useTheme();

  return (
    <Animated.View entering={popIn} style={styles.row}>
      <AppText variant={TextVariant.Display}>{value}</AppText>
      <AppText variant={TextVariant.DisplayUnit} color={theme.colors.textMuted}>
        {unit}
      </AppText>
    </Animated.View>
  );
}

import { Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/shared/presentation/components/AppText';
import { Icon, IconName } from '@/shared/presentation/components/Icon';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { GLYPH_COLOR } from '@/shared/presentation/theme/tokens';
import type { Tone } from '@/shared/presentation/theme/Tone';
import {
  BADGE_ENTERING,
  BADGE_ICON_SIZE,
  CLOSE_HIT_SLOP,
  CLOSE_ICON_SIZE,
  CLOSE_LABEL,
} from './constants';
import { createStyles } from './styles';

type CardHeaderProps = { icon: IconName; label: string; tone: Tone; onClose?: () => void };

export function CardHeader({ icon, label, tone, onClose }: CardHeaderProps) {
  const styles = useStyles(createStyles);
  const theme = useTheme();

  return (
    <View style={styles.header}>
      <Animated.View entering={BADGE_ENTERING[icon]} style={[styles.badge, styles[tone]]}>
        <Icon name={icon} size={BADGE_ICON_SIZE} color={GLYPH_COLOR} />
      </Animated.View>
      <View style={styles.label}>
        <AppText variant={TextVariant.Overline} color={theme.colors.textMuted}>
          {label}
        </AppText>
      </View>
      {onClose === undefined ? null : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={CLOSE_LABEL}
          hitSlop={CLOSE_HIT_SLOP}
          onPress={onClose}
          style={styles.close}
        >
          <Icon name={IconName.Close} size={CLOSE_ICON_SIZE} color={theme.colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

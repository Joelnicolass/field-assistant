import { Image, Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { AppText } from '@/shared/presentation/components/AppText';
import { Icon, IconName } from '@/shared/presentation/components/Icon';
import { ToggleChip } from '@/shared/presentation/components/ToggleChip';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { AppTitle } from '../AppTitle';
import {
  SETTINGS_LABEL,
  HANDS_FREE_LABEL,
  PENDING_IN_MS,
  PENDING_OUT_MS,
  PILL_ICON_SIZE,
  ROUND_HIT_SLOP,
  pendingLabel,
  SEND_NOW_HINT,
  SENDING_LABEL,
} from './constants';
import { createStyles } from './styles';

const LOGO = require('../../../../../../assets/images/logo.png');

type SummaryHeaderProps = {
  place: string;
  pendingCount: number;
  sending: boolean;
  /** Tocar la píldora de pendientes los reintenta en el momento. */
  onPendingPress: () => void;
  handsFree: boolean;
  onHandsFreeChange: (value: boolean) => void;
  onOpenSettings: () => void;
};

export function SummaryHeader(props: SummaryHeaderProps) {
  const { place, pendingCount, sending, onPendingPress, onOpenSettings } = props;
  const { handsFree, onHandsFreeChange } = props;
  const styles = useStyles(createStyles);
  const theme = useTheme();

  return (
    <View style={styles.header}>
      <Image source={LOGO} style={styles.logo} accessibilityIgnoresInvertColors />
      <View style={styles.names}>
        <AppTitle />
        <AppText variant={TextVariant.Place} color={theme.colors.textSubtle}>
          {place}
        </AppText>
      </View>
      <View style={styles.pills}>
        <View style={styles.icons}>
          <ToggleChip
            label={HANDS_FREE_LABEL}
            value={handsFree}
            onChange={onHandsFreeChange}
            icon={IconName.Microphone}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={SETTINGS_LABEL}
            onPress={onOpenSettings}
            hitSlop={ROUND_HIT_SLOP}
            style={[styles.pill, styles.round]}
          >
            <Icon name={IconName.Settings} size={PILL_ICON_SIZE} color={theme.colors.textMuted} />
          </Pressable>
        </View>
        {pendingCount === 0 ? null : (
          <Animated.View
            entering={FadeIn.duration(PENDING_IN_MS)}
            exiting={FadeOut.duration(PENDING_OUT_MS)}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={pendingLabel(pendingCount)}
              accessibilityHint={SEND_NOW_HINT}
              accessibilityState={{ busy: sending }}
              disabled={sending}
              onPress={onPendingPress}
              style={[styles.pill, styles.pending]}
            >
              <Icon name={IconName.Offline} size={PILL_ICON_SIZE} color={theme.colors.warning} />
              <AppText variant={TextVariant.Pill} color={theme.colors.warning}>
                {sending ? SENDING_LABEL : pendingLabel(pendingCount)}
              </AppText>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

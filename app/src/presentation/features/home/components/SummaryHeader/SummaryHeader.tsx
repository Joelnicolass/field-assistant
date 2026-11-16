import { Image, Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { AppText } from '@/shared/presentation/components/AppText';
import { Icon, IconName } from '@/shared/presentation/components/Icon';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { AppTitle } from '../AppTitle';
import {
  CATALOG_LABEL,
  PENDING_IN_MS,
  PENDING_OUT_MS,
  PILL_ICON_SIZE,
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
  onOpenCatalog: () => void;
};

export function SummaryHeader(props: SummaryHeaderProps) {
  const { place, pendingCount, sending, onPendingPress, onOpenCatalog } = props;
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={CATALOG_LABEL}
          onPress={onOpenCatalog}
          style={styles.pill}
        >
          <AppText variant={TextVariant.Pill} color={theme.colors.textMuted}>
            {CATALOG_LABEL}
          </AppText>
        </Pressable>
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

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
} from './constants';
import { createStyles } from './styles';

const LOGO = require('../../../../../../assets/images/logo.png');

type SummaryHeaderProps = {
  place: string;
  pendingCount: number;
  onOpenCatalog: () => void;
};

export function SummaryHeader({ place, pendingCount, onOpenCatalog }: SummaryHeaderProps) {
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
            style={[styles.pill, styles.pending]}
          >
            <Icon name={IconName.Offline} size={PILL_ICON_SIZE} color={theme.colors.warning} />
            <AppText variant={TextVariant.Pill} color={theme.colors.warning}>
              {pendingLabel(pendingCount)}
            </AppText>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

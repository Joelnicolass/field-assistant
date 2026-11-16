import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { AppText } from '@/shared/presentation/components/AppText';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import type { SummaryLot } from '../../hooks/todaySummaryView';
import { PANEL_IN_MS, PANEL_OUT_MS, TITLE } from './constants';
import { createStyles } from './styles';

/** Una barra por lote, tan alta como las cabezas que tiene respecto del lote más grande. */
export function SummaryLots({ lots, activeLots }: { lots: SummaryLot[]; activeLots: string }) {
  const styles = useStyles(createStyles);
  const theme = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(PANEL_IN_MS)}
      exiting={FadeOut.duration(PANEL_OUT_MS)}
      style={styles.panel}
    >
      <View style={styles.heading}>
        <AppText variant={TextVariant.Noted}>{TITLE}</AppText>
        <View style={styles.chip}>
          <AppText variant={TextVariant.Pill} color={theme.colors.textMuted}>
            {activeLots}
          </AppText>
        </View>
      </View>
      <View style={styles.lots}>
        {lots.map((lot) => (
          <View key={lot.key} style={styles.lot}>
            <View style={styles.track}>
              <View style={[styles.fill, { height: `${lot.share * 100}%` }]} />
            </View>
            <AppText
              variant={TextVariant.LotHead}
              color={lot.empty ? theme.colors.textMuted : theme.colors.text}
            >
              {lot.heads}
            </AppText>
            <AppText variant={TextVariant.LotName} color={theme.colors.textMuted}>
              {lot.name}
            </AppText>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

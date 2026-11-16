import { Fragment } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { AppText } from '@/shared/presentation/components/AppText';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import type { SummaryTile } from '../../hooks/todaySummaryView';
import { PANEL_IN_MS, PANEL_OUT_MS } from './constants';
import { createStyles } from './styles';

function TileText({ tile }: { tile: SummaryTile }) {
  const theme = useTheme();
  const styles = useStyles(createStyles);
  return (
    <>
      <View style={styles.value}>
        <AppText variant={TextVariant.TileValue}>{tile.value}</AppText>
        {tile.unit === undefined ? null : (
          <AppText variant={TextVariant.RowLabel} color={theme.colors.textMuted}>
            {tile.unit}
          </AppText>
        )}
      </View>
      <AppText variant={TextVariant.TileLabel} color={theme.colors.textMuted} numberOfLines={2}>
        {tile.label}
        {tile.labelStrong === undefined ? null : (
          <AppText variant={TextVariant.TileLabel}>{tile.labelStrong}</AppText>
        )}
      </AppText>
    </>
  );
}

/** Los tres datos: un panel con columnas o, con una tarjeta en pantalla, tres cuadros sueltos. */
export function SummaryData({ tiles, compact }: { tiles: SummaryTile[]; compact: boolean }) {
  const styles = useStyles(createStyles);
  const fade = { entering: FadeIn.duration(PANEL_IN_MS), exiting: FadeOut.duration(PANEL_OUT_MS) };

  if (compact) {
    return (
      <Animated.View key="tiles" {...fade} style={styles.tiles}>
        {tiles.map((tile) => (
          <View key={tile.key} style={styles.tile}>
            <TileText tile={tile} />
          </View>
        ))}
      </Animated.View>
    );
  }
  return (
    <Animated.View key="panel" {...fade} style={styles.panel}>
      {tiles.map((tile, index) => (
        <Fragment key={tile.key}>
          {index === 0 ? null : <View style={styles.divider} />}
          <View style={styles.column}>
            <TileText tile={tile} />
          </View>
        </Fragment>
      ))}
    </Animated.View>
  );
}

import { useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '@/shared/presentation/components/AppText';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { ARC_BASE, ARC_DASH, ARC_HEIGHT, ARC_STROKE, LOT_TAG, PATH_HEIGHT } from './constants';
import { createStyles } from './styles';
import { useTravelingDot } from './useTravelingDot';

type CardRouteProps = { from: string; to: string };

function LotChip({ lot }: { lot: string }) {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  return (
    <View style={styles.chip}>
      <AppText variant={TextVariant.LotTag} color={theme.colors.textMuted}>
        {LOT_TAG}
      </AppText>
      <AppText variant={TextVariant.LotNumber}>{lot}</AppText>
    </View>
  );
}

export function CardRoute({ from, to }: CardRouteProps) {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const dotStyle = useTravelingDot(width);

  return (
    <View style={styles.route}>
      <LotChip lot={from} />
      <View style={styles.path} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        <Svg width={width} height={PATH_HEIGHT}>
          <Path
            d={`M0 ${ARC_BASE} Q${width / 2} ${ARC_BASE - 2 * ARC_HEIGHT} ${width} ${ARC_BASE}`}
            stroke={theme.colors.brand}
            strokeWidth={ARC_STROKE}
            strokeLinecap="round"
            strokeDasharray={ARC_DASH}
            fill="none"
          />
        </Svg>
        <Animated.View style={[styles.dot, dotStyle]} />
      </View>
      <LotChip lot={to} />
    </View>
  );
}

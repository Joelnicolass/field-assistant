import Animated from 'react-native-reanimated';

import { AppText } from '@/shared/presentation/components/AppText';
import { Surface } from '@/shared/presentation/components/Surface';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { cardIn, cardOut, PART_IN } from './animations';
import { CardBigNumber } from './CardBigNumber';
import { CardButtons } from './CardButtons';
import { CardExamples } from './CardExamples';
import { CardHeader } from './CardHeader';
import { CardHeard } from './CardHeard';
import { CardRoute } from './CardRoute';
import { CardRows } from './CardRows';
import { createStyles } from './styles';
import type { InfoCardProps } from './types';

// Cada bloque se dibuja si su dato está; ninguno pregunta qué tarjeta es.
export function InfoCard(props: InfoCardProps) {
  const { icon, label, tone, big, message, hint, route, rows, examples, buttons, heard, onClose } =
    props;
  const styles = useStyles(createStyles);
  const theme = useTheme();

  return (
    <Animated.View entering={cardIn} exiting={cardOut}>
      <Surface tone={tone}>
        <Animated.View entering={PART_IN[0]} style={styles.header}>
          <CardHeader icon={icon} label={label} tone={tone} onClose={onClose} />
        </Animated.View>
        {big === undefined ? null : <CardBigNumber value={big.value} unit={big.unit} />}
        {message === undefined ? null : (
          <Animated.View entering={PART_IN[1]}>
            <AppText variant={TextVariant.Message}>{message}</AppText>
          </Animated.View>
        )}
        {route === undefined ? null : (
          <Animated.View entering={PART_IN[2]}>
            <CardRoute from={route.from} to={route.to} />
          </Animated.View>
        )}
        {hint === undefined ? null : (
          <Animated.View entering={PART_IN[2]}>
            <AppText variant={TextVariant.Hint} color={theme.colors.textMuted}>
              {hint}
            </AppText>
          </Animated.View>
        )}
        {examples === undefined ? null : (
          <Animated.View entering={PART_IN[3]}>
            <CardExamples examples={examples} />
          </Animated.View>
        )}
        {rows === undefined ? null : (
          <Animated.View entering={PART_IN[3]}>
            <CardRows rows={rows} />
          </Animated.View>
        )}
        {buttons === undefined ? null : (
          <Animated.View entering={PART_IN[4]}>
            <CardButtons buttons={buttons} />
          </Animated.View>
        )}
        {heard === undefined ? null : (
          <Animated.View entering={PART_IN[5]}>
            <CardHeard heard={heard} />
          </Animated.View>
        )}
      </Surface>
    </Animated.View>
  );
}

import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/shared/presentation/components/AppText';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import type { ButtonVariant } from './ButtonVariant';
import { createStyles } from './styles';
import type { Countdown } from './types';
import { useCountdownFill } from './useCountdownFill';
import { usePressScale } from './usePressScale';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type AppButtonProps = {
  label: string;
  variant: ButtonVariant;
  onPress: () => void;
  countdown?: Countdown;
};

export function AppButton({ label, variant, onPress, countdown }: AppButtonProps) {
  const styles = useStyles(createStyles);
  const press = usePressScale();
  const fillStyle = useCountdownFill(countdown);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      style={[styles.button, styles[variant], press.style]}
    >
      {countdown === undefined ? null : <Animated.View style={[styles.fill, fillStyle]} />}
      <AppText variant={TextVariant.Button} color={styles.labelColor[variant]}>
        {label}
      </AppText>
    </AnimatedPressable>
  );
}

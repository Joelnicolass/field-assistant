import { View } from 'react-native';

import { AppButton, ButtonVariant } from '@/shared/presentation/components/AppButton';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useCountdownDemo } from '../../hooks/useCountdownDemo';
import { COUNTDOWN_MS, LABEL } from './constants';
import { createStyles } from './styles';

function doNothing() {}

export function CatalogButtons() {
  const styles = useStyles(createStyles);
  const demo = useCountdownDemo();

  return (
    <View style={styles.buttons}>
      <AppButton label={LABEL.primary} variant={ButtonVariant.Primary} onPress={doNothing} />
      <AppButton label={LABEL.secondary} variant={ButtonVariant.Secondary} onPress={doNothing} />
      <AppButton
        key={demo.run}
        label={LABEL.primary}
        variant={ButtonVariant.Primary}
        onPress={doNothing}
        countdown={{ durationMs: COUNTDOWN_MS, paused: demo.paused }}
      />
      <AppButton
        label={demo.paused ? LABEL.resume : LABEL.pause}
        variant={ButtonVariant.Secondary}
        onPress={demo.togglePaused}
      />
      <AppButton label={LABEL.restart} variant={ButtonVariant.Secondary} onPress={demo.restart} />
    </View>
  );
}

import { View } from 'react-native';

import { AppButton, ButtonVariant } from '@/shared/presentation/components/AppButton';
import { AppText } from '@/shared/presentation/components/AppText';
import { Orb, OrbState } from '@/shared/presentation/components/Orb';
import { RevealText } from '@/shared/presentation/components/RevealText';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { useOrbDemo } from '../../hooks/useOrbDemo';
import { LEVELS, ORB_LABEL, STATE_LABEL, STATUS_TEXT, SUBTITLE } from './constants';
import { createStyles } from './styles';

function doNothing() {}

export function CatalogOrb() {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  const demo = useOrbDemo();
  const variantFor = (selected: boolean) =>
    selected ? ButtonVariant.Primary : ButtonVariant.Secondary;
  const statusColor =
    demo.state === OrbState.Listening ? theme.colors.danger : theme.colors.textMuted;

  return (
    <View style={styles.section}>
      <View style={styles.options}>
        {Object.values(OrbState).map((state) => (
          <AppButton
            key={state}
            label={STATE_LABEL[state]}
            variant={variantFor(state === demo.state)}
            onPress={() => demo.setState(state)}
          />
        ))}
      </View>
      <View style={styles.options}>
        {LEVELS.map((level) => (
          <AppButton
            key={level.value}
            label={level.label}
            variant={variantFor(level.value === demo.level)}
            onPress={() => demo.setLevel(level.value)}
          />
        ))}
      </View>
      <RevealText
        text={SUBTITLE[demo.state]}
        variant={TextVariant.Subtitle}
        color={theme.colors.text}
      />
      <View style={styles.stage}>
        <Orb
          state={demo.state}
          level={demo.level}
          size={theme.touch.primary}
          onPress={doNothing}
          accessibilityLabel={ORB_LABEL}
        />
      </View>
      <View style={styles.status}>
        <AppText variant={TextVariant.Status} color={statusColor}>
          {STATUS_TEXT[demo.state]}
        </AppText>
      </View>
    </View>
  );
}

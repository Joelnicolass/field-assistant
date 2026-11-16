import { View } from 'react-native';

import { AppButton, ButtonVariant } from '@/shared/presentation/components/AppButton';
import { AppText } from '@/shared/presentation/components/AppText';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { useVoiceCheck } from '../../hooks/useVoiceCheck';
import { HEARD, LABEL } from './constants';
import { createStyles } from './styles';

export function CatalogVoiceCheck() {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  const check = useVoiceCheck();

  return (
    <View style={styles.section}>
      <AppButton
        label={check.speaking ? LABEL.speaking : LABEL.speak}
        variant={ButtonVariant.Primary}
        onPress={check.speak}
      />
      <AppButton
        label={check.recording ? LABEL.stop : LABEL.record}
        variant={ButtonVariant.Secondary}
        onPress={check.toggleRecording}
      />
      <View style={styles.meter}>
        <View style={[styles.fill, { width: `${check.level * 100}%` }]} />
      </View>
      {check.heardVoice === null ? null : (
        <AppText variant={TextVariant.Hint} color={theme.colors.textMuted}>
          {check.heardVoice ? HEARD.yes : HEARD.no}
        </AppText>
      )}
    </View>
  );
}

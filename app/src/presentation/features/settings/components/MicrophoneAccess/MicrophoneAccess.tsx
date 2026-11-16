import { View } from 'react-native';

import { MicrophonePermission } from '@/domain/enums/MicrophonePermission';
import { AppButton, ButtonVariant } from '@/shared/presentation/components/AppButton';
import { AppText } from '@/shared/presentation/components/AppText';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { useMicrophoneAccess } from '../../hooks/useMicrophoneAccess';
import { ACCESS_TEXT, PERMISSION_TEXT } from './constants';
import { createStyles } from './styles';

/** El permiso del micrófono: cómo está y, si falta, cómo darlo. */
export function MicrophoneAccess() {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  const { permission, fix } = useMicrophoneAccess();
  if (permission === null) {
    return null;
  }
  const { state, action } = PERMISSION_TEXT[permission];
  const granted = permission === MicrophonePermission.Granted;

  return (
    <View style={styles.panel}>
      <AppText variant={TextVariant.Noted}>{ACCESS_TEXT.title}</AppText>
      <View style={styles.row}>
        <AppText variant={TextVariant.RowLabel}>{ACCESS_TEXT.microphone}</AppText>
        <AppText
          variant={TextVariant.RowValue}
          color={granted ? theme.colors.brand : theme.colors.danger}
        >
          {state}
        </AppText>
      </View>
      <AppText variant={TextVariant.Hint} color={theme.colors.textMuted}>
        {ACCESS_TEXT.explain}
      </AppText>
      {action === null ? null : (
        <AppButton label={action} variant={ButtonVariant.Primary} onPress={fix} />
      )}
    </View>
  );
}

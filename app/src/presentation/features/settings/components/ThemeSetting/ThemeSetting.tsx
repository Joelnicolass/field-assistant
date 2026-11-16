import { View } from 'react-native';

import { AppText } from '@/shared/presentation/components/AppText';
import { ToggleChip } from '@/shared/presentation/components/ToggleChip';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { useUserSettings } from '../../hooks/useUserSettings';
import { SETTINGS_TEXT } from '../SettingsScreen/constants';
import { createStyles } from './styles';

/** El cambio de tema automático según la luz: encendido por defecto. */
export function ThemeSetting() {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  const { settings, update } = useUserSettings();

  return (
    <View style={styles.panel}>
      <View style={styles.row}>
        <AppText variant={TextVariant.Noted}>{SETTINGS_TEXT.theme}</AppText>
        <ToggleChip
          label={SETTINGS_TEXT.autoTheme}
          value={settings?.autoTheme ?? true}
          onChange={(autoTheme) => void update({ autoTheme })}
        />
      </View>
      <AppText variant={TextVariant.Hint} color={theme.colors.textMuted}>
        {SETTINGS_TEXT.autoThemeHint}
      </AppText>
    </View>
  );
}

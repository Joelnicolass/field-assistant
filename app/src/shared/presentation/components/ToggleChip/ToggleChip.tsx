import { Pressable } from 'react-native';

import { AppText } from '@/shared/presentation/components/AppText';
import { Icon, IconName } from '@/shared/presentation/components/Icon';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { ICON_SIZE } from './constants';
import { createStyles } from './styles';

type ToggleChipProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

/** Una píldora que se prende y se apaga: encendida va en el color de la marca. */
export function ToggleChip({ label, value, onChange }: ToggleChipProps) {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  const color = value ? theme.colors.onBrand : theme.colors.textMuted;

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={[styles.chip, value ? styles.on : styles.off]}
    >
      <Icon name={IconName.Microphone} size={ICON_SIZE} color={color} />
      <AppText variant={TextVariant.Pill} color={color}>
        {label}
      </AppText>
    </Pressable>
  );
}

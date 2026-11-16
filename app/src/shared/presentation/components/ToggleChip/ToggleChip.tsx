import { Pressable } from 'react-native';

import { AppText } from '@/shared/presentation/components/AppText';
import { Icon, IconName } from '@/shared/presentation/components/Icon';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { ICON_SIZE, ROUND_HIT_SLOP } from './constants';
import { createStyles } from './styles';

type ToggleChipProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  /** Con ícono se ve solo el ícono, en una píldora redonda, y el texto queda para el lector de pantalla. */
  icon?: IconName;
};

/** Una píldora que se prende y se apaga: encendida va en el color de la marca. */
export function ToggleChip({ label, value, onChange, icon }: ToggleChipProps) {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  const color = value ? theme.colors.onBrand : theme.colors.textMuted;

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      hitSlop={icon === undefined ? undefined : ROUND_HIT_SLOP}
      style={[
        styles.chip,
        icon === undefined ? null : styles.round,
        value ? styles.on : styles.off,
      ]}
    >
      {icon === undefined ? (
        <AppText variant={TextVariant.Pill} color={color}>
          {label}
        </AppText>
      ) : (
        <Icon name={icon} size={ICON_SIZE} color={color} />
      )}
    </Pressable>
  );
}

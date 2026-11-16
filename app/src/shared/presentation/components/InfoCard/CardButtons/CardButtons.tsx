import { View } from 'react-native';

import { AppButton } from '@/shared/presentation/components/AppButton';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import type { InfoCardButton } from '../types';
import { createStyles } from './styles';

export function CardButtons({ buttons }: { buttons: InfoCardButton[] }) {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.buttons}>
      {buttons.map(({ key, variant, ...button }) => (
        <View key={key} style={styles[variant]}>
          <AppButton variant={variant} {...button} />
        </View>
      ))}
    </View>
  );
}

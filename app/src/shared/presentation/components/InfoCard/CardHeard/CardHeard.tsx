import { View } from 'react-native';

import { AppText } from '@/shared/presentation/components/AppText';
import { Icon, IconName } from '@/shared/presentation/components/Icon';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { MICROPHONE_SIZE } from './constants';
import { createStyles } from './styles';

export function CardHeard({ heard }: { heard: string }) {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  return (
    <View style={styles.heard}>
      <Icon name={IconName.Microphone} size={MICROPHONE_SIZE} color={theme.colors.textMuted} />
      <View style={styles.text}>
        <AppText variant={TextVariant.Heard} color={theme.colors.textMuted}>
          {`«${heard}»`}
        </AppText>
      </View>
    </View>
  );
}

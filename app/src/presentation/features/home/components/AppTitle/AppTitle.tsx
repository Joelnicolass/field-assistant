import { View } from 'react-native';

import { AppText } from '@/shared/presentation/components/AppText';
import { RevealText } from '@/shared/presentation/components/RevealText';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { TITLE_FIRST_WORD, TITLE_WORD_MS } from '../../states/titlePhases';
import { useAppTitle } from '../../hooks/useAppTitle';
import { createStyles } from './styles';

export function AppTitle() {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  const { word, leaving } = useAppTitle();

  return (
    <View style={styles.title}>
      <AppText variant={TextVariant.Title}>{TITLE_FIRST_WORD}</AppText>
      <RevealText
        text={word}
        variant={TextVariant.Title}
        color={theme.colors.text}
        hidden={leaving}
        align="start"
        wordMs={TITLE_WORD_MS}
        still
      />
    </View>
  );
}

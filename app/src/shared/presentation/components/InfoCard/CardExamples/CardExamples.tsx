import { View } from 'react-native';

import { AppText } from '@/shared/presentation/components/AppText';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { createStyles } from './styles';

export function CardExamples({ examples }: { examples: string[] }) {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.examples}>
      {examples.map((example) => (
        <View key={example} style={styles.chip}>
          <AppText variant={TextVariant.Example}>{`«${example}»`}</AppText>
        </View>
      ))}
    </View>
  );
}

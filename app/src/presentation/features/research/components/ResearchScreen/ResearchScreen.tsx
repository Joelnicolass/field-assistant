import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useResearchChecks } from '../../hooks/useResearchChecks';
import { TITLE } from './constants';
import { styles } from './styles';

export function ResearchScreen() {
  const { emptyText } = useResearchChecks();

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>{TITLE}</Text>
      {emptyText !== null && <Text>{emptyText}</Text>}
    </SafeAreaView>
  );
}

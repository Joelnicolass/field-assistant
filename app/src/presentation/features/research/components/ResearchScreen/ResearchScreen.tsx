import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useResearchChecks } from '../../hooks/useResearchChecks';
import { SERVER_URL_LABEL, TITLE } from './constants';
import { styles } from './styles';

export function ResearchScreen() {
  const { emptyText, serverUrl } = useResearchChecks();

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>{TITLE}</Text>
      <Text>
        {SERVER_URL_LABEL} {serverUrl}
      </Text>
      {emptyText !== null && <Text>{emptyText}</Text>}
    </SafeAreaView>
  );
}

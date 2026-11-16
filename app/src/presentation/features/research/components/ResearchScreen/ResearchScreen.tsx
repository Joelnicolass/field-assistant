import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useResearchChecks } from '../../hooks/useResearchChecks';
import { AnimationCheck } from '../AnimationCheck';
import { CheckCard } from '../CheckCard';
import { DrawingCheck } from '../DrawingCheck';
import { SERVER_URL_LABEL, TITLE } from './constants';
import { styles } from './styles';

export function ResearchScreen() {
  const { checks, serverUrl } = useResearchChecks();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{TITLE}</Text>
        <Text>
          {SERVER_URL_LABEL} {serverUrl}
        </Text>
        {checks.map((check) => (
          <CheckCard key={check.key} title={check.title} view={check.view} />
        ))}
        <DrawingCheck />
        <AnimationCheck />
      </ScrollView>
    </SafeAreaView>
  );
}

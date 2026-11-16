import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootScreen } from '@/core/configs/RootScreen';
import type { RootStackParamList } from '@/presentation/navigation/RootStackParamList';
import { VoiceStage } from '@/presentation/features/voice/components/VoiceStage';
import { useVoiceStage } from '@/presentation/features/voice/hooks/useVoiceStage';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTodaySummary } from '../../hooks/useTodaySummary';
import { TodaySummaryPanel } from '../TodaySummaryPanel';
import { createStyles } from './styles';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, RootScreen.Home>;

export function HomeScreen({ navigation }: HomeScreenProps) {
  const styles = useStyles(createStyles);
  const { summary, refresh } = useTodaySummary();
  // Lo que la voz anota actualiza el resumen: la conexión entre las dos features se ve acá.
  const voice = useVoiceStage({ onRecorded: refresh });

  return (
    // Abajo el margen seguro lo maneja la zona de voz, que se apoya sobre él.
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      {summary === null ? null : (
        <TodaySummaryPanel
          summary={summary}
          compact={voice.cards.length > 0}
          dimmed={voice.busy}
          pendingCount={voice.pendingCount}
          sending={voice.sending}
          onOpenCatalog={() => navigation.navigate(RootScreen.Catalog)}
        />
      )}
      <VoiceStage view={voice} />
    </SafeAreaView>
  );
}

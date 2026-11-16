import { SafeAreaView } from 'react-native-safe-area-context';

import { RootScreen, type RootScreenProps } from '@/core/configs/RootScreen';
import { VoiceStage } from '@/presentation/features/voice/components/VoiceStage';
import { useVoiceStage } from '@/presentation/features/voice/hooks/useVoiceStage';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTodaySummary } from '../../hooks/useTodaySummary';
import { TodaySummaryPanel } from '../TodaySummaryPanel';
import { createStyles } from './styles';

export function HomeScreen({ onNavigate }: RootScreenProps) {
  const styles = useStyles(createStyles);
  const summary = useTodaySummary();
  const voice = useVoiceStage();

  return (
    // Abajo el margen seguro lo maneja la zona de voz, que se apoya sobre él.
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      {summary === null ? null : (
        <TodaySummaryPanel
          summary={summary}
          compact={voice.cards.length > 0}
          dimmed={voice.busy}
          pendingCount={voice.pendingCount}
          onOpenCatalog={() => onNavigate(RootScreen.Catalog)}
        />
      )}
      <VoiceStage view={voice} />
    </SafeAreaView>
  );
}

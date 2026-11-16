import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootScreen } from '@/core/configs/RootScreen';
import { settings } from '@/core/configs/settings';
import type { RootStackParamList } from '@/presentation/navigation/RootStackParamList';
import {
  VoiceStage,
  type VoiceStageIntro,
} from '@/presentation/features/voice/components/VoiceStage';
import { useVoiceStage } from '@/presentation/features/voice/hooks/useVoiceStage';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTodaySummary } from '../../hooks/useTodaySummary';
import { SummaryBlur } from '../SummaryBlur';
import { TodaySummaryPanel } from '../TodaySummaryPanel';
import { createStyles } from './styles';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, RootScreen.Home>;

/**
 * La entrada del logo al abrir: el splash se quita cuando el orbe ya está dibujado en su primer
 * cuadro, y el resumen aparece cuando termina. Sin entrada, el splash se quita al cargar.
 */
function useOpening(loaded: boolean) {
  const [revealed, setRevealed] = useState(!settings.logoIntro);
  useEffect(() => {
    if (loaded && !settings.logoIntro) {
      SplashScreen.hide();
    }
  }, [loaded]);
  const intro: VoiceStageIntro | undefined = settings.logoIntro
    ? { onReady: SplashScreen.hide, onReveal: () => setRevealed(true) }
    : undefined;
  return { revealed, intro };
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const styles = useStyles(createStyles);
  const { summary, refresh } = useTodaySummary();
  // Lo que la voz anota actualiza el resumen: la conexión entre las dos features se ve acá.
  const voice = useVoiceStage({ onRecorded: refresh, covered: !useIsFocused() });
  const withCards = voice.cards.length > 0;
  const opening = useOpening(summary !== null);

  // Hasta tener el resumen, el splash sigue a la vista: así el escenario se mide una sola vez.
  if (summary === null) {
    return <SafeAreaView style={styles.screen} />;
  }

  return (
    // Abajo el margen seguro lo maneja la zona de voz, que se apoya sobre él.
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <SummaryBlur blurred={withCards}>
        <TodaySummaryPanel
          summary={summary}
          compact={false}
          dimmed={voice.busy}
          hidden={!opening.revealed}
          pendingCount={voice.pendingCount}
          sending={voice.sending}
          onPendingPress={voice.onPendingPress}
          handsFree={voice.handsFree}
          onHandsFreeChange={voice.onHandsFreeChange}
          onOpenSettings={() => navigation.navigate(RootScreen.Settings)}
        />
      </SummaryBlur>
      <VoiceStage view={voice} intro={opening.intro} />
    </SafeAreaView>
  );
}

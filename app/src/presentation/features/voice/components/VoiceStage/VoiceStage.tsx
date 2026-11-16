import { ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/shared/presentation/components/AppText';
import { InfoCard } from '@/shared/presentation/components/InfoCard';
import { Orb, OrbState } from '@/shared/presentation/components/Orb';
import { RevealText } from '@/shared/presentation/components/RevealText';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import type { ThemeColors } from '@/shared/presentation/theme/Theme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import type { VoiceStageView } from '../../hooks/useVoiceStage';
import { createStyles } from './styles';
import { useStageMotion } from './useStageMotion';

// Escuchando, el estado va en rojo para que se note que el micrófono está abierto (VISUAL 5.3).
const STATUS_COLOR: Record<OrbState, keyof ThemeColors> = {
  [OrbState.Idle]: 'textMuted',
  [OrbState.Listening]: 'danger',
  [OrbState.Thinking]: 'textMuted',
  [OrbState.Speaking]: 'textMuted',
};

// En reposo el subtítulo es una invitación, más suave; lo que dice la app va en `text`.
const SUBTITLE_COLOR: Record<OrbState, keyof ThemeColors> = {
  [OrbState.Idle]: 'textMuted',
  [OrbState.Listening]: 'text',
  [OrbState.Thinking]: 'text',
  [OrbState.Speaking]: 'text',
};

export function VoiceStage({ view }: { view: VoiceStageView }) {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();
  const stage = useStageMotion(view.cards.length > 0, bottom);

  return (
    <View style={styles.stage} onLayout={stage.onStageLayout}>
      <ScrollView
        style={[styles.cards, { bottom: stage.bottomGap + styles.voice.height }]}
        contentContainerStyle={styles.cardsContent}
        showsVerticalScrollIndicator={false}
      >
        {view.cards.map(({ key, ...card }) => (
          <InfoCard key={key} {...card} />
        ))}
      </ScrollView>

      <Animated.View
        pointerEvents="box-none"
        style={[styles.voice, { bottom: stage.bottomGap }, stage.voiceStyle]}
      >
        <Animated.View style={[styles.subtitle, stage.subtitleStyle]}>
          <RevealText
            text={view.subtitle}
            variant={TextVariant.Subtitle}
            color={theme.colors[SUBTITLE_COLOR[view.orbState]]}
          />
        </Animated.View>
        <Animated.View style={[styles.slot, stage.orbStyle]}>
          <Orb
            state={view.orbState}
            level={view.level}
            size={theme.touch.primary}
            onPress={view.onOrbPress}
            accessibilityLabel={view.statusText}
          />
        </Animated.View>
        <Animated.View style={[styles.status, stage.statusStyle]}>
          <AppText variant={TextVariant.Status} color={theme.colors[STATUS_COLOR[view.orbState]]}>
            {view.statusText}
          </AppText>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

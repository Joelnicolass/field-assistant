import { useEffect, useEffectEvent, useRef } from 'react';
import { View, type ScrollViewInstance } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/shared/presentation/components/AppText';
import { InfoCard } from '@/shared/presentation/components/InfoCard';
import { useLogoIntro } from '@/shared/presentation/components/LogoIntro';
import { Orb, OrbState } from '@/shared/presentation/components/Orb';
import { RevealText } from '@/shared/presentation/components/RevealText';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import type { ThemeColors } from '@/shared/presentation/theme/Theme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import type { VoiceStageView } from '../../hooks/useVoiceStage';
import { statusIn } from './animations';
import { STAGE } from './constants';
import { EdgeFade } from './EdgeFade';
import { createStyles } from './styles';
import { useScrollFades } from './useScrollFades';
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

/** La entrada del logo, si la pantalla la quiere: avisa cuando está lista y cuando se revela. */
export type VoiceStageIntro = {
  /** El primer cuadro ya está dibujado en su lugar: se puede esconder el splash. */
  onReady: () => void;
  /** Terminó la entrada: aparece el resto de la pantalla. */
  onReveal: () => void;
};

type VoiceStageProps = { view: VoiceStageView; intro?: VoiceStageIntro };

/** El orbe con su entrada; avisa una sola vez cuando el primer cuadro ya está en su lugar. */
function useStageIntro(
  intro: VoiceStageIntro | undefined,
  size: number,
  bottom: number,
  docked: boolean,
) {
  const stage = useStageMotion(docked, bottom, intro !== undefined);
  const ready = useEffectEvent(() => intro?.onReady());
  useEffect(() => {
    if (stage.measured) {
      ready();
    }
  }, [stage.measured]);
  const orbIntro = useLogoIntro({
    size,
    enabled: intro !== undefined,
    ready: stage.measured,
    onEnd: () => {
      stage.onIntroEnd();
      intro?.onReveal();
    },
  });
  return { stage, orbIntro };
}

export function VoiceStage({ view, intro }: VoiceStageProps) {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const { stage, orbIntro } = useStageIntro(
    intro,
    theme.touch.primary,
    bottom,
    view.cards.length > 0,
  );
  // Con la entrada, el texto, el estado y las tarjetas esperan a que el orbe aterrice.
  const shown = stage.landed ? styles.visible : styles.hidden;
  const cardsRef = useRef<ScrollViewInstance>(null);
  const fades = useScrollFades();

  return (
    <View style={styles.stage} onLayout={stage.onStageLayout}>
      {/* Cuando llega una tarjeta, la lista baja hasta ella: la más nueva queda junto al orbe. */}
      <View
        // Sin tarjetas no tapa nada: el resumen de abajo se sigue pudiendo tocar.
        pointerEvents={stage.landed && view.cards.length > 0 ? 'auto' : 'none'}
        style={[
          styles.cards,
          // Las tarjetas suben por encima del resumen, que queda desenfocado de fondo: ocupan
          // todo el alto, desde abajo de la barra de estado hasta la zona de voz.
          { top: top - stage.stageTop, bottom: stage.bottomGap + styles.voice.height },
          shown,
        ]}
      >
        <Animated.ScrollView
          ref={cardsRef}
          onContentSizeChange={() => cardsRef.current?.scrollToEnd({ animated: true })}
          onScroll={fades.onScroll}
          contentContainerStyle={styles.cardsContent}
          showsVerticalScrollIndicator={false}
        >
          {view.cards.map(({ key, ...card }) => (
            <InfoCard key={key} {...card} />
          ))}
        </Animated.ScrollView>
        {/* Los bordes se funden cuando hay más tarjetas para recorrer de ese lado. */}
        <EdgeFade edge="top" visible={fades.top} />
        <EdgeFade edge="bottom" visible={fades.bottom} />
      </View>

      <Animated.View
        pointerEvents="box-none"
        style={[styles.voice, { bottom: stage.bottomGap }, stage.voiceStyle]}
      >
        {/* El texto y el estado se montan cuando el orbe aterriza: así entran con su animación. */}
        <Animated.View style={[styles.subtitle, stage.subtitleStyle]}>
          {stage.landed ? (
            <RevealText
              text={view.subtitle}
              variant={TextVariant.Subtitle}
              color={theme.colors[SUBTITLE_COLOR[view.orbState]]}
              // Con tarjetas el orbe está abajo y el subtítulo tiene todo su alto.
              maxHeight={view.cards.length > 0 ? STAGE.subtitleHeight : stage.subtitleRoom}
            />
          ) : null}
        </Animated.View>
        <Animated.View style={[styles.slot, stage.orbStyle]}>
          <Orb
            state={view.orbState}
            level={view.level}
            size={theme.touch.primary}
            onPress={view.onOrbPress}
            accessibilityLabel={view.statusText}
            intro={orbIntro}
          />
        </Animated.View>
        <Animated.View style={[styles.status, stage.statusStyle]}>
          {stage.landed ? (
            <Animated.View key={view.statusText} entering={statusIn}>
              <AppText
                variant={TextVariant.Status}
                color={theme.colors[STATUS_COLOR[view.orbState]]}
              >
                {view.statusText}
              </AppText>
            </Animated.View>
          ) : null}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

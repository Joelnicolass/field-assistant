import { useEffect, useState } from 'react';

import { useDependencies } from '@/di/useDependencies';
import { ButtonVariant } from '@/shared/presentation/components/AppButton/ButtonVariant';
import { IconName } from '@/shared/presentation/components/Icon/IconName';
import type { InfoCardProps } from '@/shared/presentation/components/InfoCard';
import { Tone } from '@/shared/presentation/theme/Tone';
import { CARD_TEXT } from './constants';
import { button } from './replies/cardView';
import { useAppVisible } from './useAppVisible';

type NoticeCard = InfoCardProps & { key: string };

/**
 * Si el teléfono no tiene voz en español, la tarjeta que lo avisa, con "Instalar voz" y la cruz.
 * Se consulta al abrir y cada vez que la app vuelve a la vista: si la instalaron, se va sola.
 */
export function useSpanishVoiceNotice(): NoticeCard[] {
  const { spanishVoice } = useDependencies();
  const visible = useAppVisible();
  const [missing, setMissing] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (visible) {
      void spanishVoice.isInstalled().then(
        (installed) => setMissing(!installed),
        () => undefined,
      );
    }
  }, [visible, spanishVoice]);

  if (!missing || closed) {
    return [];
  }
  const install = () => void spanishVoice.openInstaller();
  return [
    {
      key: 'missing-voice',
      icon: IconName.Alert,
      label: CARD_TEXT.missingVoice,
      tone: Tone.Warning,
      message: CARD_TEXT.missingVoiceMessage,
      hint: CARD_TEXT.missingVoiceHint,
      buttons: [button('install', CARD_TEXT.installVoice, ButtonVariant.Primary, install)],
      onClose: () => setClosed(true),
    },
  ];
}

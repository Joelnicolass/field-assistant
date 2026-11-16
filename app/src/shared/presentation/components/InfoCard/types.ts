import type { ButtonVariant, Countdown } from '@/shared/presentation/components/AppButton';
import type { IconName } from '@/shared/presentation/components/Icon';
import type { Tone } from '@/shared/presentation/theme/Tone';

export type InfoCardRow = { key: string; label: string; value: string; share?: number };

export type InfoCardButton = {
  key: string;
  label: string;
  variant: ButtonVariant;
  onPress: () => void;
  countdown?: Countdown;
};

export type InfoCardProps = {
  icon: IconName;
  label: string;
  tone: Tone;
  big?: { value: string; unit: string };
  message?: string;
  hint?: string;
  route?: { from: string; to: string };
  rows?: InfoCardRow[];
  examples?: string[];
  buttons?: InfoCardButton[];
  heard?: string;
  onClose?: () => void;
};

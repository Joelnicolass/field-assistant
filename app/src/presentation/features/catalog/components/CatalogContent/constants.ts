import { ThemeMode } from '@/shared/presentation/theme/ThemeMode';
import { Tone } from '@/shared/presentation/theme/Tone';

export const TITLE = 'Catálogo';
export const TOGGLE_LABEL: Record<ThemeMode, string> = {
  [ThemeMode.Light]: 'Pasar a oscuro',
  [ThemeMode.Dark]: 'Pasar a claro',
};
export const SECTION = { texts: 'Textos', icons: 'Íconos', surfaces: 'Superficies' } as const;
export const SAMPLE_TEXT = 'Llovieron 18 mm';
export const ICON_SIZE = 28;
export const TONE_LABEL: Record<Tone, string> = {
  [Tone.Brand]: 'Marca',
  [Tone.Warning]: 'Aviso',
  [Tone.Danger]: 'Peligro',
};

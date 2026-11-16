import { OrbState } from '@/shared/presentation/components/Orb/OrbState';
import type { Theme, ThemeColors } from '@/shared/presentation/theme/Theme';
import { ThemeMode } from '@/shared/presentation/theme/ThemeMode';
import { Tone } from '@/shared/presentation/theme/Tone';
import { DURATIONS, RADII, SPACING, TOUCH } from '@/shared/presentation/theme/tokens';
import { FONT_FAMILY, TEXT_VARIANTS } from '@/shared/presentation/theme/typography';

const TONES: Theme['tones'] = {
  [Tone.Brand]: ['#3CCC6C', '#3C9C54', '#6C9CE4'],
  [Tone.Warning]: ['#FCCC54', '#E4B454', '#FC8454'],
  [Tone.Danger]: ['#FC8454', '#F0284A', '#C21DA0'],
};

// Los colores del orbe son los mismos en los dos temas (VISUAL 5.2).
const ORB: Theme['orb'] = {
  [OrbState.Idle]: {
    core: ['#62DE88', '#3C9C54', '#1F4D4A'],
    blobs: ['#6C9CE4', '#FCCC54', '#FC8454'],
    ring: ['#FCCC54', '#3CCC6C', '#6C9CE4', '#FC8454'],
    glow: '#3CB46C',
  },
  [OrbState.Listening]: {
    core: ['#FFD36B', '#FC8454', '#B3263F'],
    blobs: ['#FF4D7A', '#FCCC54', '#FF6A2B'],
    ring: ['#FCCC54', '#FC8454', '#FF4D7A', '#B13DFF'],
    glow: '#FC7A4A',
  },
  [OrbState.Thinking]: {
    core: ['#A5CBF7', '#5B8FE6', '#27336E'],
    blobs: ['#8E6CF0', '#4FC3F0', '#F06CC8'],
    ring: ['#6C9CE4', '#4F6FE8', '#8E6CF0', '#F06CC8'],
    glow: '#6C9CE4',
  },
  [OrbState.Speaking]: {
    core: ['#9BEFA9', '#2FB877', '#1F5E5A'],
    blobs: ['#6C9CE4', '#D8F06A', '#3CCC6C'],
    ring: ['#D8F06A', '#3CCC6C', '#4FC3F0', '#6C9CE4'],
    glow: '#3CCC6C',
  },
};

const LIGHT_COLORS: ThemeColors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSoft: '#EDF6F0',
  hairline: 'rgba(17, 28, 43, 0.10)',
  text: '#111C2B',
  textMuted: '#4A5871',
  brand: '#00751F',
  onBrand: '#FFFFFF',
  warning: '#8A6914',
  danger: '#B3141F',
};

const DARK_COLORS: ThemeColors = {
  background: '#000000',
  surface: '#0F1722',
  surfaceSoft: '#1A2533',
  hairline: 'rgba(226, 238, 245, 0.14)',
  text: '#F3F8F5',
  textMuted: '#A7B4C4',
  brand: '#4ADE80',
  onBrand: '#04140A',
  warning: '#FCCC54',
  danger: '#FF7A7A',
};

const SHARED = {
  typography: { family: FONT_FAMILY, variants: TEXT_VARIANTS },
  spacing: SPACING,
  radii: RADII,
  durations: DURATIONS,
  touch: TOUCH,
  tones: TONES,
  orb: ORB,
};

export const THEMES: Record<ThemeMode, Theme> = {
  [ThemeMode.Light]: {
    ...SHARED,
    mode: ThemeMode.Light,
    colors: LIGHT_COLORS,
    shadows: { card: '0 12px 32px rgba(17, 60, 40, 0.16)' },
  },
  [ThemeMode.Dark]: {
    ...SHARED,
    mode: ThemeMode.Dark,
    colors: DARK_COLORS,
    // Sobre negro una sombra no se ve: en oscuro es un resplandor verde.
    shadows: { card: '0 0 36px rgba(60, 204, 108, 0.18)' },
  },
};

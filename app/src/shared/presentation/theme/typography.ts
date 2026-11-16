import { TextVariant } from '@/shared/presentation/theme/TextVariant';

export const FONT_FAMILY = 'PlusJakartaSans';

export type TextVariantSpec = {
  size: number;
  lineHeight?: number;
  weight: '500' | '600' | '700' | '800';
  letterSpacing?: number;
  italic?: boolean;
  tabular?: boolean;
  uppercase?: boolean;
};

export const TEXT_VARIANTS: Record<TextVariant, TextVariantSpec> = {
  [TextVariant.Display]: {
    size: 68,
    lineHeight: 74,
    weight: '800',
    letterSpacing: -2,
    tabular: true,
  },
  [TextVariant.DisplayUnit]: { size: 26, weight: '700' },
  [TextVariant.Message]: { size: 25, lineHeight: 31, weight: '800', letterSpacing: -0.3 },
  [TextVariant.Title]: { size: 22, lineHeight: 28, weight: '800', letterSpacing: -0.4 },
  [TextVariant.TileValue]: { size: 25, weight: '800', letterSpacing: -0.4, tabular: true },
  [TextVariant.LotNumber]: { size: 26, lineHeight: 30, weight: '800', tabular: true },
  [TextVariant.Subtitle]: { size: 20, lineHeight: 26, weight: '700' },
  [TextVariant.Button]: { size: 20, weight: '800' },
  [TextVariant.RowValue]: { size: 20, weight: '800', tabular: true },
  [TextVariant.Caption]: { size: 19, lineHeight: 24, weight: '600' },
  [TextVariant.Noted]: { size: 17, lineHeight: 22, weight: '700' },
  [TextVariant.RowLabel]: { size: 16, weight: '600' },
  [TextVariant.Hint]: { size: 16, lineHeight: 22, weight: '500' },
  [TextVariant.Status]: { size: 15, weight: '700' },
  [TextVariant.Example]: { size: 15, lineHeight: 20, weight: '600', italic: true },
  [TextVariant.Heard]: { size: 15, lineHeight: 20, weight: '500', italic: true },
  [TextVariant.LotHead]: { size: 15, weight: '800', tabular: true },
  [TextVariant.Place]: { size: 13, lineHeight: 18, weight: '500' },
  [TextVariant.Overline]: { size: 13, weight: '800', letterSpacing: 1.3, uppercase: true },
  [TextVariant.Pill]: { size: 13, weight: '800' },
  [TextVariant.TileLabel]: { size: 12.5, lineHeight: 16, weight: '600' },
  [TextVariant.LotTag]: { size: 11, weight: '800', letterSpacing: 1.2, uppercase: true },
  [TextVariant.LotName]: { size: 11, weight: '700' },
};

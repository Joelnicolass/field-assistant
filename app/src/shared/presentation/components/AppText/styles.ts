import type { TextStyle } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';
import { textStyle } from '@/shared/presentation/theme/textStyle';
import type { TextVariant } from '@/shared/presentation/theme/TextVariant';

export function createStyles(theme: Theme) {
  return {
    text: (variant: TextVariant): TextStyle => textStyle(theme, variant),
  };
}

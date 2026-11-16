import type { TextStyle } from 'react-native';

import type { Theme } from '@/shared/presentation/theme/Theme';
import type { TextVariant } from '@/shared/presentation/theme/TextVariant';

export function createStyles(theme: Theme) {
  return {
    text: (variant: TextVariant): TextStyle => {
      const spec = theme.typography.variants[variant];
      return {
        fontFamily: theme.typography.family,
        fontSize: spec.size,
        lineHeight: spec.lineHeight,
        fontWeight: spec.weight,
        letterSpacing: spec.letterSpacing,
        fontStyle: spec.italic ? 'italic' : 'normal',
        fontVariant: spec.tabular ? ['tabular-nums'] : undefined,
        textTransform: spec.uppercase ? 'uppercase' : 'none',
        color: theme.colors.text,
        // Android suma arriba y abajo el espacio de los acentos de la fuente y baja el texto.
        includeFontPadding: false,
      };
    },
  };
}

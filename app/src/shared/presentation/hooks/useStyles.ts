import type { Theme } from '@/shared/presentation/theme/Theme';
import { useTheme } from '@/shared/presentation/hooks/useTheme';

/** Arma los estilos de un componente con el tema activo, a partir de su createStyles. */
export function useStyles<T>(createStyles: (theme: Theme) => T): T {
  return createStyles(useTheme());
}

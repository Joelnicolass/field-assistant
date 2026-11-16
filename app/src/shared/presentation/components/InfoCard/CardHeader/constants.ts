import { IconName } from '@/shared/presentation/components/Icon';
import { popIn } from '../animations';

export const BADGE_SIZE = 34;
export const BADGE_ICON_SIZE = 19;
export const CLOSE_SIZE = 32;
export const CLOSE_ICON_SIZE = 16;
export const CLOSE_HIT_SLOP = 14;
export const CLOSE_LABEL = 'Cerrar';

/** El tilde de "anotado" crece de 0,92 a 1 al entrar (VISUAL 4.6); los demás distintivos no se mueven. */
export const BADGE_ENTERING: Partial<Record<IconName, typeof popIn>> = { [IconName.Check]: popIn };

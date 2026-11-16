import { withTiming } from 'react-native-reanimated';

import { EASING } from '@/shared/presentation/theme/motion';
import { DURATIONS } from '@/shared/presentation/theme/tokens';
import { STATUS_RISE } from './constants';

const STATUS_MS = DURATIONS.text;

/** El texto de estado que cambia entra subiendo 5 en `text` (VISUAL 4.6). */
export function statusIn() {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ translateY: STATUS_RISE }] },
    animations: {
      opacity: withTiming(1, { duration: STATUS_MS, easing: EASING.enter }),
      transform: [{ translateY: withTiming(0, { duration: STATUS_MS, easing: EASING.enter }) }],
    },
  };
}

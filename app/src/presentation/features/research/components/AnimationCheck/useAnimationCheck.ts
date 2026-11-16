import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { BLOCK_MS, DISTANCE, DURATION_MS } from './constants';

function readOffset(offset: SharedValue<number>): number {
  'worklet';
  return offset.get();
}

function blockJavaScript() {
  const until = Date.now() + BLOCK_MS;
  while (Date.now() < until) {
    continue;
  }
}

export function useAnimationCheck() {
  const offset = useSharedValue(0);

  const directStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.get() }],
  }));
  const indirectStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: readOffset(offset) }],
  }));

  function move() {
    offset.set(withTiming(offset.get() === 0 ? DISTANCE : 0, { duration: DURATION_MS }));
  }

  return { directStyle, indirectStyle, move, blockJavaScript };
}

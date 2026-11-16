import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { CheckCard } from '../CheckCard';
import { BLOCK_JS, LINES, MOVE, TITLE } from './constants';
import { styles } from './styles';
import { useAnimationCheck } from './useAnimationCheck';

export function AnimationCheck() {
  const { directStyle, indirectStyle, move, blockJavaScript } = useAnimationCheck();

  return (
    <CheckCard
      title={TITLE}
      view={{
        lines: LINES,
        actions: [
          { key: 'move', label: MOVE, onPress: move },
          { key: 'block', label: BLOCK_JS, onPress: blockJavaScript },
        ],
      }}
    >
      <View style={styles.track}>
        <Animated.View style={[styles.box, directStyle]} />
        <Animated.View style={[styles.box, indirectStyle]} />
      </View>
    </CheckCard>
  );
}

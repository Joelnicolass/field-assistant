import { View } from 'react-native';

import { CheckCard } from '../CheckCard';
import { LINES, TITLE } from './constants';
import { styles } from './styles';

export function DrawingCheck() {
  return (
    <CheckCard title={TITLE} view={{ lines: LINES, actions: [] }}>
      <View style={styles.row}>
        <View style={styles.linear} />
        <View style={styles.radial} />
        <View style={styles.shadow} />
        <View style={styles.blur} />
      </View>
    </CheckCard>
  );
}

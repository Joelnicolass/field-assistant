import { StyleSheet } from 'react-native';

import { FADE_HEIGHT } from '../constants';

export const styles = StyleSheet.create({
  fade: { position: 'absolute', left: 0, right: 0, height: FADE_HEIGHT },
  top: { top: 0 },
  bottom: { bottom: 0 },
});

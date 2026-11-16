import { StyleSheet } from 'react-native';

const SWATCH = { width: 64, height: 64, borderRadius: 12 } as const;

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 16,
    padding: 12,
  },
  linear: {
    ...SWATCH,
    backgroundImage: 'linear-gradient(135deg, #3CCC6C 0%, #3C9C54 50%, #6C9CE4 100%)',
  },
  radial: {
    ...SWATCH,
    backgroundImage: 'radial-gradient(circle at 34% 28%, #62DE88 0%, #3C9C54 46%, #1F4D4A 100%)',
  },
  shadow: {
    ...SWATCH,
    backgroundColor: '#ffffff',
    boxShadow: '0 12px 32px rgba(17, 60, 40, 0.4)',
  },
  blur: {
    ...SWATCH,
    backgroundColor: '#FC8454',
    filter: 'blur(6px)',
  },
});

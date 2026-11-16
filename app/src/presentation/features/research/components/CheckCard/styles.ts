import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    backgroundColor: '#00751f',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { styles } from './styles';
import type { CheckView } from './types';

type CheckCardProps = {
  title: string;
  view: CheckView;
  children?: ReactNode;
};

export function CheckCard({ title, view, children }: CheckCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.actions}>
        {view.actions.map((action) => (
          <Pressable
            key={action.key}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            onPress={action.onPress}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
      {children}
      {view.lines.map((line) => (
        <Text key={line}>{line}</Text>
      ))}
    </View>
  );
}

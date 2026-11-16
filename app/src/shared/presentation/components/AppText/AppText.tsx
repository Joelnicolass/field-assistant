import type { ReactNode } from 'react';
import { Text } from 'react-native';

import { useStyles } from '@/shared/presentation/hooks/useStyles';
import type { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { createStyles } from './styles';

type AppTextProps = {
  variant: TextVariant;
  color?: string;
  numberOfLines?: number;
  children: ReactNode;
};

export function AppText({ variant, color, numberOfLines, children }: AppTextProps) {
  const styles = useStyles(createStyles);
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[styles.text(variant), color === undefined ? null : { color }]}
    >
      {children}
    </Text>
  );
}

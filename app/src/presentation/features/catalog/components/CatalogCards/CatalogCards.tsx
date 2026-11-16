import { View } from 'react-native';

import { InfoCard } from '@/shared/presentation/components/InfoCard';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { CATALOG_CARDS } from './constants';
import { createStyles } from './styles';

export function CatalogCards() {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.cards}>
      {CATALOG_CARDS.map(({ key, ...card }) => (
        <InfoCard key={key} {...card} />
      ))}
    </View>
  );
}

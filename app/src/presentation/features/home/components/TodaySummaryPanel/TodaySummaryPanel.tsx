import Animated from 'react-native-reanimated';

import { useStyles } from '@/shared/presentation/hooks/useStyles';
import type { TodaySummaryView } from '../../hooks/todaySummaryView';
import { SummaryData } from '../SummaryData';
import { SummaryHeader } from '../SummaryHeader';
import { SummaryLots } from '../SummaryLots';
import { SummaryNoted } from '../SummaryNoted';
import { DIMMED_OPACITY, HIDDEN_RISE } from './constants';
import { createStyles } from './styles';

type TodaySummaryPanelProps = {
  summary: TodaySummaryView;
  /** Con una tarjeta en pantalla: sin lotes y con los datos en cuadros sueltos. */
  compact: boolean;
  dimmed: boolean;
  /** Durante la entrada del logo el resumen no se ve; al terminar, baja a su lugar. */
  hidden: boolean;
  pendingCount: number;
  sending: boolean;
  onPendingPress: () => void;
  onOpenCatalog: () => void;
};

// Escondido no se ve; apagado se ve poco, para que la atención vaya a la voz.
function panelOpacity(hidden: boolean, dimmed: boolean): number {
  if (hidden) {
    return 0;
  }
  return dimmed ? DIMMED_OPACITY : 1;
}

export function TodaySummaryPanel(props: TodaySummaryPanelProps) {
  const { summary, compact, dimmed, hidden, pendingCount, sending, onPendingPress, onOpenCatalog } =
    props;
  const styles = useStyles(createStyles);

  return (
    <Animated.View
      style={[
        styles.panel,
        styles.fade,
        {
          opacity: panelOpacity(hidden, dimmed),
          transform: [{ translateY: hidden ? HIDDEN_RISE : 0 }],
        },
      ]}
    >
      <SummaryHeader
        place={summary.place}
        pendingCount={pendingCount}
        sending={sending}
        onPendingPress={onPendingPress}
        onOpenCatalog={onOpenCatalog}
      />
      <SummaryNoted text={summary.noted.text} anything={summary.noted.anything} />
      <SummaryData tiles={summary.tiles} compact={compact} />
      {compact ? null : <SummaryLots lots={summary.lots} activeLots={summary.activeLots} />}
    </Animated.View>
  );
}

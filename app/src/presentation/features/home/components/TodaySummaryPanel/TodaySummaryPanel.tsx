import Animated from 'react-native-reanimated';

import { useStyles } from '@/shared/presentation/hooks/useStyles';
import type { TodaySummaryView } from '../../hooks/todaySummaryView';
import { SummaryData } from '../SummaryData';
import { SummaryHeader } from '../SummaryHeader';
import { SummaryLots } from '../SummaryLots';
import { SummaryNoted } from '../SummaryNoted';
import { DIMMED_OPACITY } from './constants';
import { createStyles } from './styles';

type TodaySummaryPanelProps = {
  summary: TodaySummaryView;
  /** Con una tarjeta en pantalla: sin lotes y con los datos en cuadros sueltos. */
  compact: boolean;
  dimmed: boolean;
  pendingCount: number;
  sending: boolean;
  onOpenCatalog: () => void;
};

export function TodaySummaryPanel(props: TodaySummaryPanelProps) {
  const { summary, compact, dimmed, pendingCount, sending, onOpenCatalog } = props;
  const styles = useStyles(createStyles);

  return (
    <Animated.View style={[styles.panel, styles.fade, { opacity: dimmed ? DIMMED_OPACITY : 1 }]}>
      <SummaryHeader
        place={summary.place}
        pendingCount={pendingCount}
        sending={sending}
        onOpenCatalog={onOpenCatalog}
      />
      <SummaryNoted text={summary.noted.text} anything={summary.noted.anything} />
      <SummaryData tiles={summary.tiles} compact={compact} />
      {compact ? null : <SummaryLots lots={summary.lots} activeLots={summary.activeLots} />}
    </Animated.View>
  );
}

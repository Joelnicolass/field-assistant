import { View } from 'react-native';

import { TodaySummaryPanel } from '@/presentation/features/home/components/TodaySummaryPanel';
import { VoiceStage } from '@/presentation/features/voice/components/VoiceStage';
import { AppText } from '@/shared/presentation/components/AppText';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { SAMPLE_SUMMARY, STAGES, SUMMARY_TITLE } from './constants';
import { createStyles } from './styles';

function doNothing() {}

export function CatalogStage() {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.section}>
      <AppText variant={TextVariant.Overline}>{SUMMARY_TITLE.full}</AppText>
      <View style={styles.bleed}>
        <TodaySummaryPanel
          summary={SAMPLE_SUMMARY}
          compact={false}
          dimmed={false}
          pendingCount={0}
          sending={false}
          onPendingPress={doNothing}
          onOpenCatalog={doNothing}
        />
      </View>
      <AppText variant={TextVariant.Overline}>{SUMMARY_TITLE.compact}</AppText>
      <View style={styles.bleed}>
        <TodaySummaryPanel
          summary={SAMPLE_SUMMARY}
          compact
          dimmed={false}
          pendingCount={2}
          sending={false}
          onPendingPress={doNothing}
          onOpenCatalog={doNothing}
        />
      </View>
      {STAGES.map((stage) => (
        <View key={stage.key} style={styles.section}>
          <AppText variant={TextVariant.Overline}>{stage.title}</AppText>
          <View style={styles.stage}>
            <VoiceStage view={stage.view} />
          </View>
        </View>
      ))}
    </View>
  );
}

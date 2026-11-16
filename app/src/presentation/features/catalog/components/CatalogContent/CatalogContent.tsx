import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/shared/presentation/components/AppText';
import { Icon, IconName } from '@/shared/presentation/components/Icon';
import { Surface } from '@/shared/presentation/components/Surface';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import type { ThemeMode } from '@/shared/presentation/theme/ThemeMode';
import { Tone } from '@/shared/presentation/theme/Tone';
import { CatalogButtons } from '../CatalogButtons';
import { CatalogCards } from '../CatalogCards';
import { CatalogOrb } from '../CatalogOrb';
import { ICON_SIZE, SAMPLE_TEXT, SECTION, TITLE, TOGGLE_LABEL, TONE_LABEL } from './constants';
import { createStyles } from './styles';

type CatalogContentProps = { mode: ThemeMode; onToggleMode: () => void };

export function CatalogContent({ mode, onToggleMode }: CatalogContentProps) {
  const styles = useStyles(createStyles);
  const theme = useTheme();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant={TextVariant.Farm}>{TITLE}</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={TOGGLE_LABEL[mode]}
          onPress={onToggleMode}
          style={styles.toggle}
        >
          <AppText variant={TextVariant.Pill}>{TOGGLE_LABEL[mode]}</AppText>
        </Pressable>

        <AppText variant={TextVariant.Overline}>{SECTION.orb}</AppText>
        <CatalogOrb />

        <AppText variant={TextVariant.Overline}>{SECTION.texts}</AppText>
        {Object.values(TextVariant).map((variant) => (
          <AppText key={variant} variant={variant}>
            {`${variant} · ${SAMPLE_TEXT}`}
          </AppText>
        ))}

        <AppText variant={TextVariant.Overline}>{SECTION.icons}</AppText>
        <View style={styles.row}>
          {Object.values(IconName).map((name) => (
            <Icon key={name} name={name} size={ICON_SIZE} color={theme.colors.text} />
          ))}
        </View>

        <AppText variant={TextVariant.Overline}>{SECTION.surfaces}</AppText>
        {Object.values(Tone).map((tone) => (
          <Surface key={tone} tone={tone}>
            <AppText variant={TextVariant.Overline} color={theme.colors.textMuted}>
              {TONE_LABEL[tone]}
            </AppText>
            <AppText variant={TextVariant.Display}>18</AppText>
          </Surface>
        ))}

        <AppText variant={TextVariant.Overline}>{SECTION.buttons}</AppText>
        <CatalogButtons />

        <AppText variant={TextVariant.Overline}>{SECTION.cards}</AppText>
        <CatalogCards />
      </ScrollView>
    </SafeAreaView>
  );
}

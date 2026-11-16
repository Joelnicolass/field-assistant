import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootScreen } from '@/core/configs/RootScreen';
import type { RootStackParamList } from '@/presentation/navigation/RootStackParamList';
import { AppButton, ButtonVariant } from '@/shared/presentation/components/AppButton';
import { AppText } from '@/shared/presentation/components/AppText';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { MicrophoneAccess } from '../MicrophoneAccess';
import { SpeechCalibrator } from '../SpeechCalibrator';
import { ThemeSetting } from '../ThemeSetting';
import { SETTINGS_TEXT } from './constants';
import { createStyles } from './styles';

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, RootScreen.Settings>;

/** Los ajustes: el umbral de voz, calibrado en el lugar, el permiso del micrófono y el catálogo del DS. */
export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const styles = useStyles(createStyles);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppText variant={TextVariant.Title}>{SETTINGS_TEXT.title}</AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={SETTINGS_TEXT.back}
            onPress={navigation.goBack}
            style={styles.back}
          >
            <AppText variant={TextVariant.Pill}>{SETTINGS_TEXT.back}</AppText>
          </Pressable>
        </View>
        <SpeechCalibrator />
        <ThemeSetting />
        <MicrophoneAccess />
        <AppButton
          label={SETTINGS_TEXT.designSystem}
          variant={ButtonVariant.Secondary}
          onPress={() => navigation.navigate(RootScreen.Catalog)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

import { View } from 'react-native';

import { AppButton, ButtonVariant } from '@/shared/presentation/components/AppButton';
import { AppText } from '@/shared/presentation/components/AppText';
import { useStyles } from '@/shared/presentation/hooks/useStyles';
import { useTheme } from '@/shared/presentation/hooks/useTheme';
import { TextVariant } from '@/shared/presentation/theme/TextVariant';
import { CalibrationStep } from '../../hooks/CalibrationStep';
import { useCalibration } from '../../hooks/useCalibration';
import { CALIBRATOR_TEXT, STEP_TEXT } from './constants';
import { createStyles } from './styles';

const MEASURING = [CalibrationStep.Ambient, CalibrationStep.Voice];

/** Mide el ambiente y la voz, propone un umbral y lo guarda. */
export function SpeechCalibrator() {
  const styles = useStyles(createStyles);
  const theme = useTheme();
  const calibration = useCalibration();
  const { step, level, current, proposal } = calibration;
  const shown = step === CalibrationStep.Ready ? proposal : current;

  return (
    <View style={styles.panel}>
      <AppText variant={TextVariant.Noted}>{CALIBRATOR_TEXT.title}</AppText>
      <AppText variant={TextVariant.Hint} color={theme.colors.textMuted}>
        {CALIBRATOR_TEXT.explain}
      </AppText>
      {current === null ? null : (
        <AppText variant={TextVariant.RowValue}>{CALIBRATOR_TEXT.current(current)}</AppText>
      )}
      <View style={styles.meter}>
        <View style={[styles.fill, { width: `${level * 100}%` }]} />
        {shown === null ? null : <View style={[styles.marker, { left: `${shown * 100}%` }]} />}
      </View>
      <AppText variant={TextVariant.Hint} color={theme.colors.textMuted}>
        {STEP_TEXT[step]}
      </AppText>
      {proposal === null || step !== CalibrationStep.Ready ? null : (
        <AppText variant={TextVariant.RowValue}>{CALIBRATOR_TEXT.proposal(proposal)}</AppText>
      )}
      <CalibratorButtons calibration={calibration} />
    </View>
  );
}

function CalibratorButtons({ calibration }: { calibration: ReturnType<typeof useCalibration> }) {
  const styles = useStyles(createStyles);
  const { step, calibrate, save } = calibration;
  if (MEASURING.includes(step)) {
    return null;
  }
  const ready = step === CalibrationStep.Ready;
  return (
    <View style={styles.buttons}>
      {ready ? (
        <AppButton
          label={CALIBRATOR_TEXT.save}
          variant={ButtonVariant.Primary}
          onPress={() => void save()}
        />
      ) : null}
      <AppButton
        label={step === CalibrationStep.Idle ? CALIBRATOR_TEXT.start : CALIBRATOR_TEXT.again}
        variant={ready ? ButtonVariant.Secondary : ButtonVariant.Primary}
        onPress={() => void calibrate()}
      />
    </View>
  );
}

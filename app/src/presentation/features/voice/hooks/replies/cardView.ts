import type { DateText } from '@/domain/entities/DateText';
import type { LastRecord } from '@/domain/entities/LastRecord';
import type { Receipt } from '@/domain/entities/Receipt';
import { AnimalCategory } from '@/domain/enums/AnimalCategory';
import { RecordKind } from '@/domain/enums/RecordKind';
import { ResolutionKind } from '@/domain/enums/ResolutionKind';
import { ButtonVariant } from '@/shared/presentation/components/AppButton/ButtonVariant';
import type { Countdown } from '@/shared/presentation/components/AppButton/types';
import { IconName } from '@/shared/presentation/components/Icon/IconName';
import type { InfoCardProps } from '@/shared/presentation/components/InfoCard';
import { withThousands } from '@/shared/presentation/format/withThousands';
import { Tone } from '@/shared/presentation/theme/Tone';
import {
  VoiceCardKind,
  type AnswerCard,
  type ProposalCard,
  type ProposalResolution,
  type VoiceCard,
} from '../../states/VoiceCard';
import { CARD_TEXT, RAIN_PERIOD, SPOKEN } from '../constants';
import { failureReply } from './spokenReply';
import {
  animalsText,
  categoryLabel,
  categoryName,
  dayHint,
  dayLabel,
  millimetersText,
  monthName,
  weekdayAndDay,
} from './phrases';

export type CardActions = {
  confirm: (card: ProposalCard) => void;
  cancel: () => void;
  close: () => void;
  discard: (id: number) => void;
  openSettings: () => void;
};

export type CardContext = {
  actions: CardActions;
  today: DateText;
  /** La cuenta de "Anotar"; sin ella, el botón espera un toque. */
  countdown: Countdown | undefined;
};

type Body = Omit<InfoCardProps, 'tone'>;

// Cada tabla tiene una función por valor del enum, y cada una recibe solo su variante de la unión
// (patrón de uniones correlacionadas de TypeScript, #47109): si falta un caso, no compila.
type LastRecordByKind = { [K in RecordKind]: Extract<LastRecord, { kind: K }> };
type LastRecordOf<K extends RecordKind> = { [P in K]: LastRecordByKind[P] }[K];
type ReceiptByKind = { [K in RecordKind]: Extract<Receipt, { kind: K }> };
type ReceiptOf<K extends RecordKind> = { [P in K]: ReceiptByKind[P] }[K];
type ProposalKind = ProposalResolution['kind'];
type ProposalByKind = { [K in ProposalKind]: Extract<ProposalResolution, { kind: K }> };
type ProposalOf<K extends ProposalKind> = { [P in K]: ProposalByKind[P] }[K];
type CardByKind = { [K in VoiceCardKind]: Extract<VoiceCard, { kind: K }> };
type CardOf<K extends VoiceCardKind> = { [P in K]: CardByKind[P] }[K];

const millimeters = (value: number) => ({
  value: withThousands(value),
  unit: CARD_TEXT.millimetersUnit,
});

const CORRECTION_BODY: {
  [K in RecordKind]: (target: LastRecordByKind[K], quantity: number) => Body;
} = {
  [RecordKind.Rain]: ({ record }, quantity) => ({
    icon: IconName.Rain,
    label: CARD_TEXT.rainCorrection,
    big: millimeters(quantity),
    hint: CARD_TEXT.previously(millimetersText(record.millimeters)),
  }),
  [RecordKind.Movement]: ({ movement }, quantity) => ({
    icon: IconName.Move,
    label: CARD_TEXT.movementCorrection,
    big: { value: withThousands(quantity), unit: categoryName(quantity, movement.category) },
    route: { from: String(movement.fromLot), to: String(movement.toLot) },
    hint: CARD_TEXT.previously(animalsText(movement.quantity, movement.category)),
  }),
};

const PROPOSAL_BODY: {
  [K in ProposalKind]: (resolution: ProposalByKind[K], today: DateText) => Body;
} = {
  [ResolutionKind.RainProposal]: ({ proposal }, today) => ({
    icon: IconName.Rain,
    label: CARD_TEXT.rainProposal,
    big: millimeters(proposal.millimeters),
    hint: dayHint(proposal.date, today),
  }),
  [ResolutionKind.MovementProposal]: ({ proposal }) => ({
    icon: IconName.Move,
    label: CARD_TEXT.movementProposal,
    big: {
      value: withThousands(proposal.quantity),
      unit: categoryName(proposal.quantity, proposal.category),
    },
    route: { from: String(proposal.fromLot), to: String(proposal.toLot) },
  }),
  [ResolutionKind.CorrectionProposal]: ({ proposal }) =>
    correctionBody(proposal.target, proposal.quantity),
};

const RECEIPT_BODY: {
  [K in RecordKind]: (receipt: ReceiptByKind[K], today: DateText) => Body;
} = {
  [RecordKind.Rain]: ({ record, monthTotal }, today) => ({
    icon: IconName.Check,
    label: CARD_TEXT.receipt,
    big: millimeters(record.millimeters),
    hint: dayHint(record.date, today),
    rows: [
      {
        key: 'month',
        label: CARD_TEXT.rainTitle(monthName(record.date)),
        value: millimetersText(monthTotal),
      },
    ],
  }),
  [RecordKind.Movement]: ({ movement, remainingInOrigin }) => ({
    icon: IconName.Check,
    label: CARD_TEXT.receipt,
    big: {
      value: withThousands(movement.quantity),
      unit: categoryName(movement.quantity, movement.category),
    },
    route: { from: String(movement.fromLot), to: String(movement.toLot) },
    rows: [
      {
        key: 'remaining',
        label: CARD_TEXT.remainingInOrigin(movement.fromLot),
        value: animalsText(remainingInOrigin, movement.category),
      },
    ],
  }),
};

function rainAnswerView(
  { summary }: Extract<AnswerCard, { kind: VoiceCardKind.RainAnswer }>,
  today: DateText,
): InfoCardProps {
  const period = RAIN_PERIOD[summary.range](monthName(today));
  return {
    icon: IconName.Rain,
    label: CARD_TEXT.rainTitle(period),
    tone: Tone.Brand,
    big: millimeters(summary.total),
    rows: summary.days.map((day) => ({
      key: day.date,
      label: dayLabel(day.date),
      value: millimetersText(day.millimeters),
    })),
  };
}

function lotAnswerView({
  stock,
}: Extract<AnswerCard, { kind: VoiceCardKind.LotAnswer }>): InfoCardProps {
  const categories = Object.values(AnimalCategory).filter(
    (category) => stock.byCategory[category] > 0,
  );
  const most = Math.max(...categories.map((category) => stock.byCategory[category]));
  return {
    icon: IconName.Question,
    label: CARD_TEXT.lot(stock.lot),
    tone: Tone.Brand,
    big: { value: withThousands(stock.total), unit: CARD_TEXT.heads },
    rows: categories.map((category) => ({
      key: category,
      label: categoryLabel(category),
      value: withThousands(stock.byCategory[category]),
      share: stock.byCategory[category] / most,
    })),
  };
}

function button(
  key: string,
  label: string,
  variant: ButtonVariant,
  onPress: () => void,
  countdown?: Countdown,
) {
  return { key, label, variant, onPress, countdown };
}

function proposalButtons(card: ProposalCard, { actions, countdown }: CardContext) {
  return [
    button('note', CARD_TEXT.note, ButtonVariant.Primary, () => actions.confirm(card), countdown),
    button('cancel', CARD_TEXT.cancel, ButtonVariant.Secondary, actions.cancel),
  ];
}

function correctionBody<K extends RecordKind>(target: LastRecordOf<K>, quantity: number): Body {
  return CORRECTION_BODY[target.kind](target, quantity);
}

function proposalBody<K extends ProposalKind>(resolution: ProposalOf<K>, today: DateText): Body {
  return PROPOSAL_BODY[resolution.kind](resolution, today);
}

function receiptBody<K extends RecordKind>(receipt: ReceiptOf<K>, today: DateText): Body {
  return RECEIPT_BODY[receipt.kind](receipt, today);
}

const CARD_VIEWS: {
  [K in VoiceCardKind]: (card: CardByKind[K], context: CardContext) => InfoCardProps;
} = {
  [VoiceCardKind.Proposal]: (card, context) => ({
    ...proposalBody(card.resolution, context.today),
    tone: Tone.Brand,
    buttons: proposalButtons(card, context),
    heard: card.heard,
  }),
  [VoiceCardKind.Receipt]: ({ receipt }, { today, actions }) => ({
    ...receiptBody(receipt, today),
    tone: Tone.Brand,
    onClose: actions.close,
  }),
  [VoiceCardKind.RainAnswer]: (card, { today, actions }) => ({
    ...rainAnswerView(card, today),
    onClose: actions.close,
  }),
  [VoiceCardKind.LotAnswer]: (card, { actions }) => ({
    ...lotAnswerView(card),
    onClose: actions.close,
  }),
  [VoiceCardKind.Question]: ({ question }, { actions }) => ({
    icon: IconName.Question,
    label: CARD_TEXT.question,
    tone: Tone.Brand,
    message: question ?? SPOKEN.askAgain,
    onClose: actions.close,
  }),
  [VoiceCardKind.Rejected]: ({ failure }, { actions }) => ({
    icon: IconName.Alert,
    label: CARD_TEXT.rejected,
    tone: Tone.Danger,
    message: failureReply(failure),
    onClose: actions.close,
  }),
  [VoiceCardKind.NotUnderstood]: (_card, { actions }) => ({
    icon: IconName.Alert,
    label: CARD_TEXT.notUnderstood,
    tone: Tone.Warning,
    message: CARD_TEXT.notUnderstoodMessage,
    examples: SPOKEN.examples,
    onClose: actions.close,
  }),
  [VoiceCardKind.MicrophoneDenied]: (_card, { actions }) => ({
    icon: IconName.MicrophoneOff,
    label: CARD_TEXT.microphoneDenied,
    tone: Tone.Warning,
    message: CARD_TEXT.microphoneDeniedMessage,
    hint: CARD_TEXT.microphoneDeniedHint,
    buttons: [
      button('settings', CARD_TEXT.openSettings, ButtonVariant.Primary, actions.openSettings),
    ],
    onClose: actions.close,
  }),
  [VoiceCardKind.AudioSaved]: (_card, { actions }) => ({
    icon: IconName.Offline,
    label: CARD_TEXT.audioSaved,
    tone: Tone.Warning,
    message: CARD_TEXT.audioSavedMessage,
    hint: CARD_TEXT.audioSavedHint,
    onClose: actions.close,
  }),
  [VoiceCardKind.SavedProposal]: (card, context) => ({
    ...proposalBody(card.resolution, context.today),
    icon: IconName.Offline,
    label: CARD_TEXT.saved,
    hint: CARD_TEXT.savedOn(weekdayAndDay(card.recordedOn)),
    tone: Tone.Brand,
    buttons: [
      button('note', CARD_TEXT.note, ButtonVariant.Primary, () => context.actions.confirm(card)),
      button('discard', CARD_TEXT.discard, ButtonVariant.Secondary, () =>
        context.actions.discard(card.id),
      ),
    ],
  }),
  [VoiceCardKind.SavedAnswer]: ({ id, answer }, context) => ({
    ...cardView(answer, context),
    onClose: () => context.actions.discard(id),
  }),
  [VoiceCardKind.SavedNotUnderstood]: ({ id }, { actions }) => ({
    icon: IconName.Alert,
    label: CARD_TEXT.saved,
    tone: Tone.Warning,
    message: CARD_TEXT.savedNotUnderstood,
    buttons: [
      button('discard', CARD_TEXT.discard, ButtonVariant.Secondary, () => actions.discard(id)),
    ],
  }),
};

/** Arma lo que dibuja la tarjeta del turno a partir de sus datos. */
export function cardView<K extends VoiceCardKind>(
  card: CardOf<K>,
  context: CardContext,
): InfoCardProps {
  return CARD_VIEWS[card.kind](card, context);
}

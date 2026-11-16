export enum VoiceEvent {
  OrbPressed = 'orb_pressed',
  /** Manos libres oyó la frase: en reposo es igual que un toque. */
  PhraseDetected = 'phrase_detected',
  PermissionDenied = 'permission_denied',
  /** Hay audio con voz. */
  ListeningFinished = 'listening_finished',
  NothingHeard = 'nothing_heard',
  /** Hay una resolución. */
  Understood = 'understood',
  /** El audio fue a la cola. */
  UnderstandingFailed = 'understanding_failed',
  SpeechFinished = 'speech_finished',
  /** Un toque en "Anotar" o el fin de la cuenta. */
  ProposalConfirmed = 'proposal_confirmed',
  ProposalCancelled = 'proposal_cancelled',
  WentToBackground = 'went_to_background',
  /** Un error que nadie esperaba. */
  Failed = 'failed',
  CardClosed = 'card_closed',
}

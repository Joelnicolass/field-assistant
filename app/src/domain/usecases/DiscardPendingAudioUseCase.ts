export type DiscardPendingAudioUseCaseInput = { id: number };

/** Saca un audio de la cola y borra su archivo. */
export interface DiscardPendingAudioUseCase {
  execute(input: DiscardPendingAudioUseCaseInput): Promise<void>;
}

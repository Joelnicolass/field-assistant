export type CountPendingAudiosUseCaseInput = {
  /** Los audios que ya se entendieron: no cuentan. */
  alreadyResolved: number[];
};

/** Cuenta los audios guardados que esperan señal, sin mandar ninguno. */
export interface CountPendingAudiosUseCase {
  execute(input: CountPendingAudiosUseCaseInput): Promise<number>;
}

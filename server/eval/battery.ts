import { readFile } from 'node:fs/promises';
import { setTimeout as wait } from 'node:timers/promises';

import { GeminiAudioInterpreter } from '../src/data/GeminiAudioInterpreter.ts';
import type { Interpretation } from '../src/domain/Interpretation.ts';
import { CASES, type EvalCase } from './cases.ts';

// La batería le manda cada caso al modelo real, con el mismo intérprete que la ruta, y compara
// lo entendido con lo esperado. Espera entre casos para no pasar el límite de pedidos por minuto.
const WAIT_MS = Number(process.env.EVAL_WAIT_MS) || 5000;
const REFERENCE_DAY = '2026-11-16';
const AUDIOS = new URL('./audios/', import.meta.url);

const interpreter = new GeminiAudioInterpreter(process.env.GEMINI_API_KEY ?? '');
// EVAL_ONLY=05a-mover-terneros,20-clima corre solo esos casos.
const only = process.env.EVAL_ONLY?.split(',');
const selected = only === undefined ? CASES : CASES.filter(({ audio }) => only.includes(audio));

type Outcome = {
  evalCase: EvalCase;
  ms: number;
  got: Interpretation | null;
  error: string | null;
  /** Cuántas veces falló el proveedor antes de contestar (o de rendirse). */
  providerFailures: number;
};

// La batería mide si el modelo entiende: si el proveedor no contesta, se reintenta.
const ATTEMPTS = 3;

function failedFields({ expected }: EvalCase, got: Interpretation): string[] {
  const { question, ...fields } = expected;
  const wrong = Object.entries(fields)
    .filter(([key, value]) => got[key as keyof Interpretation] !== value)
    .map(([key]) => key);
  return (got.question !== null) === question ? wrong : [...wrong, 'question'];
}

function dataOf(got: Interpretation): string {
  const { intent, transcript, question, ...rest } = got;
  return Object.entries(rest)
    .filter(([, value]) => value !== null)
    .map(([key, value]) => `${key}=${value}`)
    .join(' ');
}

async function attempt(evalCase: EvalCase, audio: Buffer) {
  const startedAt = performance.now();
  try {
    const got = await interpreter.interpret({
      audio,
      mimeType: 'audio/mp4',
      history: evalCase.history,
      referenceDay: REFERENCE_DAY,
    });
    return { got, error: null, ms: Math.round(performance.now() - startedAt) };
  } catch (error) {
    return { got: null, error: String(error), ms: Math.round(performance.now() - startedAt) };
  }
}

async function run(evalCase: EvalCase): Promise<Outcome> {
  const audio = await readFile(new URL(`${evalCase.audio}.m4a`, AUDIOS));
  let result = await attempt(evalCase, audio);
  let providerFailures = 0;
  while (result.got === null && providerFailures < ATTEMPTS - 1) {
    providerFailures += 1;
    await wait(WAIT_MS);
    result = await attempt(evalCase, audio);
  }
  return {
    evalCase,
    ...result,
    providerFailures: providerFailures + (result.got === null ? 1 : 0),
  };
}

const outcomes: Outcome[] = [];
for (const [index, evalCase] of selected.entries()) {
  if (index > 0) {
    await wait(WAIT_MS);
  }
  const outcome = await run(evalCase);
  outcomes.push(outcome);
  const { got, error, ms } = outcome;
  const wrong = got === null ? ['(falló)'] : failedFields(evalCase, got);
  console.log(
    [
      wrong.length === 0 ? 'OK ' : 'MAL',
      evalCase.said,
      got === null ? error : `"${got.transcript}"`,
      got?.intent ?? '',
      got === null ? '' : dataOf(got),
      got?.question ?? '',
      `${ms} ms`,
      outcome.providerFailures === 0 ? '' : `proveedor falló ${outcome.providerFailures}`,
      wrong.length === 0 ? '' : `difiere: ${wrong.join(', ')}`,
    ].join(' | '),
  );
}

const passed = outcomes.filter(
  ({ evalCase, got }) => got !== null && failedFields(evalCase, got).length === 0,
);
const times = outcomes
  .filter(({ got }) => got !== null)
  .map(({ ms }) => ms)
  .sort((a, b) => a - b);
const median = times[Math.floor(times.length / 2)] ?? 0;
const providerFailures = outcomes.reduce((sum, outcome) => sum + outcome.providerFailures, 0);
const unanswered = outcomes.filter(({ got }) => got === null).length;
console.log(
  `\nAciertos: ${passed.length} de ${outcomes.length}. ` +
    `Latencia: mínima ${times[0] ?? 0} ms, mediana ${median} ms, máxima ${times.at(-1) ?? 0} ms. ` +
    `Fallas del proveedor: ${providerFailures} (casos sin respuesta tras ${ATTEMPTS} intentos: ${unanswered}).`,
);
